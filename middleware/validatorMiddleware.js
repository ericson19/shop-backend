const { validationResult } = require("express-validator");
const upload = require("../config/multerConfig");
const settingsUpload = require("../config/settingsMulter");
const multer = require("multer");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const uploadFields = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);
const handleUploadErrors = (req, res, next) => {
  uploadFields(req, res, function (err) {
    if (err) {
      console.log("UPLOAD ERROR:", err);

      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: "File too large. Max: 50MB",
          });
        }
      }

      return res.status(400).json({
        message: err.message,
      });
    }

    next(); // continue to controller
  });
};

const settingsUploadFields = settingsUpload.fields([
  { name: "logo", maxCount: 1 },
  { name: "siteFavicon", maxCount: 1 },
  { name: "frontPicture", maxCount: 1 },
]);
const handleSettingsUploadErrors = (req, res, next) => {
  settingsUploadFields(req, res, function (err) {
    if (err) {
      console.log("SETTINGS UPLOAD ERROR:", err);
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          console.log("File too large error detected");
          return res.status(400).json({
            message: "File too large. Max: 5MB",
          });
        }
      }

      return res.status(400).json({
        message: err.message,
      });
    }

    next(); // continue to controller
  });
};

module.exports = {
  validateRequest,
  handleUploadErrors,
  handleSettingsUploadErrors,
};
