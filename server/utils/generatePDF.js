import PDFDocument from "pdfkit";

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
    doc.rect(0, 0, doc.page.width, 120).fill(colors.primary);

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
    doc.roundedRect(riskX, y + 15, 110, 35, 6).fill(riskColor);

    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#ffffff")
      .text(`${report.riskLevel} Risk`, riskX + 10, y + 25, {
        width: 90,
        align: "center",
      });

    y += 90;

    // ── Entity Resolution Intelligence (NEW) ──
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor(colors.primary)
      .text("Intelligence Analysis", 50, y);

    y += 22;

    const statusColor =
      report.resolutionStatus === "Confirmed"
        ? colors.success
        : report.resolutionStatus === "Ambiguous"
          ? colors.warning
          : colors.danger;

    // Status Badge
    doc.roundedRect(50, y, 120, 45, 4).fill("#f8fafc");
    doc
      .fontSize(8)
      .fillColor(colors.muted)
      .text("STATUS", 60, y + 10);
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor(statusColor)
      .text(report.resolutionStatus, 60, y + 22);

    // Confidence Badge
    doc.roundedRect(180, y, 120, 45, 4).fill("#f8fafc");
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor(colors.muted)
      .text("CONFIDENCE", 190, y + 10);
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor(colors.primary)
      .text(`${report.overallConfidence}%`, 190, y + 22);

    // Cluster Badge
    doc.roundedRect(310, y, 235, 45, 4).fill("#f8fafc");
    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor(colors.muted)
      .text("ENTITY CLUSTER", 320, y + 10);
    doc
      .fontSize(10)
      .font("Helvetica-Bold")
      .fillColor(colors.accent)
      .text(report.primaryCluster, 320, y + 22);

    y += 60;

    // Shared Pivots (Evidence)
    if (report.sharedPivots && report.sharedPivots.length > 0) {
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(colors.muted)
        .text("VERIFIED PIVOTS:", 50, y);
      doc
        .fontSize(8)
        .font("Courier")
        .fillColor(colors.accent)
        .text(report.sharedPivots.join(" • "), 145, y, {
          width: doc.page.width - 200,
        });
      y = doc.y + 20;
    }

    // ── Summary ──
    if (report.summary) {
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor(colors.primary)
        .text("Summary", 50, y);

      y += 18;
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
      .text(`Intelligence Vectors (${results.length} Sources)`, 50, y);
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

      // Analyst Note (from Vector Breakdown)
      const breakdown = report.vectorBreakdown?.[idx];
      if (breakdown) {
        doc
          .fontSize(8)
          .font("Helvetica-Oblique")
          .fillColor(colors.muted)
          .text(`Analyst Note: ${breakdown.reason}`, 70, y + 55, {
            width: doc.page.width - 160,
          });
      }

      // Source URL
      if (vector.sourceUrl) {
        doc
          .fontSize(8)
          .font("Helvetica")
          .fillColor(colors.accent)
          .text(`Source: ${vector.sourceUrl}`, 70, y + 70, {
            width: doc.page.width - 160,
            lineBreak: true,
          });
      }

      // Data preview (FULL DATA)
      const dataStr = JSON.stringify(vector.data || {}, null, 2) || "";
      // We still use a safe limit for the buffer, but much larger (10KB)
      const fullData =
        dataStr.length > 10000
          ? dataStr.substring(0, 10000) + "\n\n[Content Truncated for PDF Size]"
          : dataStr;

      doc
        .fontSize(7)
        .font("Courier")
        .fillColor("#475569")
        .text(fullData, 70, y + 85, {
          width: doc.page.width - 160,
          lineBreak: true,
        });

      y = doc.y + 30; // Dynamically set Y to the end of the text
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
