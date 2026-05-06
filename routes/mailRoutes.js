const express = require("express");
const router = express.Router();

const {
  subscribeNewsletter,
  sendEmailToUser,
  sendPromotionalEmail,
  sendNewsletterMsg,
} = require("../controller/mailController");
const { protect, isStaff } = require("../middleware/authMiddleware");

router.post("/subscribe-newsletter", subscribeNewsletter);
router.post("/send-email/:id", protect, isStaff, sendEmailToUser);
router.post("/send-promotional-email", sendPromotionalEmail);
router.post("/send-newsletter", protect, isStaff, sendNewsletterMsg);
module.exports = router;
