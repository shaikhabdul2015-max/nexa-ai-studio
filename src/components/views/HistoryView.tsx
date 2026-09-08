import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Clock,
  Search,
  MessageSquare,
  Compass,
  FileText,
  Sparkles,
  Trash2,
  Download,
  Calendar,
  FolderKanban,
  ArrowRight,
  Pin,
  Archive,
} from "lucide-react";

export const HistoryView: React.FC = () => {
  const {
    t,
    conversations,
    selectConversation,
    deleteConversation,
    pinConversation,
    archiveConversation,
    projects,
    addNotification,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<"all" | "today" | "week" | "archived">("all");
  const [filterProject, setFilterProject] = useState<string>("all");

  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const sevenDays = 7 * oneDay;

  const filteredConversations = conversations.filter((c) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = c.title.toLowerCase().includes(q);
      const matchContent = c.messages.some((m) => m.content.toLowerCase().includes(q));
      if (!matchTitle && !matchContent) return false;
    }

    // Project filter
    if (filterProject !== "all" && c.projectId !== filterProject) {
      return false;
    }

    // Period filter
    const createdTime = new Date(c.updatedAt || c.createdAt).getTime();
    if ((filterPeriod as string) === "archived") return !!c.archived;
    if (c.archived) return false;

    if (filterPeriod === "today") {
      return now - createdTime < oneDay;
    } else if (filterPeriod === "week") {
      return now - createdTime < sevenDays;
    }
    return true;
  });

  const handleExportAll = () => {
    const dataStr = JSON.stringify(conversations, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexa_conversations_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification("Export Complete", `Exported ${conversations.length} conversation transcripts.`, "success");
  };

  return (
    <div id="unified-history-view" className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-xs font-semibold mb-2 border border-neutral-200 dark:border-neutral-700">
            <Clock className="w-3.5 h-3.5" />
            <span>Audit Trail & Historical Records</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {t.history.title}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t.history.subtitle}
          </p>
        </div>

        <button
          onClick={handleExportAll}
          className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export All History (JSON)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.history.searchPlaceholder}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 border-0 focus:ring-1 focus:ring-neutral-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Time Filter */}
          <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
            {(["all", "today", "week", "archived"] as const).map((period) => (
              <button
                key={period}
                onClick={() => setFilterPeriod(period)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                  filterPeriod === period
                    ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-2xs"
                    : "text-neutral-600 dark:text-neutral-400"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          {/* Project Filter */}
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border-0 text-neutral-800 dark:text-neutral-200 font-medium"
          >
            <option value="all">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        {filteredConversations.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <Clock className="w-8 h-8 text-neutral-400 mx-auto" />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">
              No matching records found in conversation history.
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const project = projects.find((p) => p.id === conv.projectId);
            return (
              <div
                key={conv.id}
                id={`history-row-${conv.id}`}
                onClick={() => selectConversation(conv.id)}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs cursor-pointer transition-all gap-3 group"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 group-hover:bg-neutral-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-neutral-900 transition-colors shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-xs text-neutral-900 dark:text-white truncate">
                        {conv.title}
                      </h3>
                      {conv.pinned && (
                        <Pin className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                      )}
                      {project && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-200/70 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                          {project.name}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-neutral-400">
                        {conv.model}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate mt-1">
                      {conv.messages[conv.messages.length - 1]?.content.slice(0, 80) || "No messages"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800">
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {new Date(conv.updatedAt).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        pinConversation(conv.id);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title={conv.pinned ? "Unpin" : "Pin"}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveConversation(conv.id);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title={conv.archived ? "Unarchive" : "Archive"}
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${conv.title}"?`)) {
                          deleteConversation(conv.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
