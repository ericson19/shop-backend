const express = require("express");
const router = express.Router();
const {
  createSettings,
  getSettings,
  updateSettings,
} = require("../controller/settingsController");
const { protect, isStaff } = require("../middleware/authMiddleware");
const {
  handleSettingsUploadErrors,
} = require("../middleware/validatorMiddleware");
const settingsUpload = require("../config/settingsMulter");

router.post("/create", handleSettingsUploadErrors, createSettings);
router.get("/", getSettings);
router.put(
  "/update",
  protect,
  isStaff,
  handleSettingsUploadErrors,
  updateSettings,
);

module.exports = router;
