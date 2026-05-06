const express = require("express");
const router = express.Router();
const {
  createSale,
  makePayment,
  confirmOrder,
  getPayOnDeliveryOrders,
  cancelorder,
  returnOrder,
  getUserOrders,
  getOrderDetails,
  getAllOrders,
  getOrderDetailsForStaff,
  getCancelledOrders,
} = require("../controller/salesController");
const { protect, isUser, isStaff } = require("../middleware/authMiddleware");

router.post("/create-sale", protect, isUser, createSale);
router.post("/make-payment", protect, isUser, makePayment);
router.post("/confirm-order/:orderId", protect, isStaff, confirmOrder);
router.get("/pay-on-delivery-orders", protect, getPayOnDeliveryOrders);
router.post("/cancel-order/:orderId", protect, cancelorder);
router.post("/return-order/:orderId", protect, returnOrder);
router.get("/my-orders", protect, isUser, getUserOrders);
router.get("/order-details/:orderId", protect, isUser, getOrderDetails);
router.get(
  "/order-details-staff/:orderId",
  protect,
  isStaff,
  getOrderDetailsForStaff,
);
router.get("/all-orders", protect, isStaff, getAllOrders);
router.get("/cancelled-orders", protect, isStaff, getCancelledOrders);
module.exports = router;
