import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
} from "docx";

const generateDocx = async (report) => {
  const results = report.results || [];
  const riskColor =
    report.riskLevel === "High"
      ? "FF0000"
      : report.riskLevel === "Medium"
        ? "F59E0B"
        : "22C55E";

  const children = [];

  // ── Title ──
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "OSINT Intelligence Report",
          bold: true,
          size: 48,
          color: "1E293B",
          font: "Calibri",
        }),
      ],
      spacing: { after: 100 },
    }),
  );

  // ── Subtitle / Date ──
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated: ${new Date(report.createdAt || Date.now()).toLocaleString()}`,
          size: 20,
          color: "64748B",
          font: "Calibri",
        }),
      ],
      spacing: { after: 300 },
    }),
  );

  // ── Target & Risk Info Table ──
  children.push(
    new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Target: ",
                      bold: true,
                      size: 22,
                      color: "64748B",
                    }),
                    new TextRun({
                      text: report.targetName || "Unknown Target",
                      bold: true,
                      size: 28,
                      color: "1E293B",
                    }),
                  ],
                }),
              ],
              width: { size: 70, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `${report.riskLevel || "Low"} Risk`,
                      bold: true,
                      size: 24,
                      color: riskColor,
                    }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
              width: { size: 30, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),
  );

  children.push(new Paragraph({ children: [], spacing: { after: 200 } }));

  // ── Entity Resolution Analysis ──
  children.push(
    new Paragraph({
      text: "Intelligence Analysis",
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 100 },
    }),
  );

  children.push(
    new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Status: ", bold: true, size: 20 }),
                    new TextRun({
                      text: report.resolutionStatus,
                      size: 20,
                      color: riskColor,
                      bold: true,
                    }),
                  ],
                }),
              ],
              width: { size: 33, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Match: ", bold: true, size: 20 }),
                    new TextRun({
                      text: `${report.overallConfidence}%`,
                      size: 20,
                      bold: true,
                    }),
                  ],
                }),
              ],
              width: { size: 33, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "Cluster: ", bold: true, size: 20 }),
                    new TextRun({
                      text: report.primaryCluster,
                      size: 20,
                      italics: true,
                    }),
                  ],
                }),
              ],
              width: { size: 34, type: WidthType.PERCENTAGE },
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    }),
  );

  if (report.sharedPivots && report.sharedPivots.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "VERIFIED PIVOTS: ",
            bold: true,
            size: 18,
            color: "64748B",
          }),
          new TextRun({
            text: report.sharedPivots.join(" • "),
            size: 18,
            color: "3B82F6",
            font: "Courier New",
          }),
        ],
        spacing: { before: 100, after: 200 },
      }),
    );
  }

  // ── Summary ──
  if (report.summary) {
    children.push(
      new Paragraph({
        text: "Executive Summary",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
      }),
    );

    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: report.summary,
            size: 20,
            color: "475569",
          }),
        ],
        spacing: { after: 200 },
      }),
    );
  }

  // ── Divider ──
  children.push(
    new Paragraph({
      border: {
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      },
      spacing: { after: 200 },
    }),
  );

  // ── Section: Intelligence Vectors ──
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Intelligence Vectors (${results.length} Sources)`,
          bold: true,
          size: 28,
          color: "1E293B",
        }),
      ],
      spacing: { before: 200, after: 200 },
    }),
  );

  // ── Vector Entries ──
  results.forEach((vector, idx) => {
    // Source heading
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `${idx + 1}. ${vector.source || "Unknown Source"}`,
            bold: true,
            size: 24,
            color: "1E293B",
          }),
        ],
        spacing: { before: 200, after: 80 },
        shading: {
          type: ShadingType.SOLID,
          color: "F1F5F9",
        },
      }),
    );

    // Metadata
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Category: ",
            bold: true,
            size: 18,
            color: "64748B",
          }),
          new TextRun({
            text: vector.category || "General",
            size: 18,
            color: "334155",
          }),
          new TextRun({
            text: "   |   Confidence: ",
            bold: true,
            size: 18,
            color: "64748B",
          }),
          new TextRun({
            text: vector.confidenceScore || "N/A",
            size: 18,
            color: "3B82F6",
          }),
        ],
        spacing: { after: 60 },
      }),
    );

    // Analyst Note
    const breakdown = report.vectorBreakdown?.[idx];
    if (breakdown) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Analyst Note: ",
              bold: true,
              size: 16,
              color: "64748B",
            }),
            new TextRun({
              text: breakdown.reason,
              size: 16,
              color: "475569",
              italics: true,
            }),
          ],
          spacing: { after: 60 },
        }),
      );
    }

    // Timestamp
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Timestamp: ${new Date(vector.timestamp || Date.now()).toLocaleString()}`,
            size: 16,
            color: "94A3B8",
            italics: true,
          }),
        ],
        spacing: { after: 60 },
      }),
    );

    // Source URL
    if (vector.sourceUrl) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Source: ",
              bold: true,
              size: 16,
              color: "64748B",
            }),
            new TextRun({
              text: vector.sourceUrl,
              size: 16,
              color: "3B82F6",
            }),
          ],
          spacing: { after: 60 },
        }),
      );
    }

    // Data block (FULL DATA)
    const dataStr = JSON.stringify(vector.data || {}, null, 2);
    const dataLines = (dataStr || "").split("\n");

    children.push(
      new Paragraph({
        children: dataLines.map(
          (line, i) =>
            new TextRun({
              text: line,
              font: "Consolas",
              size: 16,
              color: "475569",
              break: i > 0 ? 1 : 0,
            }),
        ),
        spacing: { before: 80, after: 200 },
        shading: {
          type: ShadingType.SOLID,
          color: "F8FAFC",
        },
      }),
    );
  });

  // ── Footer ──
  children.push(
    new Paragraph({
      border: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
      },
      spacing: { before: 300, after: 100 },
    }),
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "Report generated by OSINT Intelligence Platform",
          size: 16,
          color: "94A3B8",
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    }),
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return await Packer.toBuffer(doc);
};

export default generateDocx;
