import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  MessageSquare,
  Compass,
  FileText,
  BarChart3,
  Sparkles,
  Code2,
  Bot,
  Search,
  ArrowRight,
  FolderKanban,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { AppSection } from "../../types";

export const HomeView: React.FC = () => {
  const {
    t,
    setCurrentSection,
    createNewConversation,
    selectConversation,
    selectProject,
    conversations,
    projects,
    systemHealth,
  } = useApp();

  const [homeSearch, setHomeSearch] = useState("");

  const quickActions: Array<{
    id: string;
    title: string;
    desc: string;
    icon: React.FC<{ className?: string }>;
    section: AppSection;
    badge?: string;
    action?: () => void;
  }> = [
    {
      id: "qa-chat",
      title: t.home.startNewChat,
      desc: "Multi-turn streaming chat with multimodal vision and reasoning",
      icon: MessageSquare,
      section: "chat",
      action: () => {
        createNewConversation();
        setCurrentSection("chat");
      },
    },
    {
      id: "qa-research",
      title: t.home.deepResearch,
      desc: "Rigorous web investigation with source verification & citations",
      icon: Compass,
      section: "research",
      badge: "Grounded",
    },
    {
      id: "qa-docs",
      title: t.home.analyzeDocument,
      desc: "Extract data, compare contracts, and summarize complex PDFs",
      icon: FileText,
      section: "documents",
    },
    {
      id: "qa-data",
      title: t.home.analyzeData,
      desc: "Upload CSV/tabular files for statistics, trends & visual charts",
      icon: BarChart3,
      section: "data",
    },
    {
      id: "qa-image",
      title: t.home.createImage,
      desc: "High-resolution generation up to 4K using Google Gemini",
      icon: Sparkles,
      section: "image",
      badge: "4K Res",
    },
    {
      id: "qa-code",
      title: t.home.startCoding,
      desc: "Full-featured IDE with syntax highlight, sandbox & AI pair engineer",
      icon: Code2,
      section: "code",
    },
    {
      id: "qa-agent",
      title: t.home.createAgent,
      desc: "Build or customize specialized agents from 8 curated templates",
      icon: Bot,
      section: "agents",
    },
  ];

  const recentConvs = conversations.slice(0, 4);
  const recentProjects = projects.slice(0, 3);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeSearch.trim()) return;
    const newId = createNewConversation();
    setCurrentSection("chat");
  };

  return (
    <div id="home-dashboard-view" className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Hero Welcome Banner */}
      <section className="p-6 md:p-10 rounded-3xl bg-linear-to-b from-neutral-100 to-white dark:from-neutral-850 dark:to-neutral-900 border border-neutral-200 dark:border-neutral-800 relative overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-200/70 dark:bg-neutral-800 text-[11px] font-medium text-neutral-800 dark:text-neutral-300 mb-4 border border-neutral-300/60 dark:border-neutral-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>NEXA Next-Gen Multimodal Architecture</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white leading-tight">
            {t.home.welcome}
          </h1>
          <p className="text-base text-neutral-600 dark:text-neutral-300 mt-2 font-medium">
            {t.tagline}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
            {t.home.subtitle}
          </p>

          {/* Global Search Input Box */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="home-global-search-input"
                type="text"
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
                placeholder={t.home.searchPlaceholder}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-neutral-800/90 border border-neutral-200 dark:border-neutral-700 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white transition-all shadow-xs"
              />
            </div>
            <button
              id="home-search-submit-btn"
              type="submit"
              className="px-5 py-3 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-medium hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1.5 shadow-sm"
            >
              <span>Explore</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick status line */}
          <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Gemini 3.5 & 3.1 Pro Ready</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
              <span>Isolated Memory & Context</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Real-time SSE Streaming</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
            {t.home.quickActions}
          </h2>
          <span className="text-xs text-neutral-400">7 Core Modalities</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.id}
                id={`qa-btn-${qa.id}`}
                onClick={() => {
                  if (qa.action) qa.action();
                  else setCurrentSection(qa.section);
                }}
                className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-left hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    {qa.badge && (
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                        {qa.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm text-neutral-900 dark:text-white group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                    {qa.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    {qa.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-medium text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">
                  <span>Launch module</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recents: Recent Conversations & Active Projects */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Conversations */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neutral-400" />
                <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
                  {t.home.recentChats}
                </h3>
              </div>
              <button
                onClick={() => setCurrentSection("chat")}
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                View all
              </button>
            </div>

            <div className="space-y-2">
              {recentConvs.map((conv) => (
                <button
                  key={conv.id}
                  id={`home-conv-${conv.id}`}
                  onClick={() => {
                    selectConversation(conv.id);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MessageSquare className="w-4 h-4 text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-neutral-900 dark:text-white truncate">
                        {conv.title}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {conv.messages.length} messages · {conv.model}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-neutral-400 shrink-0 ml-2">
                    {new Date(conv.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={() => {
                createNewConversation();
                setCurrentSection("chat");
              }}
              className="text-xs font-medium text-neutral-900 dark:text-white hover:underline flex items-center gap-1"
            >
              <span>+ Start a fresh dialog</span>
            </button>
          </div>
        </div>

        {/* Active Projects */}
        <div className="p-5 rounded-2xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-neutral-400" />
                <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
                  {t.home.recentProjects}
                </h3>
              </div>
              <button
                onClick={() => setCurrentSection("projects")}
                className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                Manage projects
              </button>
            </div>

            <div className="space-y-2">
              {recentProjects.map((p) => (
                <button
                  key={p.id}
                  id={`home-project-${p.id}`}
                  onClick={() => {
                    selectProject(p.id);
                    setCurrentSection("projects");
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-neutral-900 dark:text-white truncate">
                        {p.name}
                      </p>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-neutral-200/60 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-mono">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                      {p.description}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              onClick={() => setCurrentSection("projects")}
              className="text-xs font-medium text-neutral-900 dark:text-white hover:underline flex items-center gap-1"
            >
              <span>+ Create new workspace project</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
