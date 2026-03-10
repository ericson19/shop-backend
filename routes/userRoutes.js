const express = require("express");
const router = express.Router();
const {
  otpRequest,
  verifyOTP,
  regUser,
  loginUser,
  logoutUser,
} = require("../controller/userController");
const { addUserValidation } = require("../Validators/userValidator");
const { validateRequest } = require("../middleware/validatorMiddleware");
const { protect, isUser } = require("../middleware/authMiddleware");

router.post("/register", addUserValidation, validateRequest, regUser);
router.post("/otp-request", otpRequest);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginUser);
router.post("/logout", protect, isUser, logoutUser);

module.exports = router;
