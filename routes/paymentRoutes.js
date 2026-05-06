const express = require("express");
const router = express.Router();
const {
  makePayment,
  verifyPayment,
  payWithBalance,
  makeManualPayment,
  approveManualPayment,
  getManualPayments,
  getPaymentDetails,
  rejectManualPayment,
  getManualPaymentByStatus,
  paystackFundAccount,
  manualFundAccount,
  verifyFundAccountPayment,
  getPaymentHistory,
  flutterwaveMakePayment,
  verifyFlutterwavePayment,
  flutterwaveFundAccount,
  verifyFlutterwaveFundAccount,
} = require("../controller/paymentController");
const {
  protect,
  isUser,

  isStaff,
} = require("../middleware/authMiddleware");
const upload = require("../config/paymentMulter");

router.post("/pay-with-balance", protect, isUser, payWithBalance);
router.post(
  "/make-manual-payment",
  protect,
  isUser,
  upload.single("screenshot"),
  makeManualPayment,
);
router.post(
  "/approve-manual-payment/:paymentId",
  protect,
  isStaff,
  approveManualPayment,
);
router.post(
  "/cancel-manual-payment/:paymentId",
  protect,
  isStaff,
  rejectManualPayment,
);
router.post("/initiate-paystack-payment", protect, isUser, makePayment);
router.post(
  "/initiate-flutterwave-payment",
  protect,
  isUser,
  flutterwaveMakePayment,
);

router.get("/verify/:reference", verifyPayment);
router.get("/verify-flutterwave/:reference", verifyFlutterwavePayment);
router.get("/manual-payments", protect, isStaff, getManualPayments);
router.get("/payment-details/:paymentId", protect, isStaff, getPaymentDetails);
router.get(
  "/manual-payments/:status",
  protect,
  isStaff,
  getManualPaymentByStatus,
);
router.post(
  "/fund-account/flutterwave",
  protect,
  isUser,
  flutterwaveFundAccount,
);
router.post("/fund-account/paystack", protect, isUser, paystackFundAccount);
router.post(
  "/fund-account/manual",
  protect,
  isUser,
  upload.single("screenshot"),
  manualFundAccount,
);
router.get(
  "/fund/verify/:reference",
  protect,
  isUser,
  verifyFundAccountPayment,
);
router.get(
  "/fund/flw-verify/:reference",
  protect,
  isUser,
  verifyFlutterwaveFundAccount,
);

router.get("/payment-history", protect, isUser, getPaymentHistory);
module.exports = router;
