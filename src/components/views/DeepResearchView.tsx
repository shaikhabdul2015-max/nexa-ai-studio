import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Compass,
  Search,
  BookOpen,
  Newspaper,
  GraduationCap,
  Download,
  Share2,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { runDeepResearch } from "../../services/api";
import { ResearchReport } from "../../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const DeepResearchView: React.FC = () => {
  const { t, trackUsage, addNotification } = useApp();

  const [topic, setTopic] = useState("");
  const [researchMode, setResearchMode] = useState<
    "Quick Research" | "Deep Research" | "Academic Research" | "News Research"
  >("Deep Research");
  const [isLoading, setIsLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [copied, setCopied] = useState(false);

  const researchSteps = [
    "Vectorizing research hypothesis & identifying semantic domains...",
    "Querying Google Search Grounded indices for authoritative data...",
    "Corroborating citations, institutional studies & empirical data...",
    "Synthesizing comparative timeline, key findings & structured dossier...",
  ];

  const modes: Array<{
    id: "Quick Research" | "Deep Research" | "Academic Research" | "News Research";
    title: string;
    desc: string;
    icon: React.FC<{ className?: string }>;
  }> = [
    {
      id: "Quick Research",
      title: "Quick Research",
      desc: "Fast executive summary with primary data points",
      icon: Compass,
    },
    {
      id: "Deep Research",
      title: "Deep Research",
      desc: "Exhaustive synthesis, timeline, tables & methodology",
      icon: BookOpen,
    },
    {
      id: "Academic Research",
      title: "Academic Research",
      desc: "Peer-reviewed emphasis, statistical checks & rigor",
      icon: GraduationCap,
    },
    {
      id: "News Research",
      title: "News Research",
      desc: "Recent event timelines, perspectives & verified reports",
      icon: Newspaper,
    },
  ];

  const handleStartResearch = async () => {
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);
    setCurrentStepIndex(0);
    setReport(null);

    // Step cycle animation
    const stepInterval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < researchSteps.length - 1 ? prev + 1 : prev));
    }, 2500);

    try {
      const data = await runDeepResearch(topic, researchMode);
      setReport({
        id: "rep-" + Date.now(),
        topic,
        mode: researchMode,
        report: data.report,
        content: data.report,
        sources: data.sources || [],
        citations: data.sources || [],
        createdAt: new Date().toISOString(),
      });
      trackUsage("research", 1500);
      addNotification("Research Complete", `Dossier compiled for: ${topic}`, "success");
    } catch (err: any) {
      addNotification("Research Error", err.message || "Deep research failed", "error");
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const handleCopyReport = () => {
    if (!report) return;
    navigator.clipboard.writeText(report.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = (format: "markdown" | "txt") => {
    if (!report) return;
    const blob = new Blob([report.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NEXA_Research_${report.topic.replace(/\s+/g, "_")}.${format === "markdown" ? "md" : "txt"}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="deep-research-view" className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header section */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2 border border-blue-200 dark:border-blue-800">
          <Compass className="w-3.5 h-3.5" />
          <span>Autonomous Grounded Investigation</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {t.research.title}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 max-w-2xl">
          {t.research.subtitle}
        </p>
      </div>

      {/* Mode Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = researchMode === m.id;
          return (
            <button
              key={m.id}
              id={`research-mode-${m.id}`}
              onClick={() => setResearchMode(m.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm"
                  : "bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white hover:border-neutral-300 dark:hover:border-neutral-700"
              }`}
            >
              <Icon className="w-5 h-5 mb-2" />
              <h3 className="font-semibold text-xs">{m.title}</h3>
              <p
                className={`text-[11px] mt-1 line-clamp-2 ${
                  isSelected
                    ? "text-neutral-300 dark:text-neutral-600"
                    : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {m.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Input Box */}
      <div className="p-5 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
        <label
          htmlFor="research-topic-input"
          className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200"
        >
          Research Topic, Query or Thesis
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="research-topic-input"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleStartResearch()}
            placeholder={t.research.topicPlaceholder}
            className="flex-1 px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white"
          />
          <button
            id="start-research-btn"
            onClick={handleStartResearch}
            disabled={!topic.trim() || isLoading}
            className="px-6 py-3 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Investigating...</span>
              </>
            ) : (
              <>
                <span>{t.research.generateReport}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Suggestion tags */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-neutral-500 dark:text-neutral-400">
          <span className="text-[11px] font-medium mr-1">Trending Topics:</span>
          {[
            "Neuromorphic Computing Architectures",
            "State of Solid State Batteries 2026",
            "Post-Quantum Cryptography NIST Standards",
            "CRISPR-Cas9 Therapeutic Approvals",
          ].map((sug, i) => (
            <button
              key={i}
              onClick={() => setTopic(sug)}
              className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-[11px] transition-colors"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Progress State */}
      {isLoading && (
        <div
          id="research-loading-state"
          className="p-8 rounded-3xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center space-y-4 animate-in fade-in duration-300"
        >
          <div className="w-12 h-12 rounded-full border-3 border-neutral-900 dark:border-white border-t-transparent animate-spin mx-auto" />
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              Synthesizing Multi-Source Intelligence
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono mt-1">
              {researchSteps[currentStepIndex]}
            </p>
          </div>
          <div className="max-w-md mx-auto bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-neutral-900 dark:bg-white h-full rounded-full transition-all duration-700"
              style={{
                width: `${((currentStepIndex + 1) / researchSteps.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Generated Report Display */}
      {report && (
        <article
          id="research-report-container"
          className="p-6 md:p-8 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-6 animate-in fade-in zoom-in-98 duration-200"
        >
          {/* Action header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                {report.mode} Dossier
              </span>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
                {report.topic}
              </h2>
              <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {new Date(report.createdAt).toLocaleDateString([], {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span>·</span>
                <span>Grounding: Google Search Engine</span>
              </div>
            </div>

            {/* Export Toolbar */}
            <div className="flex items-center gap-2">
              <button
                id="copy-report-btn"
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Copy markdown text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                id="download-md-report-btn"
                onClick={() => handleDownloadReport("markdown")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Download Markdown (.md)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export .MD</span>
              </button>

              <button
                id="print-report-btn"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-medium hover:opacity-90 transition-opacity shadow-2xs"
                title="Print or save as PDF"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>

          {/* Report Body Markdown */}
          <div className="markdown-body prose prose-sm dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table(props) {
                  return (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700 border border-neutral-200 dark:border-neutral-700 rounded-xl" {...props} />
                    </div>
                  );
                },
              }}
            >
              {report.content}
            </ReactMarkdown>
          </div>

          {/* Citations & Sources list if present */}
          {report.citations && report.citations.length > 0 && (
            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                {t.research.citations} ({report.citations.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {report.citations.map((c, i) => (
                  <a
                    key={i}
                    href={c.uri || c.url || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-700/60 text-xs text-neutral-700 dark:text-neutral-300 transition-colors group"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-medium truncate group-hover:text-neutral-900 dark:group-hover:text-white">
                        {c.title || "Reference Source"}
                      </p>
                      <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                        {c.source || "Web"} · {c.uri || c.url || "Online Source"}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400 shrink-0 group-hover:text-neutral-900 dark:group-hover:text-white" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </article>
      )}
    </div>
  );
};
