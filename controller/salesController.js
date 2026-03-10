const User = require("../models/userModel");
const Staff = require("../models/staffModel");
const Stock = require("../models/stockModel");
const Order = require("../models/orderModel");
const Payment = require("../models/paymentModel");
const crypto = require("crypto");
const Sale = require("../models/salesModel");
const SaleItems = require("../models/salesitemsModel");
const sequelize = require("../config/db");

exports.createSale = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const userStatus = req.user.status;
    if (userStatus !== "active") {
      await t.rollback();
      return res.status(403).json({ error: "User account is not active" });
    }
    const invoice = `INV-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const orderId = `ORD-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const {
      paymentMethod,
      totalAmount,
      discount,
      taxRate,
      shippingAddress,
      billingAddress,
      payOnDelivery,
      items,
    } = req.body;
    const sale = await Sale.create(
      {
        paymentMethod,
        totalAmount,
        discount,
        customerId: userId,
        taxRate,
        saleDate: new Date(),
        invoice,
        paymentStatus: "pending",
        payOnDelivery: !!payOnDelivery,
      },
      { transaction: t },
    );
    const order = await Order.create(
      {
        saleId: sale.id,
        userId,
        shippingAddress,
        billingAddress,
        orderDate: new Date(),
        orderNumber: orderId,
        totalAmount,
        status: "pending",
        payOnDelivery: !!payOnDelivery,
      },
      { transaction: t },
    );

    for (const item of items) {
      const stockItem = await Stock.findByPk(item.productId, {
        transaction: t,
      });
      if (!stockItem) {
        await t.rollback();
        return res
          .status(404)
          .json({ error: `Product with ID ${item.productId} not found` });
      }
      const availableStock = stockItem.stock - stockItem.reserved;
      if (availableStock < item.quantity) {
        await t.rollback();
        return res
          .status(400)
          .json({ error: `Insufficient stock for product ${stockItem.name}` });
      }
      await SaleItems.create(
        {
          saleId: sale.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice:
            item.quantity * item.unitPrice - (item.stockDiscount || 0),
          discount: item.stockDiscount || 0,
          orderId: order.id,
        },
        { transaction: t },
      );
      if (payOnDelivery) {
        stockItem.stock -= item.quantity;
      } else {
        stockItem.reserved += item.quantity;
      }
      await stockItem.save({ transaction: t });
    }
    await t.commit();
    //send notification to user about the new sale

    // Emit real-time update to clients about the new sale
    res.status(201).json({ sale, order });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};
exports.makePayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const transactionId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const { saleId, orderId, paymentMethod, reference } = req.body;
    const sale = await Sale.findByPk(saleId, { transaction: t });
    if (!sale) {
      await t.rollback();
      return res.status(404).json({ error: "Sale not found" });
    }
    if (sale.paymentStatus === "paid") {
      await t.rollback();
      return res.status(400).json({ error: "Sale is already paid" });
    }
    const order = await Order.findByPk(orderId, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: "Order not found" });
    }
    const existingPayment = await Payment.findOne({
      where: { saleId, orderId, paymentStatus: "paid" },
      transaction: t,
    });
    if (existingPayment) {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "Payment already exists for this sale and order" });
    }

    const payment = await Payment.create(
      {
        userId: sale.customerId,
        saleId,
        orderId,
        paymentMethod,
        amount: sale.totalAmount,
        reference,
        transactionId,
        paymentDate: new Date(),
        paymentStatus: "pending",
      },
      { transaction: t },
    );
    order.status = "processing";
    order.updatedAt = new Date();
    await order.save({ transaction: t });
    await t.commit();
    res.status(201).json({ payment, sale, order });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
};

exports.confirmOrder = async (req, res) => {
  try {
    const staffId = req.staff.id;
    const { status } = req.body;
    const { orderId } = req.params;
    const order = await Order.findOne({
      where: { id: orderId },
    });
    console.log("Current order ID:", order.id, "Requested order ID:", orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    const allowedTransitions = {
      pending: ["processing", "cancelled"],
      processing: ["shipped", "pending", "cancelled"],
      shipped: ["delivered", "processing", "cancelled"],
      delivered: [],
      cancelled: [],
    };
    if (!allowedTransitions[order.status].includes(status)) {
      return res.status(400).json({
        error: `Invalid status transition from ${order.status} to ${status}`,
      });
    }

    order.status = status;
    order.updatedAt = new Date();
    order.confirmedBy = staffId;
    await order.save();

    if (order.status === "delivered") {
      order.deliveryDate = new Date();
      await order.save();

      if (order.payOnDelivery) {
        const sale = await Sale.findByPk(order.saleId);
        if (sale) {
          sale.paymentStatus = "paid";
          await sale.save();
          const existingPayment = await Payment.findOne({
            where: {
              saleId: sale.id,
              orderId: order.id,
              paymentStatus: "completed",
            },
          });
          if (existingPayment) {
            return res.status(400).json({
              error: "Payment already exists for this sale and order",
            });
          }
          await Payment.create({
            userId: order.userId,
            saleId: sale.id,
            orderId: order.id,
            paymentMethod: "pay on delivery",
            amount: sale.totalAmount,
            reference: `POD-${Date.now()}`,
            transactionId: `POD-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
            paymentDate: new Date(),
            paymentStatus: "completed",
          });
        }
      }
    }
    //Send notification to user about order status update

    res.json({ order, message: "Order confirmed successfully" });
  } catch (error) {
    console.error("Error confirming order:", error);
    res.status(500).json({ error: error.message });
  }
};

//get pay on delivery orders for staff
exports.getPayOnDeliveryOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { payOnDelivery: true, status: "pending" },
      include: [
        { model: Sale },
        { model: User, attributes: ["id", "fullName", "email"] },
      ],
    });
    res.json({ orders });
  } catch (error) {
    console.error("Error fetching pay on delivery orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

exports.cancelorder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, { transaction: t });

    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: "Order not found" });
    }
    if (order.status === "cancelled") {
      await t.rollback();
      return res.status(400).json({ error: "Order is already cancelled" });
    }
    if (
      order.status === "delivered" &&
      order.deliveryDate < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    ) {
      await t.rollback();
      return res.status(400).json({
        error:
          "Delivered order cannot be cancelled after 14 days from delivery",
      });
    }
    const sale = await Sale.findByPk(order.saleId, { transaction: t });

    sale.paymentStatus = "cancelled";
    order.status = "cancelled";
    order.confirmedBy = req.user.id || req.staff.id || null;
    order.updatedAt = new Date();

    await sale.save({ transaction: t });
    await order.save({ transaction: t });
    await t.commit();
    res.json({ order, message: "Order cancelled successfully" });
    //Send notification to user and staff about order cancellation
  } catch (error) {
    await t.rollback();
    console.error("Error cancelling order:", error);
    res.status(500).json({ error: "Failed to cancel order" });
  }
};

exports.returnOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { orderId } = req.params;
    const order = await Order.findByPk(orderId, { transaction: t });
    if (!order) {
      await t.rollback();
      return res.status(404).json({ error: "Order not found" });
    }

    if (
      order.status === "delivered" &&
      order.deliveryDate < new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    ) {
      await t.rollback();
      return res.status(400).json({
        error: "Order cannot be returned after 14 days from delivery",
      });
    }
    if (order.returned) {
      await t.rollback();
      return res.status(400).json({ error: "Order has already been returned" });
    }
    const sale = await Sale.findByPk(order.saleId, { transaction: t });
    const user = await User.findByPk(order.userId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!sale || !user) {
      await t.rollback();
      return res.status(404).json({ error: "Sale or user not found" });
    }
    const saleItems = await SaleItems.findAll({
      where: { saleId: sale.id, orderId: order.id },
      transaction: t,
    });
    for (const item of saleItems) {
      const stockItem = await Stock.findByPk(item.productId, {
        transaction: t,
      });
      if (stockItem) {
        if (order.payOnDelivery) {
          stockItem.stock = Math.max(0, stockItem.stock + item.quantity);
        }
        if (
          order.status === "delivered" &&
          order.deliveryDate >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        ) {
          stockItem.stock = Math.max(0, stockItem.stock + item.quantity);
        }
        if (!order.payOnDelivery && order.status === "pending") {
          stockItem.reserved = Math.max(0, stockItem.reserved - item.quantity);
        }
        if (
          !order.payOnDelivery &&
          (order.status === "processing" || order.status === "shipped")
        ) {
          stockItem.stock = Math.max(0, stockItem.stock + item.quantity);
        }

        await stockItem.save({ transaction: t });
      }
    }

    const payment = await Payment.findOne({
      where: { saleId: sale.id, orderId: order.id },
      transaction: t,
    });

    if (payment && payment.paymentStatus === "completed") {
      payment.paymentStatus = "refunded";
      await payment.save({ transaction: t });
      user.accountBalance =
        parseFloat(user.accountBalance) + parseFloat(payment.amount);
      await user.save({ transaction: t });
    }

    order.returned = true;
    sale.returned = true;
    await sale.save({ transaction: t });
    order.updatedAt = new Date();
    await order.save({ transaction: t });
    //Send notification to user about order return
    await t.commit();
    res.json({ order, message: "Order return initiated successfully" });
  } catch (error) {
    await t.rollback();
    console.error("Error returning order:", error);
    res.status(500).json({ error: "Failed to return order" });
  }
};
