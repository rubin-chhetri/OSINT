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
  Zap,
  Globe,
  Link2,
  Loader2,
  AlertCircle
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
    <div className="mt-8 space-y-6">
      {/* Header Stats & Entity Resolution: Utilitarian Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Verification Status */}
        <div className="pro-card p-5 relative overflow-hidden bg-white">
          <div className={`absolute top-0 bottom-0 left-0 w-1 ${
            report.resolutionStatus === 'Confirmed' ? 'bg-green-500' : 
            report.resolutionStatus === 'Ambiguous' ? 'bg-amber-500' : 'bg-red-500'
          }`} />
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${
              report.resolutionStatus === 'Confirmed' ? 'bg-green-500' : 
              report.resolutionStatus === 'Ambiguous' ? 'bg-amber-500' : 'bg-red-500'
            }`} />
            <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Resolution</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{report.resolutionStatus}</h2>
        </div>

        {/* Confidence Score */}
        <div className="pro-card p-5 bg-white">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <Zap size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Confidence</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">{report.overallConfidence}% Match</h2>
        </div>

        {/* Primary Cluster */}
        <div className="pro-card p-5 bg-white">
          <div className="flex items-center gap-2 mb-2 text-slate-500">
            <Globe size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Cluster</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 truncate">{report.primaryCluster}</h2>
        </div>

        {/* Export Button */}
        <div className="relative group">
          <button
            onClick={() => setShowExportMenu((prev) => !prev)}
            disabled={!!exporting}
            className="w-full h-full pro-card p-5 flex items-center justify-between hover:bg-slate-50 transition-colors bg-white"
          >
            <div className="text-left">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block mb-1">Export Data</span>
              <span className="text-slate-900 font-semibold text-sm">Download Report</span>
            </div>
            {exporting ? (
              <Loader2 className="animate-spin text-blue-500" size={20} />
            ) : (
              <ChevronDown size={18} className="text-slate-500" />
            )}
          </button>
          {showExportMenu && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xl">
              {exportOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => handleExport(opt.key)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 last:border-0"
                >
                  <span className="text-lg">{opt.icon}</span>
                  <div>
                    <p className="text-slate-900 text-xs font-semibold">{opt.label}</p>
                    <p className="text-slate-500 text-[10px]">{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Shared Pivots: Clean Inline List */}
      {report.sharedPivots && report.sharedPivots.length > 0 && (
        <div className="pro-card p-4 flex flex-col md:flex-row md:items-center gap-4 bg-blue-50/5 border-blue-100">
          <div className="flex items-center gap-2 shrink-0">
            <Link2 size={16} className="text-blue-600" />
            <h4 className="text-blue-600 text-[10px] font-bold uppercase tracking-widest">Shared Intelligence Pivots</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.sharedPivots.map((pivot, i) => (
              <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] text-slate-600 font-mono">
                {pivot}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Vector Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {report.results.map((vector, idx) => (
          <div
            key={idx}
            className="pro-card bg-white flex flex-col h-full"
          >
            {/* Header: Fixed Height */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">
                    {vector.source}
                  </h3>
                  {report.vectorBreakdown?.[idx]?.isCorroborated && (
                    <div className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded text-[8px] font-bold border border-green-200 uppercase tracking-tighter">
                      Corroborated
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 font-medium">{vector.category}</p>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
                vector.error 
                  ? "bg-red-50 text-red-600" 
                  : "bg-blue-50 text-blue-600"
              }`}>
                {vector.error ? "FAILURE" : vector.confidenceScore}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 flex-grow flex flex-col">
              {/* Analyst Reason: Muted & Simple */}
              {report.vectorBreakdown?.[idx] && (
                <div className="mb-4 flex items-start gap-2">
                  <AlertCircle size={12} className="text-slate-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-slate-500 font-medium">
                    <span className="text-slate-900">ANALYST NOTE:</span> {report.vectorBreakdown[idx].reason}
                  </p>
                </div>
              )}

              {/* Data Preview: Flat & Mono */}
              <div className="flex-grow max-h-80 overflow-y-auto custom-scrollbar">
                {vector.error ? (
                  <div className="py-12 text-center">
                    <Shield size={24} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-red-500 text-xs font-bold mb-1 uppercase tracking-wider">{vector.message || "Vector Unreachable"}</p>
                    <p className="text-slate-400 text-[10px] px-8 italic">Service response indicates a non-critical acquisition failure.</p>
                  </div>
                ) : (
                  <div className="pt-2">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-100 pb-1 flex justify-between">
                      <span>Raw Intelligence Payload</span>
                      <span>UTF-8</span>
                    </div>
                    <pre className="text-[11px] text-slate-600 font-mono whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(vector.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Footer Meta */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-slate-400 flex items-center gap-1 font-mono uppercase tracking-tighter">
                    <Clock size={10} /> {new Date(vector.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                {!vector.error && vector.sourceUrl && (
                  <a
                    href={vector.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-600 hover:text-blue-500 flex items-center gap-1 transition-colors font-semibold"
                  >
                    LINK <ExternalLink size={10} />
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
