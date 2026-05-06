const Stock = require("../models/stockModel");
const category = require("../models/categoryModel");
const mainCategory = require("../models/mainCategory");

const addCategory = async (req, res) => {
  const { name, description, mainCatId } = req.body;
  try {
    const existingCategory = await category.findOne({ where: { name } });
    if (existingCategory) {
      return res.status(400).json({ message: "category already exists" });
    }
    console.log("Adding category with mainCatId:", req.body);
    const newCategory = await category.create({ name, description, mainCatId });
    if (newCategory) {
      res
        .status(201)
        .json({ message: "category created successfully", newCategory });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const viewCategory = async (req, res) => {
  try {
    const { mainCatId } = req.params;
    const categories = await category.findAll({
      where: { mainCatId },
      order: [["name", "ASC"]],
    });
    res.status(201).json({ message: "categories fetched", categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    const checkStock = await Stock.findOne({
      where: { categoryId: categoryId },
    });
    if (checkStock) {
      return res
        .status(500)
        .json({ message: "Cannot delete category that have products." });
    }
    await category.destroy({ where: { id: categoryId } });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const addMainCategory = async (req, res) => {
  const { name, description, image } = req.body;
  const imagePath = req.file.path;
  try {
    const existingMainCategory = await mainCategory.findOne({
      where: { name },
    });
    if (existingMainCategory) {
      return res.status(400).json({ message: "Main category already exists" });
    }
    const newMainCategory = await mainCategory.create({
      name,
      description,
      image: imagePath,
    });
    if (newMainCategory) {
      res.status(201).json({
        message: "Main category created successfully",
        newMainCategory,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const viewMainCategory = async (req, res) => {
  try {
    const mainCategories = await mainCategory.findAll({
      order: [["name", "ASC"]],
    });
    res
      .status(201)
      .json({ message: "Main categories fetched", mainCategories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const viewCategoryByMainCatId = async (req, res) => {
  const { mainCatId } = req.params;
  try {
    const categories = await category.findAll({
      where: { mainCatId },
      order: [["name", "ASC"]],
    });
    res.status(201).json({ message: "categories fetched", categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addCategory,
  viewCategory,
  deleteCategory,
  addMainCategory,
  viewMainCategory,
  viewCategoryByMainCatId,
};
