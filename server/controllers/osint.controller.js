import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import * as osintService from "../services/osint.service.js";
import Report from "../models/report.model.js";
import { Worker } from "worker_threads";
import generateMarkdown from "../utils/generateMarkdown.js";
import generatePDF from "../utils/generatePDF.js";
import generateDocx from "../utils/generateDocx.js";

const escapeRegExp = (string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const performSearch = asyncHandler(async (req, res) => {
  const { query } = req.body;

  // 0. Check for existing reports in the last hour to avoid duplicates
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const escapedQuery = escapeRegExp(query);

  const existingReport = await Report.findOne({
    targetName: { $regex: new RegExp(`^${escapedQuery}$`, "i") },
    createdAt: { $gte: oneHourAgo },
  }).sort({ createdAt: -1 });

  if (existingReport) {
    return res.status(200).json({
      success: true,
      message: "Retrieved existing recent report",
      data: existingReport,
    });
  }

  // 1. Call service to fetch data from adapters
  const discoveryData = await osintService.runDiscovery(query);

  // 2. Save findings to the database
  const report = await osintService.saveReport(query, discoveryData);

  res.status(201).json({
    success: true,
    message: "Search completed and report generated",
    data: report,
  });
});

// Get all reports (History)
export const getHistory = asyncHandler(async (req, res) => {
  // Fetch latest 10 reports
  const history = await Report.find().sort({ createdAt: -1 }).limit(10);

  res.status(200).json({
    success: true,
    data: history,
  });
});

// Get single report by ID
export const getReportById = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  res.status(200).json({
    success: true,
    data: report,
  });
});

export const exportReport = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id);

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  const markdown = generateMarkdown(report);

  res.setHeader("Content-Type", "text/markdown");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="OSINT_Report_${report.targetName.replace(/\s+/g, "_")}.md"`,
  );

  return res.send(markdown);
});

// Export as PDF (Using Worker Threads for performance)
export const exportReportPDF = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id).lean();

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  // Offload PDF generation to a worker thread to keep the main loop free
  const pdfBuffer = await new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../workers/pdfWorker.js", import.meta.url), {
      workerData: { report },
    });

    worker.on("message", (data) => {
      if (data.success) resolve(data.buffer);
      else reject(new Error(data.error));
    });

    worker.on("error", reject);
    worker.on("exit", (code) => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="OSINT_Report_${report.targetName.replace(/\s+/g, "_")}.pdf"`,
  );

  return res.send(Buffer.from(pdfBuffer));
});

// Export as DOCX
export const exportReportDocx = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id).lean();

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  const docxBuffer = await generateDocx(report);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  );
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="OSINT_Report_${report.targetName.replace(/\s+/g, "_")}.docx"`,
  );

  return res.send(docxBuffer);
});
