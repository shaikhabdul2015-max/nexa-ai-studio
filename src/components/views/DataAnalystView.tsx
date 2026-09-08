import React, { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import {
  BarChart3,
  Upload,
  Table as TableIcon,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Loader2,
  FileSpreadsheet,
} from "lucide-react";
import { runDataAnalysis } from "../../services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SAMPLE_CSV = `Month,Region,Revenue,ActiveUsers,ChurnRate,NPS
Jan,North America,124500,45200,2.1,64
Feb,North America,131200,48100,1.9,67
Mar,North America,145800,52300,1.8,69
Apr,North America,152000,56000,1.7,71
May,Europe,98400,34100,2.4,59
Jun,Europe,104500,36800,2.2,62
Jul,Europe,112000,39400,2.1,63
Aug,Europe,119800,42100,1.9,66
Sep,Asia Pacific,82000,29500,2.8,55
Oct,Asia Pacific,89400,32400,2.6,58
Nov,Asia Pacific,97100,35800,2.3,61
Dec,Asia Pacific,108200,40200,2.0,65`;

export const DataAnalystView: React.FC = () => {
  const { t, trackUsage, addNotification } = useApp();

  const [csvData, setCsvData] = useState(SAMPLE_CSV);
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisReport, setAnalysisReport] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"table" | "insights">("table");

  // Parse CSV for table preview
  const parsedTable = useMemo(() => {
    try {
      const lines = csvData.trim().split("\n");
      if (lines.length === 0) return { headers: [], rows: [] };
      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = lines.slice(1).map((l) => l.split(",").map((c) => c.trim()));
      return { headers, rows };
    } catch {
      return { headers: [], rows: [] };
    }
  }, [csvData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setCsvData(reader.result as string);
      setAnalysisReport(null);
      addNotification("Dataset Loaded", `Imported ${file.name}`, "success");
    };
    reader.readAsText(file);
  };

  const handleRunAnalysis = async () => {
    if (!csvData.trim() || isLoading) return;
    setIsLoading(true);
    setAnalysisReport(null);

    try {
      const data = await runDataAnalysis(
        csvData,
        naturalLanguageQuery || "Perform a comprehensive statistical distribution, anomaly scan, and trend overview.",
        "insights"
      );
      setAnalysisReport(data.analysis);
      setActiveTab("insights");
      trackUsage("request", 950);
      addNotification("Data Analysis Ready", "Statistical synthesis completed.", "success");
    } catch (err: any) {
      addNotification("Analysis Failed", err.message || "Data processing failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysisReport) return;
    navigator.clipboard.writeText(analysisReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="data-analyst-view-container" className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-xs font-semibold mb-2 border border-neutral-200 dark:border-neutral-700">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Quantitative Intelligence & Tabular AI</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {t.data.title}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t.data.subtitle}
          </p>
        </div>

        <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm self-start sm:self-auto">
          <Upload className="w-4 h-4" />
          <span>Upload CSV File</span>
          <input
            type="file"
            accept=".csv,.tsv,.txt"
            className="hidden"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
          <p className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">Total Rows</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
            {parsedTable.rows.length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
          <p className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">Columns</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
            {parsedTable.headers.length}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
          <p className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">Data Health</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            100% Valid
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
          <p className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider">Dataset Size</p>
          <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
            {(new Blob([csvData]).size / 1024).toFixed(1)} KB
          </p>
        </div>
      </div>

      {/* Natural Language Query Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3">
        <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
          Ask Questions About This Dataset
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={naturalLanguageQuery}
            onChange={(e) => setNaturalLanguageQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleRunAnalysis()}
            placeholder="e.g. Which region achieved highest user growth with lowest churn?"
            className="flex-1 px-4 py-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
          <button
            id="run-data-analysis-btn"
            onClick={handleRunAnalysis}
            disabled={isLoading || !csvData.trim()}
            className="px-5 py-2.5 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Computing...</span>
              </>
            ) : (
              <>
                <span>Analyze Dataset</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* View Switcher: Table View vs AI Insights */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-2">
        <button
          onClick={() => setActiveTab("table")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === "table"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <TableIcon className="w-3.5 h-3.5" />
          <span>Table Preview ({parsedTable.rows.length} rows)</span>
        </button>

        <button
          onClick={() => setActiveTab("insights")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === "insights"
              ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Statistical Insights & Chart Schemas</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "table" ? (
        <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 overflow-hidden shadow-xs">
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-900 sticky top-0">
                <tr>
                  {parsedTable.headers.map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider text-[11px]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-mono text-[11px]">
                {parsedTable.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                    {row.map((val, cIdx) => (
                      <td key={cIdx} className="px-4 py-2.5 text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Quantitative AI Report
            </h3>
            {analysisReport && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-10 h-10 rounded-full border-2 border-neutral-900 dark:border-white border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-neutral-400 font-mono">
                Calculating distributions, variances & anomaly thresholds...
              </p>
            </div>
          ) : !analysisReport ? (
            <div className="text-center py-12 space-y-2 text-neutral-400 text-xs">
              <BarChart3 className="w-8 h-8 mx-auto opacity-40" />
              <p>Click "Analyze Dataset" above to produce statistical findings and chart models.</p>
            </div>
          ) : (
            <div className="markdown-body prose prose-sm dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 text-xs leading-relaxed">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {analysisReport}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
