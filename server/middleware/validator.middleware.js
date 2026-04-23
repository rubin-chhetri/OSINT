import { body, validationResult } from "express-validator";
import ApiError from "../utils/ApiError.js";

/**
 * Common validation result handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((err) => err.msg)
      .join(", ");
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
    .isLength({ min: 1, max: 200 })
    .withMessage("Query must be between 1 and 200 characters")
    .customSanitizer((val) => {
      try {
        let clean = val.trim();
        // Remove protocols only if present (don't force URL parsing)
        clean = clean.replace(/^https?:\/\//i, "");
        // Remove 'www.'
        clean = clean.replace(/^www\./i, "");
        // Remove trailing slashes
        clean = clean.replace(/\/+$/, "");
        return clean || val;
      } catch (e) {
        return val;
      }
    }),
  handleValidationErrors,
];
