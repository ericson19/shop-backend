const { initializePayment } = require("../services/paystackService");
const Sale = require("../models/salesModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Payment = require("../models/paymentModel");
const Stock = require("../models/stockModel");
const SaleItems = require("../models/salesitemsModel");
const axios = require("axios");
const sequelize = require("../config/db");

const crypto = require("crypto");

exports.makePayment = async (req, res) => {
  try {
    const { saleId, orderId } = req.body;
    const sale = await Sale.findByPk(saleId);
    const order = await Order.findByPk(orderId);
    const user = await User.findByPk(sale.customerId);
    if (!sale || !order || !user) {
      return res.status(404).json({ error: "Sale, Order, or User not found" });
    }
    const reference = `PAY-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const paymentData = {
      email: user.email,
      amount: sale.totalAmount * 100,
      reference,
    };
    const paystackResponse = await initializePayment(paymentData);
    if (paystackResponse.status) {
      const payment = await Payment.create({
        userId: sale.customerId,
        saleId,
        orderId,
        amount: sale.totalAmount,
        paymentMethod: "paystack",
        paymentStatus: "pending",
        reference,
        transactionId: reference,
        paymentDate: new Date(),
      });
      res.status(200).json({
        authorizationUrl: paystackResponse.authorization_url,
        reference,
      });
    } else {
      res.status(500).json({ error: "Failed to initialize payment" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.verifyPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { reference } = req.query;
    const payment = await Payment.findOne(
      { where: { reference } },
      { transaction: t },
    );

    if (!payment) {
      await t.rollback();
      return res.status(404).json({ error: "Payment not found" });
    }
    if (payment.paymentStatus === "completed") {
      await t.rollback();
      return res.status(400).json({ error: "Payment is already verified" });
    }
    const order = await Order.findByPk(payment.orderId, { transaction: t });
    if (order.status === "processing") {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "Order is already being processed" });
    }
    const sale = await Sale.findByPk(payment.saleId, { transaction: t });
    if (sale.paymentStatus === "paid") {
      await t.rollback();
      return res.status(400).json({ error: "Sale is already paid" });
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    let saleItems = await SaleItems.findAll({
      where: { saleId: payment.saleId },
      transaction: t,
    });
    if (!response.data.data || response.data.data.status !== "success") {
      for (const item of saleItems) {
        const stock = await Stock.findByPk(item.productId, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (stock) {
          stock.reserved = Math.max(0, stock.reserved - item.quantity);
          await stock.save({ transaction: t });
        }
      }
      sale.paymentStatus = "failed";
      order.status = "cancelled";
      await sale.save({ transaction: t });
      await order.save({ transaction: t });
      await t.commit();

      return res.status(400).json({ error: "Payment verification failed" });
    }
    for (const item of saleItems) {
      const stock = await Stock.findByPk(item.productId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (stock) {
        stock.reserved = Math.max(0, stock.reserved - item.quantity);
        stock.stock = Math.max(0, stock.stock - item.quantity);
        await stock.save({ transaction: t });
      }
    }

    payment.paymentStatus = "completed";
    sale.paymentStatus = "paid";
    order.status = "processing";

    await payment.save({ transaction: t });
    await sale.save({ transaction: t });
    await order.save({ transaction: t });
    await t.commit();
    res.status(200).json({ message: "Payment verified successfully" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};
//admin can make manual payment for customer without using paystack
// exports.makeManualPayment = async (req, res) => {
//   try {
//     const { saleId, orderId, paymentMethod, status } = req.body;
//     const reference = `MANUAL-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
//     const sale = await Sale.findByPk(saleId);
//     const order = await Order.findByPk(orderId);
//     if (!sale || !order) {
//       return res.status(404).json({ error: "Sale or Order not found" });
//     }
//     const payment = await Payment.create({
//       userId: sale.customerId,
//       saleId,
//       orderId,
//       paymentMethod,
//       amount: sale.totalAmount,
//       reference,
//       transactionId: reference,
//       paymentDate: new Date(),
//       paymentStatus: status,
//     });
//     order.status = "processing";
//     await order.save();
//     res.status(201).json({ payment, sale, order });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
exports.makeManualPayment = async (req, res) => {
  try {
    const { saleId, orderId, paymentMethod, screenshot, amount } = req.body;
    const reference = `MANUAL-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const sale = await Sale.findByPk(saleId);
    const order = await Order.findByPk(orderId);
    const existingPayment = await Payment.findOne({
      where: {
        saleId,
        orderId,
        paymentStatus: "pending",
        paymentMethod: "manual",
      },
    });
    if (existingPayment) {
      return res.status(400).json({
        error:
          "A pending manual payment already exists for this sale and order",
      });
    }
    if (!sale || !order) {
      return res.status(404).json({ error: "Sale or Order not found" });
    }
    if (amount && Number(amount) !== Number(sale.totalAmount)) {
      return res
        .status(400)
        .json({ error: "Amount does not match the sale total amount" });
    }

    const payment = await Payment.create({
      userId: sale.customerId,
      saleId,
      orderId,
      paymentMethod,
      amount: sale.totalAmount,
      reference,
      transactionId,
      paymentDate: new Date(),
      paymentStatus: "pending",
      screenshot,
    });
    order.status = "pending";
    await order.save();
    res.status(201).json({ payment, sale, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.approveManualPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findOne({
      where: { id: paymentId, paymentMethod: "manual" },
    });
    if (!payment) {
      console.error("Payment not found with ID:", paymentId);
      return res.status(404).json({ error: "Payment not found" });
    }
    if (payment.paymentStatus !== "pending") {
      return res
        .status(400)
        .json({ error: "Only pending payments can be approved" });
    }
    if (payment.paymentMethod !== "manual") {
      return res
        .status(400)
        .json({ error: "Only manual payments can be approved" });
    }
    if (payment.paymentStatus === "completed") {
      return res.status(400).json({ error: "Payment is already approved" });
    }
    payment.paymentStatus = "completed";
    const sale = await Sale.findByPk(payment.saleId);
    const order = await Order.findByPk(payment.orderId);

    if (!sale) {
      return res.status(404).json({ error: "Sale not found" });
    }
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    sale.paymentStatus = "paid";
    order.status = "processing";
    const saleItems = await SaleItems.findAll({ where: { saleId: sale.id } });
    for (const item of saleItems) {
      const stock = await Stock.findByPk(item.productId);
      if (stock) {
        stock.stock = Math.max(0, stock.stock - item.quantity);
        stock.reserved = Math.max(0, stock.reserved - item.quantity);
        await stock.save();
      }
    }
    await sale.save();
    await order.save();
    await payment.save();
    res
      .status(200)
      .json({ message: "Payment approved successfully", payment, sale, order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//admin can reject manual payment and ask customer to upload new screenshot
exports.rejectManualPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findOne({
      where: { id: paymentId, paymentMethod: "manual" },
    });
    if (!payment) {
      console.error("Payment not found with ID:", paymentId);
      return res.status(404).json({ error: "Payment not found" });
    }
    if (payment.paymentStatus !== "pending") {
      return res
        .status(400)
        .json({ error: "Only pending payments can be rejected" });
    }
    if (payment.paymentMethod !== "manual") {
      return res
        .status(400)
        .json({ error: "Only manual payments can be rejected" });
    }
    payment.paymentStatus = "failed";
    await payment.save();
    res.status(200).json({ message: "Payment rejected successfully", payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//make payment with account balance and update order status to processing immediately without using paystack
exports.payWithBalance = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { saleId, orderId } = req.body;
    const sale = await Sale.findByPk(saleId);
    const order = await Order.findByPk(orderId);
    const user = await User.findByPk(userId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!sale || !order) {
      await t.rollback();
      return res.status(404).json({ error: "Sale or Order not found" });
    }
    if (sale.totalAmount > user.balance) {
      await t.rollback();
      return res.status(400).json({ error: "Insufficient balance" });
    }
    const reference = `BALANCE-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const existingPayment = await Payment.findOne({
      where: {
        saleId,
        orderId,
        paymentStatus: "completed",
        paymentMethod: "balance",
      },
      transaction: t,
    });
    if (existingPayment) {
      await t.rollback();
      return res
        .status(400)
        .json({
          error:
            "A completed balance payment already exists for this sale and order",
        });
    }

    const payment = await Payment.create(
      {
        userId,
        saleId,
        orderId,
        amount: sale.totalAmount,
        paymentMethod: "balance",
        paymentStatus: "completed",
        reference,
        transactionId,
        paymentDate: new Date(),
      },
      { transaction: t },
    );
    const saleItems = await SaleItems.findAll({
      where: { saleId },
      transaction: t,
    });
    for (const item of saleItems) {
      const stock = await Stock.findByPk(item.productId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (stock) {
        stock.stock = Math.max(0, Number(stock.stock) - Number(item.quantity));
        stock.reserved = Math.max(
          0,
          Number(stock.reserved) - Number(item.quantity),
        );
        await stock.save({ transaction: t });
      }
    }
    user.accountBalance -= Number(sale.totalAmount);
    await user.save({ transaction: t });
    order.status = "processing";
    await order.save({ transaction: t });
    sale.paymentStatus = "paid";
    await sale.save({ transaction: t });
    await t.commit();
    res
      .status(200)
      .json({ message: "Payment successful", payment, sale, order });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findByPk(paymentId, {
      include: [
        { model: Sale, as: "sale" },
        { model: Order, as: "order" },
      ],
    });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.status(200).json({ payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.findAll({
      where: { userId },
      include: [
        { model: Sale, as: "sale" },
        { model: Order, as: "order" },
      ],
    });
    res.status(200).json({ payments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
