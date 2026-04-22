import React, { useState } from "react";
import {
  Shield,
  ExternalLink,
  Hash,
  Clock,
  FileText,
  Download,
  FileDown,
  ChevronDown,
} from "lucide-react";
import {
  exportReportMarkdown,
  exportReportPDF,
  exportReportDocx,
} from "@/api/search.api";

const ResultsDashboard = ({ report }) => {
  const [exporting, setExporting] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  if (!report) return null;

  const triggerDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async (format) => {
    setExporting(format);
    setShowExportMenu(false);
    try {
      switch (format) {
        case "pdf": {
          const blob = await exportReportPDF(report._id);
          triggerDownload(blob, `OSINT_${report.targetName}.pdf`);
          break;
        }
        case "docx": {
          const blob = await exportReportDocx(report._id);
          triggerDownload(blob, `OSINT_${report.targetName}.docx`);
          break;
        }
        case "md": {
          const blob = await exportReportMarkdown(report._id);
          triggerDownload(blob, `OSINT_${report.targetName}.md`);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      alert(`Export failed: ${err.message || "Unknown error"}`);
    } finally {
      setExporting(null);
    }
  };

  const exportOptions = [
    {
      key: "pdf",
      label: "Export as PDF",
      icon: "📄",
      desc: "Best for sharing & printing",
    },
    {
      key: "docx",
      label: "Export as Word",
      icon: "📝",
      desc: "Editable document format",
    },
    {
      key: "md",
      label: "Export as Markdown",
      icon: "📋",
      desc: "Developer-friendly format",
    },
  ];

  return (
    <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Shield
              className={
                report.riskLevel === "High" ? "text-red-500" : "text-green-500"
              }
            />
            <span className="text-slate-400 text-sm font-medium uppercase">
              Risk Assessment
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {report.riskLevel} Risk
          </h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-2 text-blue-500">
            <Hash size={20} />
            <span className="text-slate-400 text-sm font-medium uppercase">
              Intelligence Vectors
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white">
            {report.results.length} Sources
          </h2>
        </div>

        {/* Export Dropdown */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between relative">
          <button
            onClick={() => setShowExportMenu((prev) => !prev)}
            disabled={!!exporting}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white py-3 rounded-xl transition-all font-medium"
          >
            {exporting ? (
              <>
                <Download size={18} className="animate-bounce" />
                Exporting {exporting.toUpperCase()}...
              </>
            ) : (
              <>
                <FileDown size={18} />
                Export Report
                <ChevronDown
                  size={16}
                  className={`transition-transform ${showExportMenu ? "rotate-180" : ""}`}
                />
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          {showExportMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
              {exportOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleExport(opt.key)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors text-left"
                >
                  <span className="text-lg">{opt.icon}</span>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {opt.label}
                    </p>
                    <p className="text-slate-400 text-xs">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Vector Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {report.results.map((vector, idx) => (
          <div
            key={idx}
            className={`bg-slate-900/50 border rounded-2xl overflow-hidden backdrop-blur-md transition-all ${
              vector.error ? "border-red-500/30 shadow-lg shadow-red-500/5" : "border-slate-800"
            }`}
          >
            <div className={`p-4 md:p-5 border-b flex justify-between items-center ${
              vector.error ? "bg-red-500/5 border-red-500/20" : "bg-slate-800/30 border-slate-800"
            }`}>
              <div>
                <h3 className={`font-bold text-sm md:text-base ${vector.error ? "text-red-400" : "text-white"}`}>
                  {vector.source}
                </h3>
                <p className="text-[10px] md:text-xs text-slate-500">{vector.category}</p>
              </div>
              <div className={`px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-mono ${
                vector.error 
                  ? vector.data?.status === "Not Found" 
                    ? "bg-amber-500/20 text-amber-400" 
                    : "bg-red-500/20 text-red-400" 
                  : "bg-blue-500/10 text-blue-400"
              }`}>
                {vector.error ? vector.data?.status || "Failed" : `${vector.confidenceScore} Match`}
              </div>
            </div>

            <div className="p-4 md:p-5">
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {vector.error ? (
                  <div className="py-8 text-center space-y-3">
                    <div className="relative inline-block">
                      <Shield size={32} className={`mx-auto ${vector.data?.status === "Not Found" ? "text-amber-500/50" : "text-red-500/50"}`} />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-slate-900 rounded-full flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${vector.data?.status === "Not Found" ? "bg-amber-500" : "bg-red-500"}`}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className={`${vector.data?.status === "Not Found" ? "text-amber-400" : "text-red-400"} font-bold text-sm`}>
                        {vector.message}
                      </p>
                      <p className="text-slate-500 text-xs px-6 leading-relaxed">
                        {vector.data?.status === "Not Found" 
                          ? `The target query does not return results for ${vector.source}. Try using a more specific identifier like a domain name or full company name.`
                          : `The intelligence vector for ${vector.source} is currently unreachable. This may be due to API rate limits or service maintenance.`
                        }
                      </p>
                    </div>
                  </div>
                ) : (

                  <pre className="text-[10px] md:text-xs text-slate-400 font-mono whitespace-pre-wrap">
                    {JSON.stringify(vector.data, null, 2)}
                  </pre>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className="text-[10px] text-slate-600 flex items-center gap-1">
                  <Clock size={10} />{" "}
                  {new Date(vector.timestamp).toLocaleTimeString()}
                </span>
                {!vector.error && vector.sourceUrl && (
                  <a
                    href={vector.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] md:text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    Source Link <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default ResultsDashboard;
