const { body } = require("express-validator");

const addUserValidation = [
  body("fullName").notEmpty().withMessage("Name is required").trim().escape(),
  body("email")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("userName")
    .notEmpty()
    .withMessage("Username is required")
    .trim()
    .escape(),
  body("phone")
    .optional()
    .isMobilePhone()
    .withMessage("Valid phone number is required"),
];

const updateUserValidation = [
  body("fullName").optional({ checkFalsy: true }).trim().escape(),
  body("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("phone")
    .optional({ checkFalsy: true })
    .isMobilePhone()
    .withMessage("Valid phone number is required"),
];

module.exports = { addUserValidation, updateUserValidation };
