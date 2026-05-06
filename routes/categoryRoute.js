const express = require("express");
const router = express.Router();
const {
  addCategory,
  viewCategory,
  deleteCategory,
  viewCategoryByMainCatId,
  addMainCategory,
  viewMainCategory,
} = require("../controller/categoryController");
const { protect, role, isStaff } = require("../middleware/authMiddleware");
const upload = require("../config/multerConfig");

router.post("/add-category", protect, role("admin"), addCategory);
router.get("/view-categories", viewCategory);
router.delete(
  "/delete-category/:categoryId",
  protect,
  role("admin"),
  deleteCategory,
);
router.post(
  "/add-main-category",
  protect,
  isStaff,
  upload.single("image"),
  addMainCategory,
);
router.get("/view-main-categories", viewMainCategory);
router.get("/view-categories-by-main-cat/:mainCatId", viewCategoryByMainCatId);

module.exports = router;
