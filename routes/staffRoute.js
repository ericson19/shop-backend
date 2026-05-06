const express = require("express");
const router = express.Router();
const { addStaffValidation } = require("../validators/staffValidator");
const { validateRequest } = require("../middleware/validatorMiddleware");
const {
  changePasswordValidation,
} = require("../validators/changePasswordValidation");
const {
  addStaff,
  staffLogin,
  logout,
  staffLogout,
  updateStaff,
  viewStaffs,
  viewStaff,
  changePassword,
} = require("../controller/staffController");
const { protect, role } = require("../middleware/authMiddleware");

router.post(
  "/add-staff",
  addStaffValidation,
  validateRequest,
  //   protect,
  //   permission("admin"),
  addStaff,
);
router.put(
  "/update-staff/:id",
  addStaffValidation,
  validateRequest,
  protect,
  role("admin"),
  updateStaff,
);

router.post("/login", staffLogin);
router.post("/logout", protect, logout);
router.post("/staff-logout", protect, staffLogout);
router.get("/view-staffs", protect, role("admin"), viewStaffs);
router.get("/view-staff/:id", protect, role("admin"), viewStaff);
router.put(
  "/change-password",
  changePasswordValidation,
  validateRequest,
  protect,
  changePassword,
);

module.exports = router;
