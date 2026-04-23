import { body, validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

/**
 * Common validation result handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg).join(", ");
    throw new ApiError(400, `Validation Failed: ${errorMessages}`);
  }
  next();
};

/**
 * Validation rules for OSINT Search
 */
export const validateSearch = [
  body("query")
    .trim()
    .notEmpty()
    .withMessage("Search query is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Query must be between 2 and 100 characters")
    .matches(/^[a-zA-Z0-9.\-@\s]+$/)
    .withMessage("Query contains invalid characters (Allowed: alphanumeric, dots, dashes, @, spaces)"),
  handleValidationErrors,
];
