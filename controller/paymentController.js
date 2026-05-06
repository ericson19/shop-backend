const Flutterwave = require("flutterwave-node-v3");

const { initializePayment } = require("../services/paystackService");
const {
  flutterwaveInitializePayment,
} = require("../services/flutterwaveServices");
const Sale = require("../models/salesModel");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const Payment = require("../models/paymentModel");
const Stock = require("../models/stockModel");
const SaleItems = require("../models/salesitemsModel");
const axios = require("axios");
const sequelize = require("../config/db");
const MailSender = require("../utils/sendEmail");
const { OrderConfirmationTemplate } = require("../services/mailTemplates");

const crypto = require("crypto");
const { Op, or } = require("sequelize");

// Initialize Paystack payment and create a pending payment record in the database
exports.makePayment = async (req, res) => {
  try {
    const { saleId, orderId } = req.body;
    const sale = await Sale.findByPk(saleId);
    const order = await Order.findByPk(orderId);
    const user = await User.findByPk(sale.customerId);
    if (!sale || !order) {
      return res.status(404).json({ error: "Sale, Order, or User not found" });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const reference = `PAY-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const paymentData = {
      email: user.email,
      amount: parseInt(sale.totalAmount * 100),
      reference,
      callback_url: `${process.env.DOMAIN_URL}/paystack-success`,
    };
    console.log("Initiating Paystack payment with data:", paymentData);

    const paystackResponse = await initializePayment(paymentData);
    if (paystackResponse.status) {
      const payment = await Payment.create({
        userId: sale.customerId,
        saleId,
        orderId,
        amount: parseInt(sale.totalAmount * 100),
        paymentMethod: "paystack",
        paymentStatus: "pending",
        reference,
        transactionId: reference,
        paymentDate: new Date(),
      });
      res.status(200).json({
        authorizationUrl: paystackResponse.data.authorization_url,
        reference,
      });
    } else {
      res.status(500).json({ error: "Failed to initialize payment" });
    }
  } catch (error) {
    console.error("Error initiating payment:", error);
    res.status(500).json({ error: error.message });
  }
};

// Verify Paystack payment and update payment, sale, and order records accordingly
exports.verifyPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { reference } = req.params;
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

    //send notification to user about the new sale
    // await MailSender(
    //   "ericanox@gmail.com",
    //   "Order Confirmation",
    //   OrderConfirmationTemplate(order.id, order.status, order.totalAmount),
    // );

    await payment.save({ transaction: t });
    await sale.save({ transaction: t });
    await order.save({ transaction: t });
    await t.commit();
    res.status(200).json({ message: "Payment verified successfully" });
  } catch (error) {
    await t.rollback();
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.flutterwaveMakePayment = async (req, res) => {
  try {
    const { saleId, orderId } = req.body;
    const sale = await Sale.findByPk(saleId);
    const order = await Order.findByPk(orderId);
    const user = await User.findByPk(sale.customerId);
    if (!sale || !order) {
      return res.status(404).json({ error: "Sale, Order, or User not found" });
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const reference = `FLW-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const paymentData = {
      email: user.email,
      name: user.fullName,
      amount: parseInt(sale.totalAmount),
      tx_ref: reference,
      redirect_url: `${process.env.DOMAIN_URL}/flutterwave-success`,
    };
    console.log("Initiating Flutterwave payment with data:", paymentData);
    const flutterwaveResponse = await flutterwaveInitializePayment(paymentData);
    if (flutterwaveResponse.data.status === "success") {
      const payment = await Payment.create({
        userId: sale.customerId,
        saleId,
        orderId,
        amount: parseInt(sale.totalAmount),
        paymentMethod: "flutterwave",
        paymentStatus: "pending",
        reference,
        transactionId: reference,
        paymentDate: new Date(),
      });

      res.status(200).json({
        authorizationUrl: flutterwaveResponse.data.data.link,
        reference,
      });
    } else {
      res.status(500).json({ error: "Failed to initialize payment" });
    }
  } catch (error) {
    console.error("Error initiating Flutterwave payment:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.verifyFlutterwavePayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { reference } = req.params;
    const { transaction_id } = req.query;
    const payment = await Payment.findOne({ where: { reference } });
    if (!payment) {
      await t.rollback();
      return res.status(404).json({ error: "Payment not found" });
    }
    if (payment.paymentStatus === "completed") {
      await t.rollback();
      return res.status(400).json({ error: "Payment is already verified" });
    }
    const order = await Order.findByPk(payment.orderId);
    if (order.status === "processing") {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "Order is already being processed" });
    }
    const sale = await Sale.findByPk(payment.saleId);
    if (sale.status === "paid") {
      await t.rollback();
      return res.status(400).json({ error: "Sale is already paid" });
    }
    const saleItems = await SaleItems.findAll({ where: { saleId: sale.id } });

    // Verify payment with Flutterwave API
    const flw = new Flutterwave(
      process.env.FLW_PUBLIC_KEY,
      process.env.FLW_SECRET_KEY,
    );
    const response = await flw.Transaction.verify({ id: transaction_id });

    // If payment verification fails, release reserved stock and update sale and order status to failed/cancelled
    if (
      response.status !== "success" &&
      response.data.status !== "successful"
    ) {
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
    } else {
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

      //send notification to user about the new sale
      // await MailSender(
      //   "ericanox@gmail.com",
      //   "Order Confirmation",
      //   OrderConfirmationTemplate(order.id, order.status, order.totalAmount),
      // );

      await payment.save({ transaction: t });
      await sale.save({ transaction: t });
      await order.save({ transaction: t });
      await t.commit();
      res.status(200).json({ message: "Payment verified successfully" });
    }
  } catch (error) {
    await t.rollback();
    console.error("Error verifying Flutterwave payment:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.makeManualPayment = async (req, res) => {
  try {
    const { saleId, orderId, paymentMethod, screenshot, amount } = req.body;
    const reference = `MANUAL-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const sale = await Sale.findByPk(saleId);
    const order = await Order.findByPk(orderId);
    const screenshotPath = req.file ? req.file.path : null;
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
      screenshot: screenshotPath,
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
      where: { id: paymentId, paymentMethod: ["manual", "manual-funding"] },
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
    if (
      payment.paymentMethod !== "manual" &&
      payment.paymentMethod !== "manual-funding"
    ) {
      return res
        .status(400)
        .json({ error: "Only manual payments can be approved" });
    }
    if (payment.paymentStatus === "completed") {
      return res.status(400).json({ error: "Payment is already approved" });
    }
    if (payment.paymentMethod === "manual-funding") {
      const user = await User.findByPk(payment.userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      payment.paymentStatus = "completed";
      user.accountBalance =
        Number(user.accountBalance) + Number(payment.amount);
      await user.save();
      await payment.save();
    } else if (payment.paymentMethod === "manual") {
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
      //send notification to user about the new sale
      await MailSender(
        "ericanox@gmail.com",
        "Order Confirmation",
        OrderConfirmationTemplate(orderId, order.status, totalAmount),
      );
    }

    res.status(200).json({ message: "Payment approved successfully", payment });
  } catch (error) {
    console.error("Error approving manual payment:", error);
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
    const sale = await Sale.findByPk(payment.saleId);
    const order = await Order.findByPk(payment.orderId);

    sale.paymentStatus = "failed";
    order.status = "cancelled";
    payment.paymentStatus = "failed";

    //notify user about failed order

    await sale.save();
    await order.save();
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
      return res.status(400).json({
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

    //send notification to user about the new sale
    // await MailSender(
    //   "ericanox@gmail.com",
    //   "Order Confirmation",
    //   OrderConfirmationTemplate(orderId, order.status, totalAmount),
    // );

    res
      .status(200)
      .json({ message: "Payment successful", payment, sale, order });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

// Get payment details by payment ID, including associated sale and order information
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findByPk(paymentId, {
      include: [
        { model: User, attributes: ["id", "email", "fullName"] },
        { model: Order, attributes: ["id", "status", "orderNumber"] },
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
    const limit = parseInt(req.query.limit);
    const page = parseInt(req.query.page);

    const payments = await Payment.findAll({
      where: { userId },
      include: [{ model: Sale }, { model: Order }],
      order: [["paymentDate", "DESC"]],
      limit: limit * page,
    });
    res.status(200).json({ payments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getManualPayments = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  try {
    const { count, rows: payments } = await Payment.findAndCountAll({
      where: { paymentMethod: ["manual", "manual-funding"] },
      include: [
        { model: User, attributes: ["id", "email"] },
        { model: Order, attributes: ["id", "status", "orderNumber"] },
      ],
      order: [["paymentDate", "DESC"]],
      limit,
      offset,
    });
    const totalPages = Math.ceil(count / limit);
    res.status(200).json({ payments, totalPages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getManualPaymentByStatus = async (req, res) => {
  const limit = parseInt(req.query.limit);
  const page = parseInt(req.query.page);
  const offset = (page - 1) * limit;
  const { status } = req.params;
  try {
    const { count, rows: payments } = await Payment.findAndCountAll({
      where: { paymentMethod: "manual", paymentStatus: status },
      include: [
        { model: User, attributes: ["id", "email"] },
        { model: Order, attributes: ["id", "status", "orderNumber"] },
      ],
      limit,
      offset,
    });
    const totalPages = Math.ceil(count / limit);
    res.status(200).json({ payments, totalPages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.manualFundAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    const reference = `FUND-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const screenshotPath = req.file ? req.file.path : null;
    const payment = await Payment.create({
      userId,
      amount,
      paymentMethod: "manual-funding",
      paymentStatus: "pending",
      reference,
      transactionId,
      paymentDate: new Date(),
      screenshot: screenshotPath,
    });
    res.status(201).json({ payment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.paystackFundAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount } = req.body;
    const reference = `PS-FUND-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const user = await User.findByPk(userId);
    const paymentData = {
      email: user.email,
      amount: amount * 100,
      reference,
      callback_url: `${process.env.DOMAIN_URL}/paystack-fund-success`,
    };
    const paystackResponse = await initializePayment(paymentData);
    if (paystackResponse.status) {
      const payment = await Payment.create({
        userId,
        amount,
        paymentMethod: "paystack-funding",
        paymentStatus: "pending",
        reference,
        transactionId,
        paymentDate: new Date(),
      });
      res.status(201).json({
        payment,
        authorizationUrl: paystackResponse.data.authorization_url,
      });
    } else {
      res.status(400).json({ error: "Failed to initialize payment" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyFundAccountPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reference } = req.params;
    const payment = await Payment.findOne({ where: { reference } });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (payment.paymentStatus === "completed") {
      return res.status(400).json({ error: "Payment is already verified" });
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
    console.log("Paystack verification response:", response.data);
    if (response.data.data.status === "success") {
      payment.paymentStatus = "completed";
      user.accountBalance =
        Number(user.accountBalance) + Number(payment.amount);
      await user.save();
      await payment.save();
      res.status(200).json({ message: "Payment verified successfully" });
    } else {
      res.status(400).json({ error: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error verifying fund account payment:", error);
    if (error.response && error.response.data) {
      console.error("Error details:", error.response.data);
    }
    res.status(500).json({ error: error.message });
  }
};

exports.flutterwaveFundAccount = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    const tx_ref = `FLW-FUND-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const paymentData = {
      email: user.email,
      name: user.fullName,
      amount: parseInt(amount),
      tx_ref: tx_ref,
      redirect_url: `${process.env.DOMAIN_URL}/flutterwave-fund-success`,
    };
    console.log("Initiating Flutterwave payment with data:", paymentData);
    const flutterwaveResponse = await flutterwaveInitializePayment(paymentData);
    if (flutterwaveResponse.data.status === "success") {
      const payment = await Payment.create({
        userId: user.id,
        saleId: null,
        orderId: null,
        amount: parseInt(amount),
        paymentMethod: "flutterwave-funding",
        paymentStatus: "pending",
        reference: tx_ref,
        transactionId: tx_ref,
        paymentDate: new Date(),
      });

      res.status(200).json({
        authorizationUrl: flutterwaveResponse.data.data.link,
        reference: tx_ref,
        payment,
      });
    } else {
      res.status(500).json({ error: "Failed to initialize payment" });
    }
  } catch (error) {
    console.error("Error initiating Flutterwave payment:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.verifyFlutterwaveFundAccount = async (req, res) => {
  try {
    const { reference } = req.params;
    const { transaction_id } = req.query;
    const payment = await Payment.findOne({ where: { reference } });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    const user = await User.findByPk(payment.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (payment.paymentStatus === "completed") {
      return res.status(400).json({ error: "Payment is already verified" });
    }
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log("Flutterwave verification response:", response.data);
    if (
      response.data.status === "success" &&
      response.data.data.status === "successful"
    ) {
      payment.paymentStatus = "completed";
      user.accountBalance =
        Number(user.accountBalance) + Number(payment.amount);
      await user.save();
      await payment.save();
      res.status(200).json({ message: "Payment verified successfully" });
    } else {
      res.status(400).json({ error: "Payment verification failed" });
    }
  } catch (error) {
    console.error("Error verifying Flutterwave fund account payment:", error);
    res.status(500).json({ error: error.message });
  }
};

//get cancelled payments for admin to return money to customer balance and update order status to cancelled
// exports.getCancelledPayments = async (req, res) => {
//   const limit = parseInt(req.query.limit);
//   const page = parseInt(req.query.page);
//   const offset = (page - 1) * limit;
//   try {
//     const { count, rows: payments } = await Payment.findAndCountAll({
//       where: {
//         [Op.or]: [{ paymentStatus: "failed" }, { paymentStatus: "cancelled" }],
//       },
//       include: [
//         { model: User, attributes: ["id", "email"] },
//         { model: Order, attributes: ["id", "status", "orderNumber"] },
//       ],
//       limit,
//       offset,
//     });
//     const totalPages = Math.ceil(count / limit);
//     res.status(200).json({ payments, totalPages });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
