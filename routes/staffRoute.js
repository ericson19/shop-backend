const express = require("express");
const router = express.Router();
const { addStaffValidation } = require("../validators/staffValidator");
const { validateRequest } = require("../middleware/validatorMiddleware");
const {
  addStaff,
  staffLogin,
  logout,
} = require("../controller/staffController");
const { protect, permission } = require("../middleware/authMiddleware");

router.post(
  "/add-staff",
  addStaffValidation,
  validateRequest,
  //   protect,
  //   permission("admin"),
  addStaff,
);
router.post("/login", staffLogin);
router.post("/logout", protect, logout);
module.exports = router;
