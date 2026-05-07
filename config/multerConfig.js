const multer = require("multer");
const path = require("path");

// Set up storage engine for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../uploads/products")); // Specify the destination folder for uploaded files
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    const unique = Date.now() + "-" + safeName;

    cb(null, unique); // Generate a unique filename
  },
});
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (
    ext === ".jpg" ||
    ext === ".jpeg" ||
    ext === ".png" ||
    ext === ".gif" ||
    ext === ".mp4"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
});
module.exports = upload;
