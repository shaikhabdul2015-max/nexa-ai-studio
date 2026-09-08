import React from "react";
import { useApp } from "../../context/AppContext";
import {
  Search,
  Command,
  Mic,
  FolderKanban,
  CheckCircle2,
  AlertCircle,
  Menu,
  Moon,
  Sun,
  Globe,
} from "lucide-react";
import { LanguageCode } from "../../types";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    currentSection,
    setCurrentSection,
    language,
    setLanguage,
    theme,
    setTheme,
    projects,
    currentProjectId,
    selectProject,
    setIsCommandPaletteOpen,
    systemHealth,
    userProfile,
  } = useApp();

  const currentProj = projects.find((p) => p.id === currentProjectId);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          id="mobile-sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 md:hidden"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* NEXA AI Logo */}
        <button
          id="nexa-logo-home-btn"
          onClick={() => setCurrentSection("home")}
          className="flex items-center gap-2.5 text-left group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-sm tracking-wider shadow-sm transition-transform group-hover:scale-105">
            NX
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-neutral-900 dark:text-white text-base">
                NEXA AI
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block leading-none mt-0.5">
              One AI. Infinite Possibilities.
            </p>
          </div>
        </button>

        {/* Active Project context selector */}
        <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-neutral-200 dark:border-neutral-800">
          <FolderKanban className="w-4 h-4 text-neutral-400" />
          <select
            id="navbar-project-select"
            value={currentProjectId || ""}
            onChange={(e) => selectProject(e.target.value || null)}
            className="text-xs bg-transparent border-0 text-neutral-700 dark:text-neutral-300 focus:ring-0 cursor-pointer font-medium"
            title="Scope AI interactions to a specific project"
          >
            <option value="" className="bg-white dark:bg-neutral-900">
              Global Context (No Project)
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-neutral-900">
                Project: {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Center Search / Command Palette shortcut */}
      <div className="hidden md:flex items-center max-w-md w-full mx-4">
        <button
          id="global-search-command-btn"
          onClick={() => setIsCommandPaletteOpen(true)}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800/70 hover:bg-neutral-200/70 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60 rounded-lg transition-all"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-neutral-400" />
            <span>Search or type a command...</span>
          </div>
          <kbd className="inline-flex items-center gap-1 font-mono text-[10px] bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded px-1.5 py-0.5 shadow-2xs">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* System Health / API Indicator */}
        <div
          className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850"
          title={systemHealth.geminiConfigured ? "Gemini Models Active & Configured" : "Gemini API Key Needed"}
        >
          {systemHealth.geminiConfigured ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-700 dark:text-emerald-400">Gemini Online</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-amber-700 dark:text-amber-400">Ready</span>
            </>
          )}
        </div>

        {/* Voice Mode quick launch */}
        <button
          id="navbar-voice-trigger-btn"
          onClick={() => setCurrentSection("voice")}
          className={`p-2 rounded-lg transition-colors ${
            currentSection === "voice"
              ? "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
              : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          }`}
          title="Open Voice Mode"
          aria-label="Open Voice Mode"
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Language selector */}
        <div className="relative flex items-center">
          <Globe className="w-3.5 h-3.5 text-neutral-400 absolute left-2 pointer-events-none" />
          <select
            id="navbar-lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
            className="text-xs pl-7 pr-2 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 focus:outline-none cursor-pointer"
            aria-label="Select application language"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>
        </div>

        {/* Theme toggle */}
        <button
          id="navbar-theme-toggle-btn"
          onClick={toggleTheme}
          className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-neutral-300" /> : <Moon className="w-4 h-4 text-neutral-600" />}
        </button>

        {/* User profile / Settings trigger */}
        <button
          id="navbar-user-avatar-btn"
          onClick={() => setCurrentSection("settings")}
          className="flex items-center gap-2 pl-1 group focus:outline-none"
          title="Account Settings & Subscriptions"
        >
          <img
            src={userProfile.avatarUrl}
            alt={userProfile.name}
            className="w-7 h-7 rounded-full object-cover border border-neutral-200 dark:border-neutral-700 group-hover:border-neutral-400 transition-colors"
          />
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hidden xl:inline-block">
            {userProfile.plan}
          </span>
        </button>
      </div>
    </header>
  );
};
