import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Settings,
  X,
  ArrowRight,
} from "lucide-react";
import { AppSection } from "../../types";
import { useApp } from "../../context/AppContext";

type PaletteCategory =
  | "Commands"
  | "Conversations"
  | "Projects"
  | "Agents"
  | "Knowledge";

interface PaletteItem {
  id: string;
  category: PaletteCategory;
  title: string;
  subtitle?: string;
  icon: React.FC<{ className?: string }>;
  action: () => void;
}

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

  /*
   * Open / close with Cmd+K on macOS
   * or Ctrl+K on Windows/Linux.
   */
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setIsCommandPaletteOpen(!isCommandPaletteOpen);
      }

      if (event.key === "Escape" && isCommandPaletteOpen) {
        event.preventDefault();
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isCommandPaletteOpen, setIsCommandPaletteOpen]);

  /*
   * Reset and focus whenever the palette opens.
   */
  useEffect(() => {
    if (!isCommandPaletteOpen) return;

    setQuery("");
    setSelectedIndex(0);

    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [isCommandPaletteOpen]);

  /*
   * Static commands.
   */
  const staticCommands = useMemo<PaletteItem[]>(
    () => [
      {
        id: "cmd-new-chat",
        category: "Commands",
        title: "/new-chat — Start a clean AI conversation",
        icon: MessageSquare,
        action: () => {
          createNewConversation();
          setCurrentSection("chat" as AppSection);
        },
      },
      {
        id: "cmd-research",
        category: "Commands",
        title: "/research — Open Deep Research studio",
        icon: Compass,
        action: () => {
          setCurrentSection("research" as AppSection);
        },
      },
      {
        id: "cmd-coding",
        category: "Commands",
        title: "/code — Launch Coding Lab & sandbox",
        icon: Code2,
        action: () => {
          setCurrentSection("code" as AppSection);
        },
      },
      {
        id: "cmd-data",
        category: "Commands",
        title: "/data — Open Data Analyst workspace",
        icon: BarChart3,
        action: () => {
          setCurrentSection("data" as AppSection);
        },
      },
      {
        id: "cmd-image",
        category: "Commands",
        title: "/image — Generate high-resolution visuals",
        icon: Sparkles,
        action: () => {
          setCurrentSection("image" as AppSection);
        },
      },
      {
        id: "cmd-voice",
        category: "Commands",
        title: "/voice — Activate real-time Voice Mode",
        icon: Mic,
        action: () => {
          setCurrentSection("voice" as AppSection);
        },
      },
      {
        id: "cmd-docs",
        category: "Commands",
        title: "/documents — Analyze PDF, DOCX, or spreadsheets",
        icon: FileText,
        action: () => {
          setCurrentSection("documents" as AppSection);
        },
      },
      {
        id: "cmd-settings",
        category: "Commands",
        title: "/settings — Configure AI, API keys & account",
        icon: Settings,
        action: () => {
          setCurrentSection("settings" as AppSection);
        },
      },
    ],
    [
      createNewConversation,
      setCurrentSection,
    ]
  );

  /*
   * Conversations.
   */
  const conversationItems = useMemo<PaletteItem[]>(
    () =>
      conversations.map((conversation) => ({
        id: `conv-${conversation.id}`,
        category: "Conversations",
        title: conversation.title,
        subtitle: `${conversation.messages.length} messages · ${conversation.model}`,
        icon: MessageSquare,
        action: () => {
          selectConversation(conversation.id);
        },
      })),
    [conversations, selectConversation]
  );

  /*
   * Projects.
   */
  const projectItems = useMemo<PaletteItem[]>(
    () =>
      projects.map((project) => ({
        id: `proj-${project.id}`,
        category: "Projects",
        title: project.name,
        subtitle: `${project.category} · ${project.files.length} files`,
        icon: FolderKanban,
        action: () => {
          selectProject(project.id);
          setCurrentSection("projects" as AppSection);
        },
      })),
    [projects, selectProject, setCurrentSection]
  );

  /*
   * Agents.
   */
  const agentItems = useMemo<PaletteItem[]>(
    () =>
      agents.map((agent) => ({
        id: `agent-${agent.id}`,
        category: "Agents",
        title: agent.name,
        subtitle: agent.role,
        icon: Bot,
        action: () => {
          createNewConversation(agent.model);
          setCurrentSection("chat" as AppSection);
        },
      })),
    [agents, createNewConversation, setCurrentSection]
  );

  /*
   * Knowledge documents.
   */
  const knowledgeItems = useMemo<PaletteItem[]>(
    () =>
      knowledgeDocs.map((document) => ({
        id: `know-${document.id}`,
        category: "Knowledge",
        title: document.title,
        subtitle: `${document.category} · ${document.tags.join(", ")}`,
        icon: BookOpen,
        action: () => {
          setCurrentSection("knowledge" as AppSection);
        },
      })),
    [knowledgeDocs, setCurrentSection]
  );

  /*
   * All searchable items.
   */
  const allItems = useMemo(
    () => [
      ...staticCommands,
      ...conversationItems,
      ...projectItems,
      ...agentItems,
      ...knowledgeItems,
    ],
    [
      staticCommands,
      conversationItems,
      projectItems,
      agentItems,
      knowledgeItems,
    ]
  );

  /*
   * Search / filter.
   */
  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return allItems.slice(0, 12);
    }

    return allItems
      .filter((item) => {
        const searchableText = [
          item.title,
          item.subtitle ?? "",
          item.category,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
      .slice(0, 12);
  }, [allItems, query]);

  /*
   * Keep selected index valid whenever search results change.
   */
  useEffect(() => {
    setSelectedIndex((current) => {
      if (filteredItems.length === 0) return 0;
      return Math.min(current, filteredItems.length - 1);
    });
  }, [filteredItems.length]);

  /*
   * Execute selected item.
   */
  const handleSelect = (item: PaletteItem) => {
    item.action();
    setIsCommandPaletteOpen(false);
  };

  /*
   * Keyboard navigation inside the palette.
   */
  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setSelectedIndex((current) => {
        if (filteredItems.length === 0) return 0;
        return (current + 1) % filteredItems.length;
      });

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setSelectedIndex((current) => {
        if (filteredItems.length === 0) return 0;
        return (
          (current - 1 + filteredItems.length) %
          filteredItems.length
        );
      });

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const selectedItem = filteredItems[selectedIndex];

      if (selectedItem) {
        handleSelect(selectedItem);
      }

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsCommandPaletteOpen(false);
    }
  };

  if (!isCommandPaletteOpen) {
    return null;
  }

  const selectedItemId =
    filteredItems[selectedIndex]?.id ?? undefined;

  return (
    <div
      id="command-palette-modal-backdrop"
      role="presentation"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 pt-20 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setIsCommandPaletteOpen(false);
        }
      }}
    >
      <div
        id="command-palette-container"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150 dark:border-neutral-800 dark:bg-neutral-900"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 border-b border-neutral-200 px-4 py-3.5 dark:border-neutral-800">
          <Search
            className="h-5 w-5 shrink-0 text-neutral-400"
            aria-hidden="true"
          />

          <input
            ref={inputRef}
            id="command-palette-input"
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command or search anything..."
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            aria-label="Search commands"
            aria-controls="command-palette-results"
            aria-activedescendant={
              selectedItemId
                ? `palette-item-${selectedItemId}`
                : undefined
            }
            className="w-full border-0 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 focus:ring-0 dark:text-white"
          />

          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(false)}
            aria-label="Close command palette"
            className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Results */}
        <div
          id="command-palette-results"
          role="listbox"
          aria-label="Command palette results"
          className="max-h-96 overflow-y-auto p-2"
        >
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
              No results found for{" "}
              <span className="font-medium text-neutral-700 dark:text-neutral-200">
                "{query}"
              </span>
              .
              <div className="mt-2 text-xs">
                Try{" "}
                <span className="font-mono text-neutral-700 dark:text-neutral-300">
                  /research
                </span>
                ,{" "}
                <span className="font-mono text-neutral-700 dark:text-neutral-300">
                  /code
                </span>
                , or{" "}
                <span className="font-mono text-neutral-700 dark:text-neutral-300">
                  /new-chat
                </span>
                .
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={item.id}
                    id={`palette-item-${item.id}`}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex w-full items-center justify-between rounded-xl p-3 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-neutral-100 text-neutral-950 dark:bg-neutral-800 dark:text-white"
                        : "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800/70"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-lg bg-neutral-200/60 p-2 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                        <Icon
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium">
                          {item.title}
                        </p>

                        {item.subtitle && (
                          <p className="mt-0.5 truncate text-[11px] text-neutral-400">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="ml-3 flex shrink-0 items-center gap-2">
                      <span className="rounded bg-neutral-200/50 px-1.5 py-0.5 font-mono text-[10px] uppercase text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                        {item.category}
                      </span>

                      <ArrowRight
                        className="h-3.5 w-3.5 text-neutral-400"
                        aria-hidden="true"
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-neutral-100 bg-neutral-50 px-4 py-2 font-mono text-[11px] text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>

          <span className="hidden sm:inline">
            NEXA AI Global Dispatch
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;

ध्यान दें: ऊपर मैंने "useApp" का import यह मानकर रखा है:

import { useApp } from "../../context/AppContext";

अगर आपके project में "useApp" किसी दूसरी file से export होता है, तो सिर्फ उस import path को अपने project के actual path से बदलना होगा।

और अगर "AppSection" पहले से string union की तरह काम कर रहा है, तो "as AppSection" की जरूरत नहीं होगी। यदि TypeScript error आए, तो आपका "useApp" वाला file/import और "AppSection" type भेज दें—मैं उसी हिसाब से exact version बना दूँगा।