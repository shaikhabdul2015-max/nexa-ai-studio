import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Code2,
  Play,
  Bug,
  Sparkles,
  TestTube,
  FileCode,
  Layers,
  Copy,
  Check,
  Download,
  Terminal,
  Loader2,
  RefreshCw,
  Eye,
} from "lucide-react";
import { runCodeAssist } from "../../services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SAMPLE_CODE = `// NEXA Autonomous State Machine
interface State<T> {
  name: string;
  payload: T;
  timestamp: number;
}

export class TaskScheduler<T> {
  private queue: State<T>[] = [];
  private isProcessing: boolean = false;

  public enqueue(state: State<T>): void {
    this.queue.push(state);
    if (!this.isProcessing) {
      this.processNext();
    }
  }

  private async processNext(): Promise<void> {
    if (this.queue.length === 0) {
      this.isProcessing = false;
      return;
    }
    this.isProcessing = true;
    const task = this.queue.shift()!;
    try {
      console.log(\`Executing state transition: \${task.name}\`);
      // Simulate asynchronous computational task
      await new Promise((resolve) => setTimeout(resolve, 300));
    } catch (err) {
      console.error("Scheduler execution fault:", err);
    } finally {
      this.processNext();
    }
  }
}`;

export const CodingLabView: React.FC = () => {
  const { t, trackUsage, addNotification } = useApp();

  const [code, setCode] = useState(SAMPLE_CODE);
  const [language, setLanguage] = useState("typescript");
  const [activeAction, setActiveAction] = useState<string>("explain");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [assistResult, setAssistResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);

  const languages = [
    "typescript",
    "javascript",
    "python",
    "html",
    "css",
    "sql",
    "bash",
    "go",
    "rust",
    "java",
    "cpp",
  ];

  const actions = [
    { id: "explain", label: t.code.explain, icon: FileCode, desc: "Step-by-step logic and time complexity" },
    { id: "findBugs", label: t.code.findBugs, icon: Bug, desc: "Identify memory leaks, edge cases & race conditions" },
    { id: "refactor", label: t.code.refactor, icon: Sparkles, desc: "Modernize idioms, reduce cyclomatic complexity" },
    { id: "generateTests", label: t.code.generateTests, icon: TestTube, desc: "Produce rigorous unit & regression tests" },
    { id: "generateDocs", label: t.code.generateDocs, icon: FileCode, desc: "Create complete JSDoc/docstrings and specs" },
    { id: "architectureReview", label: t.code.reviewArchitecture, icon: Layers, desc: "Analyze modularity, coupling, and scaling" },
  ];

  const handleRunAssist = async () => {
    if (!code.trim() || isLoading) return;
    setIsLoading(true);
    setAssistResult(null);

    try {
      const data = await runCodeAssist(
        activeAction,
        code,
        language,
        customPrompt
      );
      setAssistResult(data.result);
      trackUsage("request", 850);
      addNotification("Code Intelligence Ready", `Completed ${activeAction} analysis`, "success");
    } catch (err: any) {
      addNotification("Coding Assist Error", err.message || "Operation failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!assistResult) return;
    navigator.clipboard.writeText(assistResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap: Record<string, string> = {
      typescript: "ts",
      javascript: "js",
      python: "py",
      html: "html",
      css: "css",
      sql: "sql",
      bash: "sh",
      go: "go",
      rust: "rs",
      java: "java",
      cpp: "cpp",
    };
    const ext = extMap[language] || "txt";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexa_code_${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="coding-lab-view-container" className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-xs font-semibold mb-2 border border-neutral-200 dark:border-neutral-700">
            <Code2 className="w-3.5 h-3.5" />
            <span>AI Pair Architect & Sandbox</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {t.code.title}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t.code.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 focus:outline-none font-mono font-medium"
          >
            {languages.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>

          {/* Sandbox toggle for web code */}
          {(language === "html" || language === "javascript") && (
            <button
              onClick={() => setShowSandbox(!showSandbox)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                showSandbox
                  ? "bg-amber-500 text-white border-amber-600"
                  : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Sandbox</span>
            </button>
          )}

          <button
            onClick={handleDownload}
            className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
            title="Download source code"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Action Tabs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {actions.map((act) => {
          const Icon = act.icon;
          const isSelected = activeAction === act.id;
          return (
            <button
              key={act.id}
              id={`code-act-${act.id}`}
              onClick={() => setActiveAction(act.id)}
              className={`p-3 rounded-2xl border text-left transition-all ${
                isSelected
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-2xs"
                  : "bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
              }`}
            >
              <Icon className="w-4 h-4 mb-1.5" />
              <p className="font-semibold text-xs">{act.label}</p>
            </button>
          );
        })}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Editor */}
        <div className="lg:col-span-6 space-y-3">
          <div className="rounded-3xl border border-neutral-300 dark:border-neutral-800 bg-neutral-950 text-neutral-100 overflow-hidden shadow-sm flex flex-col h-[520px]">
            {/* Editor Top Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900 border-b border-neutral-800 text-xs font-mono text-neutral-400">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2">buffer.{language}</span>
              </div>
              <button
                onClick={() => setCode(SAMPLE_CODE)}
                className="text-[11px] text-neutral-400 hover:text-white"
                title="Reset to sample"
              >
                Reset Sample
              </button>
            </div>

            {/* Editor Textarea */}
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="flex-1 w-full p-4 bg-transparent resize-none font-mono text-xs text-neutral-200 focus:outline-none leading-relaxed"
            />

            {/* Custom instruction and execute footer */}
            <div className="p-3 bg-neutral-900 border-t border-neutral-800 flex items-center gap-2">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Optional refinement directive (e.g. optimize memory)..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-800 border border-neutral-700 text-xs text-white placeholder-neutral-500 focus:outline-none"
              />
              <button
                id="run-code-assist-btn"
                onClick={handleRunAssist}
                disabled={!code.trim() || isLoading}
                className="px-4 py-2 rounded-xl bg-white text-neutral-900 font-semibold text-xs hover:bg-neutral-200 transition-colors flex items-center gap-1.5 shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>Run</span>
              </button>
            </div>
          </div>

          {/* Sandbox Iframe if toggled */}
          {showSandbox && (
            <div className="p-4 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-white">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <Terminal className="w-4 h-4" />
                  Live Web Output Sandbox
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">Isolated Container</span>
              </div>
              <iframe
                srcDoc={code}
                sandbox="allow-scripts"
                className="w-full h-44 bg-white border border-neutral-300 dark:border-neutral-700 rounded-2xl shadow-inner"
                title="Sandbox preview"
              />
            </div>
          )}
        </div>

        {/* Right Column: AI Analysis Output */}
        <div className="lg:col-span-6">
          <div className="h-[520px] p-5 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                  AI Engineering Report
                </h3>
              </div>
              {assistResult && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto py-3">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3 text-center py-12">
                  <div className="w-10 h-10 rounded-full border-2 border-neutral-900 dark:border-white border-t-transparent animate-spin" />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                    Compiling AST & executing AI architecture evaluation...
                  </p>
                </div>
              ) : !assistResult ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-neutral-400">
                  <Code2 className="w-8 h-8 opacity-40" />
                  <p className="text-xs">
                    Select an action (Explain, Bugs, Refactor, Tests, Architecture) and click "Run" to perform deep static analysis.
                  </p>
                </div>
              ) : (
                <div className="markdown-body prose prose-sm dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 leading-relaxed text-xs">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {assistResult}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
