import React, { useState, useRef } from "react";
import { useApp } from "../../context/AppContext";
import {
  FileText,
  Upload,
  Search,
  Sparkles,
  ArrowRight,
  Check,
  Copy,
  Download,
  Loader2,
  Table,
  ListOrdered,
  FileCheck,
  Languages,
  X,
} from "lucide-react";
import { runDocumentAnalysis } from "../../services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const DocumentsView: React.FC = () => {
  const { t, trackUsage, addNotification } = useApp();

  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; type: string; size: number; content?: string; base64?: string }>
  >([]);
  const [selectedTask, setSelectedTask] = useState<string>("Summarize document");
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const tasks = [
    { id: "Summarize document", label: t.documents.summarize, icon: FileText },
    { id: "Ask questions about document", label: t.documents.askQuestion, icon: Search },
    { id: "Extract key terms", label: t.documents.extractTerms, icon: Sparkles },
    { id: "Extract tables", label: t.documents.extractTables, icon: Table },
    { id: "Compare two documents", label: t.documents.compareDocs, icon: FileCheck },
    { id: "Generate action items", label: t.documents.actionItems, icon: ListOrdered },
    { id: "Translate document", label: t.documents.translate, icon: Languages },
  ];

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 25 * 1024 * 1024) {
        addNotification("File Exceeds Limit", "Max document size is 25MB", "error");
        continue;
      }

      const reader = new FileReader();
      if (file.type.startsWith("image/") || file.type.includes("pdf")) {
        reader.readAsDataURL(file);
        reader.onload = () => {
          setUploadedFiles((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type || "application/octet-stream",
              size: file.size,
              base64: reader.result as string,
            },
          ]);
        };
      } else {
        reader.readAsText(file);
        reader.onload = () => {
          setUploadedFiles((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type || "text/plain",
              size: file.size,
              content: reader.result as string,
            },
          ]);
        };
      }
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (uploadedFiles.length === 0) {
      addNotification("No Document Uploaded", "Please upload at least one document first.", "warning");
      return;
    }

    if (selectedTask === "Compare two documents" && uploadedFiles.length < 2) {
      addNotification("Multiple Documents Required", "Please upload at least 2 documents to compare.", "warning");
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      const data = await runDocumentAnalysis(
        selectedTask,
        question,
        uploadedFiles.map((f) => ({
          name: f.name,
          type: f.type,
          content: f.content,
          base64: f.base64,
        }))
      );
      setAnalysisResult(data.analysis);
      trackUsage("file", 900);
      addNotification("Analysis Finished", "Document intelligence report ready.", "success");
    } catch (err: any) {
      addNotification("Analysis Error", err.message || "Failed to analyze document.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!analysisResult) return;
    navigator.clipboard.writeText(analysisResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="document-ai-view-container" className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-xs font-semibold mb-2 border border-neutral-200 dark:border-neutral-700">
          <FileText className="w-3.5 h-3.5" />
          <span>Multimodal Document Intelligence</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {t.documents.title}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {t.documents.subtitle}
        </p>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Box & Analysis Settings */}
        <div className="lg:col-span-5 space-y-5">
          {/* Drag and drop upload zone */}
          <div
            id="doc-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="p-8 rounded-3xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50/70 dark:bg-neutral-850/60 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors text-center cursor-pointer flex flex-col items-center justify-center space-y-3"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.csv,.json,.md"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <div className="w-12 h-12 rounded-2xl bg-neutral-200/80 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                {t.documents.dropzone}
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                PDF, DOCX, TXT, CSV, JSON, Markdown (up to 25MB)
              </p>
            </div>
          </div>

          {/* Uploaded files stack */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                <span>Active Documents ({uploadedFiles.length})</span>
                <button
                  onClick={() => setUploadedFiles([])}
                  className="text-neutral-400 hover:text-rose-500"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-1.5">
                {uploadedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="font-medium text-neutral-900 dark:text-white truncate">
                        {f.name}
                      </span>
                      <span className="text-[10px] text-neutral-400 shrink-0 font-mono">
                        {(f.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      className="p-1 rounded text-neutral-400 hover:text-rose-500"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Task selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Analysis Objective
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {tasks.map((task) => {
                const Icon = task.icon;
                const isSelected = selectedTask === task.id;
                return (
                  <button
                    key={task.id}
                    id={`doc-task-${task.id}`}
                    onClick={() => setSelectedTask(task.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-xs font-medium transition-colors ${
                      isSelected
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-2xs"
                        : "bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{task.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Question / Instructions */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              Specific Questions or Target Focus (Optional)
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={2}
              placeholder="e.g. Highlight termination clauses, liabilities, and effective renewal terms..."
              className="w-full p-3 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />
          </div>

          {/* Run button */}
          <button
            id="run-doc-analysis-btn"
            onClick={handleAnalyze}
            disabled={uploadedFiles.length === 0 || isLoading}
            className="w-full py-3 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting Document Intelligence...</span>
              </>
            ) : (
              <>
                <span>Run Document AI Analysis</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* Right Column: Output Report */}
        <div className="lg:col-span-7">
          <div className="h-full min-h-[480px] p-6 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-400" />
                <h2 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Analysis Dossier
                </h2>
              </div>
              {analysisResult && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3 text-center py-12">
                  <div className="w-10 h-10 rounded-full border-2 border-neutral-900 dark:border-white border-t-transparent animate-spin" />
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
                    Tokenizing document pages & synthesizing semantic clauses...
                  </p>
                </div>
              ) : !analysisResult ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-neutral-400">
                  <FileText className="w-8 h-8 opacity-40" />
                  <p className="text-xs">
                    Upload your documents and select an objective to generate structured executive summaries, table extractions, or clause comparisons.
                  </p>
                </div>
              ) : (
                <div className="markdown-body prose prose-sm dark:prose-invert max-w-none text-neutral-800 dark:text-neutral-200 leading-relaxed text-xs">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {analysisResult}
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
