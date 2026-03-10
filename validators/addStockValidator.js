const { body } = require("express-validator");

const addStockValidation = [
  body("name").notEmpty().withMessage("Name is required").trim().escape(),
  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),
  body("quantity")
    .isInt({ gt: 0 })
    .withMessage("Quantity must be a positive integer"),
  body("categoryId")
    .isInt({ gt: 0 })
    .withMessage("Valid category ID is required"),
  body("barCode")
    .notEmpty()
    .withMessage("Bar code is required")
    .trim()
    .escape(),
  body("stock")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Stock must be a positive integer"),
  body("description").optional().trim().escape(),
  body("image").optional().isURL().withMessage("Image must be a valid URL"),
  body("lowAlert")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Low alert must be a positive integer"),
  body("video").optional().isURL().withMessage("Video must be a valid URL"),
  body("tutorial").optional().trim().escape(),
];

module.exports = { addStockValidation };
