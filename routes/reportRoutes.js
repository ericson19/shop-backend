const express = require("express");
const router = express.Router();
const {
  getSalesReport,
  getSaleDetails,
  getInventoryReport,
  getSummaryReport,
  getInventorySummary,
  getInventorySummaryByDateAndStock,
  getPurchaseReport,
  getReturnedReport,
  getDamagedReport,
} = require("../controller/reportController");
const { protect, role, isStaff } = require("../middleware/authMiddleware");

router.get("/sales", protect, isStaff, getSalesReport);
router.get("/sales/:saleId", protect, isStaff, getSaleDetails);
router.get("/inventory", protect, role("admin"), getInventoryReport);
router.get("/summary", protect, role("admin"), getSummaryReport);
router.get("/inventory-summary", protect, role("admin"), getInventorySummary);
router.get(
  "/inventory-summary-by-date-stock",
  protect,
  role("admin"),
  getInventorySummaryByDateAndStock,
);
router.get("/purchase", protect, isStaff, getPurchaseReport);
router.get("/returned", protect, isStaff, getReturnedReport);
router.get("/damages", protect, isStaff, getDamagedReport);

module.exports = router;
