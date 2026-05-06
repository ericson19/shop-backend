const Staff = require("../models/staffModel");
const StockFlow = require("../models/stockFlowModel");
const Stock = require("../models/stockModel");
const Category = require("../models/categoryModel");
const MainCategory = require("../models/mainCategory");
const SaleItems = require("../models/salesitemsModel");
const Supplier = require("../models/supplierModel");
const Purchase = require("../models/purchaseModel");
const fs = require("fs");
const sequelize = require("../config/db");
const DamagedItem = require("../models/damageModel");
const ReturnVendor = require("../models/returnVendorModel");
const crypto = require("crypto");

const addProduct = async (req, res) => {
  const {
    categoryId,
    name,
    stock,
    barCode,
    price,
    description,
    image,
    video,
    tutorial,
    lowAlert,
    stockDiscount,
  } = req.body;
  const existingProducts = await Stock.findOne({ where: { name } });
  const imagePath = req.files?.image ? req.files.image[0].path : null;
  const videoPath = req.files?.video ? req.files.video[0].path : null;
  try {
    const existingCategory = await Category.findOne({
      where: { id: categoryId },
    });
    if (!existingCategory) {
      return res.status(400).json({ message: "category does not exist" });
    }
    const addedBy = req.staff.name;

    if (existingProducts) {
      existingProducts.stock = Number(existingProducts.stock) + Number(stock);
      existingProducts.updatedAt = new Date();
      await existingProducts.save();
      const stockRecord = await StockFlow.create({
        stockId: existingProducts.id,
        quantity: stock,
        amount: Number(price) * Number(stock),
        movementType: "adjustment",
        flowType: "in",
        oldStock: existingProducts.stock - stock,
        newStock: existingProducts.stock,
        product: existingProducts.name,
        doneBy: req.staff.id,
      });
      if (!stockRecord) {
        return res
          .status(500)
          .json({ message: "Failed to create stock flow record" });
      }
      const result = await StockFlow.findOne({
        where: { id: stockRecord.id },
        include: [
          { model: Stock, attributes: ["name"] },
          { model: Staff, attributes: ["name"] },
        ],
      });

      return res.status(201).json({
        message: "product successfully added",
        product: {
          ...result.toJSON(),
          stock: existingProducts.stock,
          createdAt: existingProducts.createdAt,
          updatedAt: existingProducts.updatedAt,
        },
      });
    }

    const newProd = await Stock.create({
      name,
      categoryId: existingCategory.id,
      stock,
      barCode,
      price,
      description,
      image: imagePath,
      lowAlert,
      addedBy: req.staff.id,
      video: videoPath,
      tutorial,
      stockDiscount,
    });
    if (newProd) {
      const stockRecord = await StockFlow.create({
        stockId: newProd.id,
        quantity: stock,
        amount: Number(price) * Number(stock),
        movementType: "adjustment",
        flowType: "in",
        oldStock: newProd.stock - stock,
        newStock: newProd.stock,
        // product: newProd.name,
        doneBy: req.staff.id,
      });
      if (!stockRecord) {
        return res
          .status(500)
          .json({ message: "Failed to create stock flow record" });
      }
      res.status(201).json({
        message: "product added successfully",
        newProd,
        addedBy: addedBy,
      });
    }
  } catch (error) {
    res.status(501).json({
      message: error.message,
    });
  }
};
const getStocks = async (req, res) => {
  try {
    const { catId } = req.params;
    const stocks = await Stock.findAll({ where: { categoryId: catId } });
    res.status(200).json({ stocks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.findAll({
      include: [
        {
          model: Category,
          attributes: ["name"],
          include: [
            {
              model: MainCategory,
              attributes: ["name"],
            },
          ],
        },
      ],
    });

    res.status(200).json({ stocks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllStocksList = async (req, res) => {
  const limit = parseInt(req.query.limit);
  const page = parseInt(req.query.page);
  const offset = (page - 1) * limit;
  try {
    const { count, rows: stocks } = await Stock.findAndCountAll({
      include: [
        {
          model: Category,
          attributes: ["name"],
          include: [
            {
              model: MainCategory,
              attributes: ["name"],
            },
          ],
        },
      ],
      limit,
      offset,
    });
    const totalPages = Math.ceil(count / limit);
    res.status(200).json({ stocks, totalPages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getStockPerProduct = async (req, res) => {
  try {
    const { stockId } = req.params;
    const stock = await Stock.findOne({ where: { id: stockId } });
    res.status(200).json({ stock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const { stockId } = req.params;
    const fieldAllowed = [
      "name",
      "categoryId",
      "barCode",
      "price",
      "description",
      "image",
      "video",
      "tutorial",
      "lowAlert",
    ];
    const updates = {};
    for (const key of fieldAllowed) {
      if (req.body[key] !== "null" && req.body[key] !== "undefined") {
        updates[key] = req.body[key];
      }
    }
    if (req.files?.image) {
      const product = await Stock.findOne({ where: { id: stockId } });
      if (product.image) {
        if (fs.existsSync(product.image)) {
          fs.unlinkSync(product.image);
        } else {
          console.warn(`Image file not found: ${product.image}`);
        }
      }
      updates.image = req.files.image[0].path;
    }
    if (req.files?.video) {
      const product = await Stock.findOne({ where: { id: stockId } });
      if (product.video) {
        if (fs.existsSync(product.video)) {
          fs.unlinkSync(product.video);
        } else {
          console.warn(`Video file not found: ${product.video}`);
        }
      }
      updates.video = req.files.video[0].path;
    }

    const stock = await Stock.findOne({ where: { id: stockId } });
    if (!stock) {
      return res.status(404).json({ message: "stock not found" });
    }
    await stock.update(updates);
    res.status(200).json({ message: "stock updated successfully", stock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteStock = async (req, res) => {
  try {
    const { stockId } = req.params;
    const salesItem = await SaleItems.findOne({
      where: { productId: stockId },
    });
    if (salesItem) {
      return res
        .status(400)
        .json({ message: "Cannot delete product that have sales records." });
    }
    const purchaseRecord = await Purchase.findOne({
      where: { productId: stockId },
    });
    if (purchaseRecord) {
      return res
        .status(400)
        .json({ message: "Cannot delete product that have purchase records." });
    }
    const stock = await Stock.findOne({ where: { id: stockId } });
    if (!stock) {
      return res.status(404).json({ message: "stock not found" });
    }
    if (stock.image) {
      if (fs.existsSync(stock.image)) {
        fs.unlinkSync(stock.image);
      } else {
        console.warn(`Image file not found: ${stock.image}`);
      }
    }
    if (stock.video) {
      if (fs.existsSync(stock.video)) {
        fs.unlinkSync(stock.video);
      } else {
        console.warn(`Video file not found: ${stock.video}`);
      }
    }
    await stock.destroy();
    res.status(200).json({ message: "stock deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//PURCHASE STOCK, RETURN TO VENDOR, DAMAGED ITEMS, STOCK FLOW HISTORY, LOW STOCK ALERTS, ADJUST STOCK

const purchaseStock = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { productId } = req.params;
    const {
      quantity,
      supplierId,
      purchasePrice,
      unitPrice,
      amountPaid,
      paymentStatus,
      paymentMethod,
    } = req.body;
    const invoiceNumber = `INV-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const supplier = await Supplier.findByPk(supplierId);
    if (!supplier) {
      await t.rollback();
      return res.status(404).json({ message: "Supplier not found" });
    }
    const stock = await Stock.findOne({ where: { id: productId } });
    if (!stock) {
      await t.rollback();
      return res.status(404).json({ message: "stock not found" });
    }
    if (parseFloat(unitPrice) !== parseFloat(stock.price)) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Unit price does not match current stock price" });
    }

    stock.stock = Number(stock.stock) + Number(quantity);
    await stock.save({ transaction: t });
    const purchaseRecord = await Purchase.create(
      {
        productId,
        supplierId,
        quantity,
        purchasePrice,
        unitPrice,
        amountPaid,
        totalAmount: Number(purchasePrice) * Number(quantity),
        amountRemaining:
          Number(purchasePrice) * Number(quantity) - Number(amountPaid),
        paymentStatus,
        invoiceNumber,
        paymentMethod,
        purchasedBy: req.staff.id,
      },
      { transaction: t },
    );

    await StockFlow.create(
      {
        stockId: stock.id,
        quantity,
        amount: Number(purchasePrice) * Number(quantity),
        movementType: "purchase",
        flowType: "in",
        oldStock: stock.stock - quantity,
        newStock: stock.stock,
        amount: Number(purchasePrice) * Number(quantity),
        doneBy: req.staff.id,
      },
      { transaction: t },
    );
    const purchaseDetails = {
      purchaseId: purchaseRecord.id,
      productId,
      supplierId,
      quantity,
      purchasePrice,
      unitPrice,
      amountPaid,
      totalAmount: purchaseRecord.totalAmount,
      amountRemaining: purchaseRecord.amountRemaining,
      paymentStatus: purchaseRecord.paymentStatus,
      invoiceNumber,
      paymentMethod: purchaseRecord.paymentMethod,
      purchasedBy: req.staff.id,
      supplierName: supplier.name,
      productName: stock.name,
    };
    await t.commit();
    res
      .status(200)
      .json({ message: "stock purchased successfully", purchaseDetails });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

//record damaged

const recordDamagedItem = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { productId } = req.params;
    const { quantity, reason, notes } = req.body;
    const stock = await Stock.findOne({ where: { id: productId } });
    if (!stock) {
      await t.rollback();
      return res.status(404).json({ message: "stock not found" });
    }
    if (quantity > stock.stock) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Quantity exceeds available stock" });
    }
    stock.stock = Number(stock.stock) - Number(quantity);
    await stock.save({ transaction: t });
    const damagedRecord = await DamagedItem.create(
      {
        stockId: stock.id,
        quantityDamaged: quantity,
        reason,
        notes,
        staffId: req.staff.id,
      },
      { transaction: t },
    );
    if (!damagedRecord) {
      await t.rollback();
      return res
        .status(500)
        .json({ message: "Failed to create damaged item record" });
    }
    await StockFlow.create(
      {
        stockId: stock.id,
        quantity,
        amount: Number(stock.price) * Number(quantity),
        movementType: "damage",
        flowType: "out",
        oldStock: stock.stock + quantity,
        newStock: stock.stock,
        doneBy: req.staff.id,
        amount: Number(stock.price) * Number(quantity),
      },
      { transaction: t },
    );
    await t.commit();
    res
      .status(200)
      .json({ message: "damaged item recorded successfully", stock });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: error.message });
  }
};

//record return to vendor,
const recordReturnToVendor = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { productId } = req.params;
    const { quantity, reason, notes, invoiceNumber } = req.body;
    const stock = await Stock.findOne({ where: { id: productId } });
    if (!stock) {
      await t.rollback();
      return res.status(404).json({ message: "stock not found" });
    }
    const purchaseRecord = await Purchase.findOne({
      where: { productId, invoiceNumber },
    });
    if (!purchaseRecord) {
      await t.rollback();
      return res.status(404).json({ message: "purchase record not found" });
    }
    if (purchaseRecord.quantity <= quantity) {
      await t.rollback();

      return res
        .status(400)
        .json({ message: "Return quantity exceeds purchased quantity" });
    }
    stock.stock = Number(stock.stock) - Number(quantity);
    await stock.save({ transaction: t });
    const returnRecord = await ReturnVendor.create(
      {
        stockId: productId,
        quantityReturned: quantity,
        amountRefunded: Number(purchaseRecord.purchasePrice) * Number(quantity),
        reason,
        notes,
        staffId: req.staff.id,
        supplierId: purchaseRecord.supplierId,
        purchaseId: purchaseRecord.id,
        invoiceNumber,
        pricePerUnit: purchaseRecord.unitPrice,
      },
      { transaction: t },
    );
    if (!returnRecord) {
      await t.rollback();
      return res
        .status(500)
        .json({ message: "Failed to create return to vendor record" });
    }
    await StockFlow.create(
      {
        stockId: stock.id,
        quantity,
        amount: Number(purchaseRecord.purchasePrice) * Number(quantity),
        movementType: "return",
        flowType: "out",
        oldStock: stock.stock + quantity,
        newStock: stock.stock,
        amount: Number(purchaseRecord.purchasePrice) * Number(quantity),
        doneBy: req.staff.id,
      },
      { transaction: t },
    );
    await t.commit();
    res
      .status(200)
      .json({ message: "return to vendor recorded successfully", stock });
  } catch (error) {
    await t.rollback();
    console.error("Error recording return to vendor:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProduct,
  getStocks,
  getAllStocks,
  getStockPerProduct,
  updateStock,
  deleteStock,
  getAllStocksList,
  purchaseStock,
  recordDamagedItem,
  recordReturnToVendor,
};
