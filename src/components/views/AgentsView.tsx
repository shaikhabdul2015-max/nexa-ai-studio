import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Bot,
  Plus,
  Edit2,
  Copy,
  Trash2,
  Play,
  Check,
  X,
  Search,
  Code2,
  BarChart3,
  PenTool,
  GraduationCap,
  Briefcase,
  FileSearch,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { AgentTemplate } from "../../types";

export const AgentsView: React.FC = () => {
  const {
    t,
    agents,
    createAgent,
    updateAgent,
    duplicateAgent,
    deleteAgent,
    toggleAgent,
    createNewConversation,
    setCurrentSection,
    addNotification,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [systemInstruction, setSystemInstruction] = useState("");
  const [personality, setPersonality] = useState("");
  const [model, setModel] = useState("gemini-3.5-flash");
  const [outputFormat, setOutputFormat] = useState("");
  const [toolsStr, setToolsStr] = useState("webSearch, documentAnalysis");

  const iconMap: Record<string, React.FC<{ className?: string }>> = {
    Search: Search,
    Code2: Code2,
    BarChart3: BarChart3,
    PenTool: PenTool,
    GraduationCap: GraduationCap,
    Briefcase: Briefcase,
    FileSearch: FileSearch,
    Sparkles: Sparkles,
  };

  const handleOpenCreate = () => {
    setName("");
    setRole("");
    setDescription("");
    setSystemInstruction("");
    setPersonality("Direct, analytical, and structured.");
    setModel("gemini-3.5-flash");
    setOutputFormat("Structured markdown analysis");
    setToolsStr("webSearch, codeSandbox");
    setEditingAgentId(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (a: AgentTemplate) => {
    setName(a.name);
    setRole(a.role);
    setDescription(a.description);
    setSystemInstruction(a.systemInstruction);
    setPersonality(a.personality);
    setModel(a.model);
    setOutputFormat(a.outputFormat);
    setToolsStr(a.tools.join(", "));
    setEditingAgentId(a.id);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) return;

    const tools = toolsStr.split(",").map((s) => s.trim()).filter(Boolean);

    if (editingAgentId) {
      updateAgent(editingAgentId, {
        name,
        role,
        description,
        systemInstruction,
        personality,
        model,
        outputFormat,
        tools,
      });
      addNotification("Agent Updated", `Changes saved to ${name}`, "success");
    } else {
      createAgent({
        name,
        role,
        description,
        systemInstruction,
        personality,
        model,
        outputFormat,
        tools,
        enabled: true,
        isBuiltIn: false,
        iconName: "Bot",
      });
      addNotification("Agent Created", `Created specialized agent: ${name}`, "success");
    }
    setIsModalOpen(false);
  };

  const handleTestAgent = (agent: AgentTemplate) => {
    createNewConversation(agent.model);
    setCurrentSection("chat");
    addNotification("Agent Engaged", `Loaded persona: ${agent.name}`, "info");
  };

  return (
    <div id="ai-agents-view-container" className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-xs font-semibold mb-2 border border-neutral-200 dark:border-neutral-700">
            <Bot className="w-3.5 h-3.5" />
            <span>Persona Specialization & Cognitive Roles</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {t.agents.title}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t.agents.subtitle}
          </p>
        </div>

        <button
          id="create-agent-btn"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.agents.createAgent}</span>
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {agents.map((agent) => {
          const Icon = iconMap[agent.iconName || "Bot"] || Bot;
          return (
            <div
              key={agent.id}
              id={`agent-card-${agent.id}`}
              className={`p-5 rounded-3xl border flex flex-col justify-between transition-all group ${
                agent.enabled
                  ? "bg-white dark:bg-neutral-850 border-neutral-200 dark:border-neutral-800 shadow-xs hover:border-neutral-300 dark:hover:border-neutral-700"
                  : "bg-neutral-50 dark:bg-neutral-900/40 border-neutral-200/60 dark:border-neutral-800/60 opacity-70"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleAgent(agent.id)}
                      title={agent.enabled ? "Disable Agent" : "Enable Agent"}
                      className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      {agent.enabled ? (
                        <ToggleRight className="w-5 h-5 text-neutral-900 dark:text-white" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-neutral-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                    {agent.name}
                  </h3>
                  {agent.isBuiltIn && (
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                      Preset
                    </span>
                  )}
                </div>

                <p className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-2">
                  {agent.role}
                </p>

                <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                  {agent.description}
                </p>

                {/* Personality & model info */}
                <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 space-y-1 text-[11px] text-neutral-400">
                  <p className="truncate">
                    <span className="font-medium text-neutral-500">Model:</span>{" "}
                    <span className="font-mono">{agent.model.replace("gemini-", "")}</span>
                  </p>
                  <p className="truncate">
                    <span className="font-medium text-neutral-500">Tools:</span>{" "}
                    {agent.tools.join(", ")}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <button
                  id={`test-agent-${agent.id}`}
                  onClick={() => handleTestAgent(agent)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Test in Chat</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => duplicateAgent(agent.id)}
                    title="Duplicate"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleOpenEdit(agent)}
                    title="Edit"
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {!agent.isBuiltIn && (
                    <button
                      onClick={() => deleteAgent(agent.id)}
                      title="Delete"
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Agent Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {editingAgentId ? "Configure AI Agent" : "Create Specialized Agent"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Ada Lovelace"
                    className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Lead Compilers Architect"
                    className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Primary objective and mission scope..."
                  className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  System Instruction / Core Prompt
                </label>
                <textarea
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  rows={3}
                  placeholder="Direct instructions given to the LLM defining constraints and methodology..."
                  className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                    Personality Tone
                  </label>
                  <input
                    type="text"
                    value={personality}
                    onChange={(e) => setPersonality(e.target.value)}
                    placeholder="e.g. Inquisitive, formal, concise"
                    className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                    Underlying Model
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none"
                  >
                    <option value="gemini-3.5-flash">Gemini 3.5 Flash (Balanced)</option>
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Reasoning)</option>
                    <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fast)</option>
                    <option value="gemini-3.8-flash">Gemini 3.8 Flash (Vision)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  Enabled Tools (comma-separated)
                </label>
                <input
                  type="text"
                  value={toolsStr}
                  onChange={(e) => setToolsStr(e.target.value)}
                  placeholder="webSearch, codeSandbox, documentAnalysis, chartEngine"
                  className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  Output Format Rule
                </label>
                <input
                  type="text"
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  placeholder="e.g. Executive bullet points with confidence scores"
                  className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold"
                >
                  Save Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
