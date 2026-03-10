const express = require("express");
const router = express.Router();
const { addProduct } = require("../controller/stockController");
const { protect, permission } = require("../middleware/authMiddleware");
const upload = require("../config/multerConfig");

const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);
router.post(
  "/add-product",
  protect,
  permission("staff"),
  uploadFields,
  addProduct,
);
module.exports = router;
