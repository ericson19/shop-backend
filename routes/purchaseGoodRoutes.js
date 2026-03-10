const express = require("express");
const router = express.Router();
const {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
} = require("../controller/suppliersController");
const { purchaseItem } = require("../controller/purchaseController");
const { protect, isStaff } = require("../middleware/authMiddleware");

// Get all suppliers
router.get("/suppliers", protect, isStaff, getAllSuppliers);

// Create a new supplier
router.post("/create-supplier", protect, isStaff, createSupplier);

router.post("/purchase-item", protect, isStaff, purchaseItem);

// Get a supplier by ID
router.get("/suppliers/:id", protect, isStaff, getSupplierById);

// Update a supplier
router.put("/suppliers/:id", protect, isStaff, updateSupplier);

module.exports = router;
