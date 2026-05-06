const express = require("express");
const router = express.Router();
const {
  otpRequest,
  verifyOTP,
  regUser,
  loginUser,
  logoutUser,
  getUserProfile,
  getAllUsers,
  getUserDetails,
  activateUser,
  deactivateUser,
  addFund,
  deductFund,
  adminUpdateUser,
  adminChangeUserPassword,
  userChangePassword,
  resetPassword,
  passwordOtpRequest,
  updateUserProfile,
} = require("../controller/userController");
const {
  addUserValidation,
  updateUserValidation,
} = require("../validators/userValidator");

const {
  changePasswordValidation,
} = require("../validators/changePasswordValidation");
const { validateRequest } = require("../middleware/validatorMiddleware");
const { protect, isUser, isStaff } = require("../middleware/authMiddleware");

router.post("/register", addUserValidation, validateRequest, regUser);
router.post("/otp-request", otpRequest);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginUser);
router.post("/logout", protect, isUser, logoutUser);
router.get("/updateUser", protect, isUser, getUserProfile);
router.get("/view-users", protect, isStaff, getAllUsers);
router.get("/view-user/:id", protect, isStaff, getUserDetails);
router.post("/activate/:id", protect, isStaff, activateUser);
router.post("/deactivate/:id", protect, isStaff, deactivateUser);
router.post("/add-fund/:id", protect, isStaff, addFund);
router.post("/deduct-fund/:id", protect, isStaff, deductFund);
router.put("/update-user/:id", protect, isStaff, adminUpdateUser);
router.put("/change-password/:id", protect, isUser, adminChangeUserPassword);
router.put(
  "/user-change-password",
  changePasswordValidation,
  validateRequest,
  protect,
  isUser,
  userChangePassword,
);
router.put("/reset-password", resetPassword);
router.post("/password-otp-request", passwordOtpRequest);
router.put(
  "/update-profile",
  updateUserValidation,
  validateRequest,
  protect,
  isUser,
  updateUserProfile,
);
module.exports = router;
