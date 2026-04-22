import { Router } from "express";
import {
  performSearch,
  getHistory,
  getReportById,
  exportReport,
  exportReportPDF,
  exportReportDocx,
} from "../controllers/osint.controller.js";

const router = Router();

// Define the search route
router.post("/search", performSearch);
router.get("/history", getHistory);
router.get("/report/:id", getReportById);
router.get("/export/:id", exportReport);
router.get("/export/:id/pdf", exportReportPDF);
router.get("/export/:id/docx", exportReportDocx);

export default router;
