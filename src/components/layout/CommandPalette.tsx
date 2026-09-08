import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext";
import {
  Search,
  MessageSquare,
  Compass,
  FolderKanban,
  Bot,
  BookOpen,
  FileText,
  Code2,
  BarChart3,
  Sparkles,
  Mic,
  Clock,
  Settings,
  X,
  ArrowRight,
} from "lucide-react";
import { AppSection } from "../../types";

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    setCurrentSection,
    createNewConversation,
    selectConversation,
    selectProject,
    conversations,
    projects,
    agents,
    knowledgeDocs,
  } = useApp();

  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === "Escape" && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  // Build searchable items
  interface PaletteItem {
    id: string;
    category: "Commands" | "Conversations" | "Projects" | "Agents" | "Knowledge";
    title: string;
    subtitle?: string;
    icon: React.FC<{ className?: string }>;
    action: () => void;
  }

  const staticCommands: PaletteItem[] = [
    {
      id: "cmd-new-chat",
      category: "Commands",
      title: "/new-chat - Start a clean AI conversation",
      icon: MessageSquare,
      action: () => {
        createNewConversation();
        setCurrentSection("chat");
      },
    },
    {
      id: "cmd-research",
      category: "Commands",
      title: "/research - Open Deep Research studio",
      icon: Compass,
      action: () => setCurrentSection("research"),
    },
    {
      id: "cmd-coding",
      category: "Commands",
      title: "/code - Launch Coding Lab & sandbox",
      icon: Code2,
      action: () => setCurrentSection("code"),
    },
    {
      id: "cmd-data",
      category: "Commands",
      title: "/data - Open Data Analyst workspace",
      icon: BarChart3,
      action: () => setCurrentSection("data"),
    },
    {
      id: "cmd-image",
      category: "Commands",
      title: "/image - Generate high-resolution visuals",
      icon: Sparkles,
      action: () => setCurrentSection("image"),
    },
    {
      id: "cmd-voice",
      category: "Commands",
      title: "/voice - Activate real-time Voice Mode",
      icon: Mic,
      action: () => setCurrentSection("voice"),
    },
    {
      id: "cmd-docs",
      category: "Commands",
      title: "/documents - Analyze PDF, DOCX, or spreadsheets",
      icon: FileText,
      action: () => setCurrentSection("documents"),
    },
    {
      id: "cmd-settings",
      category: "Commands",
      title: "/settings - Configure AI, API keys & account",
      icon: Settings,
      action: () => setCurrentSection("settings"),
    },
  ];

  const convItems: PaletteItem[] = conversations.map((c) => ({
    id: `conv-${c.id}`,
    category: "Conversations",
    title: c.title,
    subtitle: `${c.messages.length} messages · ${c.model}`,
    icon: MessageSquare,
    action: () => {
      selectConversation(c.id);
    },
  }));

  const projItems: PaletteItem[] = projects.map((p) => ({
    id: `proj-${p.id}`,
    category: "Projects",
    title: p.name,
    subtitle: `${p.category} · ${p.files.length} files`,
    icon: FolderKanban,
    action: () => {
      selectProject(p.id);
      setCurrentSection("projects");
    },
  }));

  const agentItems: PaletteItem[] = agents.map((a) => ({
    id: `agent-${a.id}`,
    category: "Agents",
    title: a.name,
    subtitle: a.role,
    icon: Bot,
    action: () => {
      createNewConversation(a.model);
      setCurrentSection("chat");
    },
  }));

  const docItems: PaletteItem[] = knowledgeDocs.map((k) => ({
    id: `know-${k.id}`,
    category: "Knowledge",
    title: k.title,
    subtitle: `${k.category} · ${k.tags.join(", ")}`,
    icon: BookOpen,
    action: () => {
      setCurrentSection("knowledge");
    },
  }));

  const allItems = [...staticCommands, ...convItems, ...projItems, ...agentItems, ...docItems];

  const filteredItems = allItems.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  }).slice(0, 12);

  const handleSelect = (item: PaletteItem) => {
    item.action();
    setIsCommandPaletteOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  return (
    <div
      id="command-palette-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
      onClick={() => setIsCommandPaletteOpen(false)}
    >
      <div
        id="command-palette-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search input header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-neutral-200 dark:border-neutral-800">
          <Search className="w-5 h-5 text-neutral-400 shrink-0" />
          <input
            ref={inputRef}
            id="command-palette-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command (/new-chat, /research) or search anything..."
            className="w-full bg-transparent border-0 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-0"
          />
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-neutral-100 dark:divide-neutral-800/50">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
              No results found for "{query}". Try a slash command like <span className="font-mono text-xs text-neutral-700 dark:text-neutral-300">/research</span>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  id={`palette-item-${item.id}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs transition-colors ${
                    isSelected
                      ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-850"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{item.title}</p>
                      {item.subtitle && (
                        <p className="text-[11px] text-neutral-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-200/50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                      {item.category}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>NEXA AI Global Dispatch</span>
        </div>
      </div>
    </div>
  );
};
