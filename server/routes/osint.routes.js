import { Router } from "express";
import {
  performSearch,
  getHistory,
  getReportById,
  exportReport,
  exportReportPDF,
  exportReportDocx,
} from "../controllers/osint.controller.js";
import { apiRateLimiter } from "../middleware/rateLimiter.middleware.js";
import { validateSearch } from "../middleware/validator.middleware.js";

const router = Router();

router.use(apiRateLimiter);

router.post("/search", validateSearch, performSearch);
router.get("/history", getHistory);
router.get("/report/:id", getReportById);
router.get("/export/:id", exportReport);
router.get("/export/:id/pdf", exportReportPDF);
router.get("/export/:id/docx", exportReportDocx);

export default router;
