const express = require("express");
const router = express.Router();
const {
  payWithBalance,
  makeManualPayment,
  approveManualPayment,
} = require("../controller/paymentController");
const {
  protect,
  isUser,
  isAdmin,
  isStaff,
} = require("../middleware/authMiddleware");
const upload = require("../config/paymentMulter");

router.post("/pay-with-balance", protect, isUser, payWithBalance);
router.post(
  "/make-manual-payment",
  protect,
  isUser,
  upload.single("paymentProof"),
  makeManualPayment,
);
router.post(
  "/approve-manual-payment/:paymentId",
  protect,
  isStaff,
  approveManualPayment,
);

module.exports = router;
