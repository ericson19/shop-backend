const Staff = require("../models/staffModel");
const StockFlow = require("../models/stockFlowModel");
const Stock = require("../models/stockModel");
const Category = require("../models/categoryModel");

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
    });
    if (newProd) {
      const stockRecord = await StockFlow.create({
        stockId: newProd.id,
        quantity: stock,
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
module.exports = { addProduct };
