import React from "react";
import { useApp } from "../../context/AppContext";
import {
  Home,
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
  Plus,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";
import { AppSection } from "../../types";

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
}) => {
  const {
    currentSection,
    setCurrentSection,
    t,
    createNewConversation,
    usage,
    userProfile,
  } = useApp();

  const navItems: Array<{ id: AppSection; label: string; icon: React.FC<{ className?: string }>; badge?: string }> = [
    { id: "home", label: t.nav.home, icon: Home },
    { id: "chat", label: t.nav.chat, icon: MessageSquare },
    { id: "research", label: t.nav.research, icon: Compass, badge: "Deep" },
    { id: "projects", label: t.nav.projects, icon: FolderKanban },
    { id: "agents", label: t.nav.agents, icon: Bot, badge: "8" },
    { id: "knowledge", label: t.nav.knowledge, icon: BookOpen },
    { id: "documents", label: t.nav.documents, icon: FileText },
    { id: "code", label: t.nav.code, icon: Code2, badge: "Lab" },
    { id: "data", label: t.nav.data, icon: BarChart3 },
    { id: "image", label: t.nav.image, icon: Sparkles, badge: "4K" },
    { id: "voice", label: t.nav.voice, icon: Mic },
    { id: "history", label: t.nav.history, icon: Clock },
    { id: "settings", label: t.nav.settings, icon: Settings },
  ];

  const handleNavClick = (section: AppSection) => {
    setCurrentSection(section);
    onCloseMobile();
  };

  const handleNewChatClick = () => {
    createNewConversation();
    setCurrentSection("chat");
    onCloseMobile();
  };

  const usagePercent = Math.min(
    100,
    Math.round((usage.messagesSent / usage.limits.messagesLimit) * 100)
  );

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          id="mobile-sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-navigation-sidebar"
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] border-r border-neutral-200 dark:border-neutral-800 bg-neutral-50/95 dark:bg-neutral-900/95 backdrop-blur-md flex flex-col justify-between transition-all duration-200 ease-in-out ${
          isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        } ${isCollapsed ? "md:w-16" : "md:w-60"}`}
      >
        {/* Top: New Chat Action & Navigation Links */}
        <div className="p-3 flex-1 overflow-y-auto space-y-4 scrollbar-thin">
          {/* New Chat Button */}
          <button
            id="sidebar-new-chat-btn"
            onClick={handleNewChatClick}
            className={`w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium text-xs shadow-sm hover:opacity-90 transition-all ${
              isCollapsed ? "md:px-2" : ""
            }`}
            title="Start New Chat"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>{t.chat.newChat}</span>}
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors group relative ${
                    isActive
                      ? "bg-white dark:bg-neutral-800 text-neutral-950 dark:text-white shadow-2xs border border-neutral-200/80 dark:border-neutral-700/80"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                  } ${isCollapsed ? "md:justify-center md:px-0" : ""}`}
                  title={item.label}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                      isActive
                        ? "text-neutral-900 dark:text-white"
                        : "text-neutral-500 dark:text-neutral-400"
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate text-left flex-1">{item.label}</span>
                  )}
                  {!isCollapsed && item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-md font-mono bg-neutral-200/70 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Usage indicator & Collapse toggle */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
          {!isCollapsed && (
            <div className="p-2.5 rounded-xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 text-xs">
              <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 mb-1.5 font-medium">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>{userProfile.plan} Tier</span>
                </span>
                <span>{usagePercent}%</span>
              </div>
              <div className="w-full bg-neutral-100 dark:bg-neutral-700 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-neutral-900 dark:bg-white h-full rounded-full transition-all duration-500"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2 text-[10px] text-neutral-400">
                <span>{usage.messagesSent} / {usage.limits.messagesLimit} msgs</span>
                <button
                  id="sidebar-upgrade-btn"
                  onClick={() => setCurrentSection("settings")}
                  className="text-neutral-900 dark:text-white hover:underline font-medium"
                >
                  Manage
                </button>
              </div>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <div className="hidden md:flex justify-end">
            <button
              id="sidebar-collapse-toggle-btn"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
