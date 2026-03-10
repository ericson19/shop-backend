const express = require("express");
const router = express.Router();
const { addCategory } = require("../controller/categoryController");

router.post("/add-category", addCategory);

module.exports = router;
