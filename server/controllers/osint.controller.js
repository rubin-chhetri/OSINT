import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import * as osintService from "../services/osint.service.js";
import Report from "../models/report.model.js";
import generateMarkdown from "../utils/generateMarkdown.js";
import generatePDF from "../utils/generatePDF.js";
import generateDocx from "../utils/generateDocx.js";

export const performSearch = asyncHandler(async (req, res) => {
  const { query } = req.body;

  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  // 0. Check for existing reports in the last hour to avoid duplicates
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const existingReport = await Report.findOne({
    targetName: { $regex: new RegExp(`^${query}$`, "i") },
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
  const results = await osintService.runDiscovery(query);

  // 2. Save findings to the database
  const report = await osintService.saveReport(query, results);

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

export const exportReport = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    // Generate the markdown string using the utility we made
    const markdown = generateMarkdown(report);

    // STICKY HEADERS: This is what triggers the download dialog
    res.setHeader("Content-Type", "text/markdown");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="OSINT_Report_${report.targetName.replace(/\s+/g, "_")}.md"`,
    );

    return res.send(markdown);
  } catch (error) {
    console.error("Export Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate report" });
  }
};

// Export as PDF
export const exportReportPDF = asyncHandler(async (req, res) => {
  const report = await Report.findById(req.params.id).lean();

  if (!report) {
    throw new ApiError(404, "Report not found");
  }

  const pdfBuffer = await generatePDF(report);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="OSINT_Report_${report.targetName.replace(/\s+/g, "_")}.pdf"`,
  );

  return res.send(pdfBuffer);
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
