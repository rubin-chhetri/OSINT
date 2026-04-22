import PDFDocument from "pdfkit";

/**
 * Generates a PDF report and returns it as a Buffer.
 * @param {Object} report - The Mongoose report document.
 * @returns {Promise<Buffer>} - The PDF as a buffer.
 */
const generatePDF = (report) => {
  return new Promise((resolve, reject) => {
    const results = report.results || [];
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 60, bottom: 60, left: 50, right: 50 },
      info: {
        Title: `OSINT Report - ${report.targetName}`,
        Author: "OSINT Intelligence Platform",
      },
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const colors = {
      primary: "#1e293b",
      accent: "#3b82f6",
      danger: "#ef4444",
      success: "#22c55e",
      warning: "#f59e0b",
      muted: "#64748b",
      light: "#f1f5f9",
    };

    const riskColor =
      report.riskLevel === "High"
        ? colors.danger
        : report.riskLevel === "Medium"
          ? colors.warning
          : colors.success;

    // ── Header ──
    doc
      .rect(0, 0, doc.page.width, 120)
      .fill(colors.primary);

    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#ffffff")
      .text("OSINT Intelligence Report", 50, 35);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#94a3b8")
      .text(
        `Generated: ${new Date(report.createdAt).toLocaleString()}`,
        50,
        70,
      );

    doc.moveDown(3);
    let y = 140;

    // ── Target Info Card ──
    doc.rect(50, y, doc.page.width - 100, 70).fill(colors.light);

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(colors.muted)
      .text("TARGET", 70, y + 15);

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor(colors.primary)
      .text(report.targetName, 70, y + 30);

    // Risk badge
    const riskX = doc.page.width - 180;
    doc
      .roundedRect(riskX, y + 15, 110, 35, 6)
      .fill(riskColor);

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#ffffff")
      .text(`${report.riskLevel} Risk`, riskX + 10, y + 25, {
        width: 90,
        align: "center",
      });

    y += 90;

    // ── Summary ──
    if (report.summary) {
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor(colors.primary)
        .text("Summary", 50, y);

      y += 22;
      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor(colors.muted)
        .text(report.summary, 50, y, { width: doc.page.width - 100 });

      y = doc.y + 20;
    }

    // ── Section Header: Intelligence Vectors ──
    doc
      .moveTo(50, y)
      .lineTo(doc.page.width - 50, y)
      .strokeColor(colors.light)
      .lineWidth(1)
      .stroke();

    y += 15;
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor(colors.primary)
      .text(
        `Intelligence Vectors (${results.length} Sources)`,
        50,
        y,
      );
    y += 28;

    // ── Vector Cards ──
    results.forEach((vector, idx) => {
      // Check if we need a new page
      if (y > doc.page.height - 200) {
        doc.addPage();
        y = 60;
      }

      // Card background
      const cardHeight = 140;
      doc
        .roundedRect(50, y, doc.page.width - 100, cardHeight, 6)
        .fill("#f8fafc");

      // Source header
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor(colors.primary)
        .text(`${idx + 1}. ${vector.source}`, 70, y + 12);

      // Category & Confidence on same line
      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(colors.muted)
        .text(`Category: ${vector.category}`, 70, y + 30);

      doc
        .fontSize(9)
        .fillColor(colors.accent)
        .text(`Confidence: ${vector.confidenceScore || "N/A"}`, 250, y + 30);

      // Timestamp
      doc
        .fontSize(8)
        .fillColor(colors.muted)
        .text(
          `Timestamp: ${new Date(vector.timestamp).toLocaleString()}`,
          70,
          y + 45,
        );

      // Source URL
      if (vector.sourceUrl) {
        doc
          .fontSize(8)
          .fillColor(colors.accent)
          .text(`Source: ${vector.sourceUrl}`, 70, y + 58, {
            width: doc.page.width - 160,
            lineBreak: true,
          });
      }

      // Data preview (truncated)
      const dataStr = JSON.stringify(vector.data || {}, null, 2) || "";
      const truncatedData =
        dataStr.length > 300 ? dataStr.substring(0, 300) + "..." : dataStr;

      doc
        .fontSize(7)
        .font("Courier")
        .fillColor("#475569")
        .text(truncatedData, 70, y + 75, {
          width: doc.page.width - 160,
          height: 55,
          ellipsis: true,
        });

      y += cardHeight + 15;
    });

    // ── Footer ──
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 60;
    }

    doc
      .moveTo(50, y)
      .lineTo(doc.page.width - 50, y)
      .strokeColor(colors.light)
      .lineWidth(1)
      .stroke();

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor(colors.muted)
      .text("Report generated by OSINT Intelligence Platform", 50, y + 10, {
        align: "center",
      });

    doc.end();
  });
};

export default generatePDF;
