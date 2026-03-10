const Staff = require("../models/staffModel");
const Supplier = require("../models/supplierModel");
const Stock = require("../models/stockModel");
const StockFlow = require("../models/stockFlowModel");
const Purchase = require("../models/purchaseModel");
const { Op } = require("sequelize");
const sequelize = require("../config/db");

const purchaseItem = async (req, res) => {
  const {
    quantity,
    unitPrice,
    purchasePrice,
    paymentStatus,
    paymentMethod,
    invoiceNumber,
    amountPaid,
    amountRemaining,
    totalAmount,
    product,
    supplierId,
  } = req.body;
  const purchasedBy = req.staff.id;
  const t = await sequelize.transaction();
  try {
    const stock = await Stock.findOne({
      where: { name: product },
      transaction: t,
    });
    if (!stock) {
      await t.rollback();
      return res.status(404).json({
        message: "error, product not found, kindly add product in product list",
      });
    }
    if (stock.price != unitPrice) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "error, unit price does not match product price" });
    }

    stock.stock = Number(stock.stock) + Number(quantity);
    stock.updatedAt = new Date();
    await stock.save({ transaction: t });

    const stockRecord = await StockFlow.create(
      {
        stockId: stock.id,
        quantity,
        movementType: "purchase",
        flowType: "in",
        oldStock: stock.stock - Number(quantity),
        newStock: stock.stock,
        doneBy: purchasedBy,
      },
      { transaction: t },
    );

    const purchase = await Purchase.create(
      {
        totalAmount,
        quantity,
        unitPrice,
        purchasePrice,
        paymentStatus,
        paymentMethod,
        invoiceNumber,
        amountPaid,
        amountRemaining,
        purchasedBy,
        productId: stock.id,
        supplierId,
      },
      { transaction: t },
    );
    const result = await Purchase.findOne({
      where: { id: purchase.id },
      include: [
        { model: Stock, attributes: ["name"] },
        { model: Supplier, attributes: ["name"] },
        { model: Staff, attributes: ["name"] },
      ],
      transaction: t,
    });
    await t.commit();
    res.status(200).json({
      message: "purchase made successfully",

      purchase: result,
    });
    // console.log("Request body:", req.body);
    // console.log("Request params:", req.params);
    if (!purchase) {
      await t.rollback();
      return res
        .status(404)
        .json({ message: "error, purchase not made successfully" });
    }
  } catch (error) {
    await t.rollback();
    console.error("Error processing purchase:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  purchaseItem,
};
