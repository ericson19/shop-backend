const express = require("express");
const router = express.Router();

const {
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
} = require("../controller/stockController");
const { protect, role, isStaff } = require("../middleware/authMiddleware");
const { handleUploadErrors } = require("../middleware/validatorMiddleware");
const upload = require("../config/multerConfig");

// const uploadFields = upload.fields([
//   { name: "image", maxCount: 1 },
//   { name: "video", maxCount: 1 },
// ]);
router.post("/add-product", protect, isStaff, handleUploadErrors, addProduct);
router.put(
  "/update-stock/:stockId",
  protect,
  isStaff,
  handleUploadErrors,
  updateStock,
);
router.post("/purchase-stock/:productId", protect, isStaff, purchaseStock);
router.post("/record-damage/:productId", protect, isStaff, recordDamagedItem);
router.post(
  "/record-return/:productId",
  protect,
  isStaff,
  recordReturnToVendor,
);

router.get("/stocks/:catId", getStocks);
router.get("/stocks", getAllStocks);
router.get("/stocks-list", getAllStocksList);
router.get("/stock/:stockId", getStockPerProduct);

router.delete("/delete-stock/:stockId", protect, isStaff, deleteStock);
module.exports = router;
