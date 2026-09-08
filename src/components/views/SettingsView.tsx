import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Settings,
  Globe,
  Moon,
  Sun,
  Monitor,
  Brain,
  Shield,
  CreditCard,
  Trash2,
  Download,
  Check,
  Zap,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Plus,
  RefreshCw,
} from "lucide-react";
import { LanguageCode } from "../../types";

export const SettingsView: React.FC = () => {
  const {
    t,
    language,
    setLanguage,
    theme,
    setTheme,
    userProfile,
    setUserProfile,
    usage,
    memories,
    memoryEnabled,
    setMemoryEnabled,
    addMemory,
    deleteMemory,
    clearAllMemories,
    addNotification,
    systemHealth,
    refreshHealth,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"general" | "ai" | "memory" | "subscription" | "security">("general");

  // Form states for memory addition
  const [newMemKey, setNewMemKey] = useState("");
  const [newMemVal, setNewMemVal] = useState("");

  // AI model default preferences
  const [defaultModel, setDefaultModel] = useState("gemini-3.5-flash");
  const [temperature, setTemperature] = useState(0.7);
  const [systemDirective, setSystemDirective] = useState("Be concise, accurate, and type-safe.");

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemKey.trim() || !newMemVal.trim()) return;
    addMemory(newMemKey, newMemVal, "user_preference");
    setNewMemKey("");
    setNewMemVal("");
    addNotification("Memory Saved", "Added rule to long-term assistant context.", "success");
  };

  const handlePlanUpgrade = (tier: "Pro" | "Enterprise") => {
    setUserProfile((prev) => ({ ...prev, plan: tier }));
    addNotification("Plan Updated", `Your account is now on ${tier} tier.`, "success");
  };

  const handleExportData = () => {
    const backup = {
      profile: userProfile,
      usage,
      memories,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexa_account_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addNotification("Data Exported", "Complete profile & memory snapshot downloaded.", "success");
  };

  const handleClearCache = () => {
    if (confirm("Reset local settings and purge cache? Your conversations and saved data will be preserved.")) {
      localStorage.removeItem("nexa_theme");
      addNotification("Cache Purged", "Local client state refreshed.", "info");
    }
  };

  return (
    <div id="settings-view-container" className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-xs font-semibold mb-2 border border-neutral-200 dark:border-neutral-700">
          <Settings className="w-3.5 h-3.5" />
          <span>System & Preferences Management</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
          {t.settings.title}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {t.settings.subtitle}
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-neutral-200 dark:border-neutral-800 pb-2 overflow-x-auto">
        {[
          { id: "general", label: t.settings.general, icon: Sliders },
          { id: "ai", label: t.settings.aiConfig, icon: Brain },
          { id: "memory", label: t.settings.memory, icon: Sparkles },
          { id: "subscription", label: t.settings.accountPlan, icon: CreditCard },
          { id: "security", label: t.settings.security, icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                isSelected
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-2xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* General Settings Tab */}
      {activeTab === "general" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Application Appearance & Localization
            </h3>

            {/* Language Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                  {t.settings.language}
                </p>
                <p className="text-[11px] text-neutral-400">
                  Select your primary interface language (English, Hindi, Marathi).
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { code: "en", label: "English" },
                  { code: "hi", label: "हिंदी (Hindi)" },
                  { code: "mr", label: "मराठी (Marathi)" },
                ].map((item) => (
                  <button
                    key={item.code}
                    onClick={() => setLanguage(item.code as LanguageCode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
                      language === item.code
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                        : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
              <div>
                <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                  {t.settings.theme}
                </p>
                <p className="text-[11px] text-neutral-400">
                  Choose light, dark or automatic system matching theme.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { id: "light", label: "Light", icon: Sun },
                  { id: "dark", label: "Dark", icon: Moon },
                  { id: "system", label: "System", icon: Monitor },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTheme(item.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                        theme === item.id
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                          : "bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Configuration Tab */}
      {activeTab === "ai" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Default LLM Model & Generation Parameters
              </h3>
              <button
                onClick={refreshHealth}
                className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                title="Verify Gemini API connectivity"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Check Status</span>
              </button>
            </div>

            {/* Model Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Default AI Model
              </label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none font-medium"
              >
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (General / Default)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Complex Reasoning & STEM)</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Low-Latency Speed)</option>
                <option value="gemini-3.8-flash">Gemini 3.8 Flash (Multimodal Vision)</option>
              </select>
            </div>

            {/* Temperature Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  Temperature: {temperature}
                </span>
                <span className="text-[11px] text-neutral-400">
                  {temperature < 0.4 ? "Predictable & Deterministic" : temperature > 0.8 ? "Creative & Exploratory" : "Balanced"}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.2"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-neutral-900 dark:accent-white cursor-pointer"
              />
            </div>

            {/* Global System Instruction */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Global System Instruction Directive
              </label>
              <textarea
                value={systemDirective}
                onChange={(e) => setSystemDirective(e.target.value)}
                rows={3}
                placeholder="Direct instruction injected to all sessions..."
                className="w-full p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>
      )}

      {/* Memory Management Tab */}
      {activeTab === "memory" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                  Long-term Personal Context & Memory
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Allows NEXA AI to remember your preferences, coding conventions, and instructions.
                </p>
              </div>

              {/* Master Memory Switch */}
              <button
                onClick={() => setMemoryEnabled(!memoryEnabled)}
                className="flex items-center gap-1 text-xs font-semibold text-neutral-900 dark:text-white"
              >
                {memoryEnabled ? (
                  <>
                    <ToggleRight className="w-6 h-6 text-emerald-500" />
                    <span>Active</span>
                  </>
                ) : (
                  <>
                    <ToggleLeft className="w-6 h-6 text-neutral-400" />
                    <span>Disabled</span>
                  </>
                )}
              </button>
            </div>

            {/* Add memory item form */}
            <form onSubmit={handleAddMemory} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-3">
              <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                Add New Preference / Fact
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={newMemKey}
                  onChange={(e) => setNewMemKey(e.target.value)}
                  placeholder="Key (e.g. Tone, Programming Language)"
                  className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none"
                />
                <input
                  type="text"
                  required
                  value={newMemVal}
                  onChange={(e) => setNewMemVal(e.target.value)}
                  placeholder="Value / Constraint"
                  className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save to Memory</span>
              </button>
            </form>

            {/* Stored memories list */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                <span>Stored Memories ({memories.length})</span>
                {memories.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("Purge all memories?")) clearAllMemories();
                    }}
                    className="text-neutral-400 hover:text-rose-500"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {memories.length === 0 ? (
                <p className="text-xs text-neutral-400 p-4 text-center">
                  No active memories stored.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {memories.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-xs border border-neutral-200/80 dark:border-neutral-700/80"
                    >
                      <div>
                        <span className="font-bold text-neutral-900 dark:text-white mr-2">
                          {m.key}:
                        </span>
                        <span className="text-neutral-600 dark:text-neutral-300 font-mono text-[11px]">
                          {m.value}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteMemory(m.id)}
                        className="p-1 rounded text-neutral-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Subscription & Usage Plan Tab */}
      {activeTab === "subscription" && (
        <div className="space-y-6">
          {/* Usage Metrics Overview */}
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Resource Consumption & Quotas
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 text-xs">
                <p className="text-neutral-400">Messages Sent</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-white mt-1">
                  {usage.messagesSent} / {usage.limits.messagesLimit}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 text-xs">
                <p className="text-neutral-400">Research Tasks</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-white mt-1">
                  {usage.researchTasks} / {usage.limits.researchLimit}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 text-xs">
                <p className="text-neutral-400">Image Gens (4K)</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-white mt-1">
                  {usage.imageGenerations} / {usage.limits.imageLimit}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 text-xs">
                <p className="text-neutral-400">Estimated Tokens</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-white mt-1">
                  {(usage.estimatedTokens / 1000).toFixed(1)}k
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                tier: "Free",
                price: "$0",
                desc: "Standard exploration",
                features: ["Gemini 3.1 Flash Lite", "100 msgs / day", "Standard speed"],
              },
              {
                tier: "Pro",
                price: "$20",
                period: "/ month",
                desc: "Full multimodal professional tier",
                features: [
                  "Gemini 3.5 Flash & 3.1 Pro",
                  "4K Image Generation",
                  "Deep Web Research Grounding",
                  "Unlimited Project Workspaces",
                  "Priority GPU processing",
                ],
                popular: true,
              },
              {
                tier: "Enterprise",
                price: "$120",
                period: "/ month",
                desc: "Dedicated organization clusters",
                features: [
                  "Custom fine-tuned adapters",
                  "Audit log exports",
                  "SLA Guarantee",
                  "Dedicated throughput",
                ],
              },
            ].map((plan) => {
              const isCurrent = userProfile.plan === plan.tier;
              return (
                <div
                  key={plan.tier}
                  className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                    isCurrent
                      ? "bg-white dark:bg-neutral-850 border-neutral-900 dark:border-white shadow-md ring-2 ring-neutral-400"
                      : "bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-800 shadow-2xs"
                  }`}
                >
                  <div>
                    {plan.popular && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 mb-2 inline-block">
                        Active Choice
                      </span>
                    )}
                    <h4 className="text-base font-bold text-neutral-900 dark:text-white">
                      {plan.tier}
                    </h4>
                    <div className="flex items-baseline gap-1 mt-1 mb-2">
                      <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className="text-xs text-neutral-400">{plan.period}</span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 mb-4">{plan.desc}</p>

                    <div className="space-y-2 border-t border-neutral-100 dark:border-neutral-800 pt-3 text-xs">
                      {plan.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handlePlanUpgrade(plan.tier as any)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold mt-6 transition-all ${
                      isCurrent
                        ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-default"
                        : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 shadow-sm"
                    }`}
                  >
                    {isCurrent ? "Current Plan" : `Upgrade to ${plan.tier}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Security & Data Privacy Tab */}
      {activeTab === "security" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-5">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
              Data Privacy & Security Policies
            </h3>

            <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <p className="font-semibold text-neutral-900 dark:text-white mb-1">
                  1. Zero Client-Side Secret Exposure
                </p>
                <p>
                  Gemini API keys are protected exclusively within the containerized Express backend server. No confidential API credentials are ever serialized into browser JavaScript.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <p className="font-semibold text-neutral-900 dark:text-white mb-1">
                  2. Isolated Code Execution
                </p>
                <p>
                  User and AI code executions are evaluated strictly inside sandboxed iframe containers with disabled privilege access to external storage or network tokens.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                <p className="font-semibold text-neutral-900 dark:text-white mb-1">
                  3. Tool Permission Authorizations
                </p>
                <p>
                  Consequential tool invocations require explicit user consent via the interactive permission gate modal before external operations proceed.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap gap-3">
              <button
                onClick={handleExportData}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Personal Data Snapshot</span>
              </button>

              <button
                onClick={handleClearCache}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                <span>Purge Client Cache</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
