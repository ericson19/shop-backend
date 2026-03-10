const express = require("express");
const router = express.Router();
const {
  createSale,
  makePayment,
  confirmOrder,
  getPayOnDeliveryOrders,
  cancelorder,
  returnOrder,
} = require("../controller/salesController");
const { protect, isUser, isStaff } = require("../middleware/authMiddleware");

router.post("/create-sale", protect, isUser, createSale);
router.post("/make-payment", protect, isUser, makePayment);
router.post("/confirm-order/:orderId", protect, isStaff, confirmOrder);
router.get("/pay-on-delivery-orders", protect, getPayOnDeliveryOrders);
router.post("/cancel-order/:orderId", protect, isUser, cancelorder);
router.post("/return-order/:orderId", protect, returnOrder);

module.exports = router;
