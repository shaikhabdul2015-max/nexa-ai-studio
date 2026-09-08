import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  FolderKanban,
  Plus,
  FileText,
  MessageSquare,
  Trash2,
  Edit2,
  Upload,
  Brain,
  ArrowRight,
  ExternalLink,
  Check,
  X,
} from "lucide-react";
import { Project, ProjectCategory } from "../../types";

export const ProjectsView: React.FC = () => {
  const {
    t,
    projects,
    currentProjectId,
    selectProject,
    createProject,
    updateProject,
    deleteProject,
    addFileToProject,
    createNewConversation,
    setCurrentSection,
    conversations,
    addNotification,
  } = useApp();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProjId, setEditingProjId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [category, setCategory] = useState<ProjectCategory>("Coding");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");

  const categories: ProjectCategory[] = [
    "Research",
    "Coding",
    "Writing",
    "Business",
    "Learning",
    "Custom",
  ];

  const activeProject = projects.find((p) => p.id === currentProjectId) || projects[0];

  const handleOpenCreate = () => {
    setName("");
    setCategory("Coding");
    setDescription("");
    setInstructions("");
    setEditingProjId(null);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (p: Project) => {
    setName(p.name);
    setCategory(p.category);
    setDescription(p.description);
    setInstructions(p.instructions);
    setEditingProjId(p.id);
    setIsCreateOpen(true);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingProjId) {
      updateProject(editingProjId, {
        name,
        category,
        description,
        instructions,
      });
      addNotification("Project Updated", `Saved changes to ${name}`, "success");
    } else {
      const created = createProject({
        name,
        category,
        description,
        instructions,
      });
      selectProject(created.id);
      addNotification("Project Created", `Initialized workspace for ${name}`, "success");
    }
    setIsCreateOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeProject) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      addFileToProject(activeProject.id, {
        name: file.name,
        size: file.size,
        type: file.type || "text/plain",
      });
    }
    addNotification("Files Added", `Attached ${files.length} file(s) to project.`, "success");
  };

  const handleStartProjectChat = () => {
    if (!activeProject) return;
    const newId = createNewConversation("gemini-3.5-flash", activeProject.id);
    setCurrentSection("chat");
  };

  // Associated conversations
  const projectConversations = conversations.filter(
    (c) => c.projectId === activeProject?.id
  );

  return (
    <div id="projects-view-container" className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300 text-xs font-semibold mb-2 border border-neutral-200 dark:border-neutral-700">
            <FolderKanban className="w-3.5 h-3.5" />
            <span>Scoped Knowledge & Context Workspaces</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            {t.projects.title}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {t.projects.subtitle}
          </p>
        </div>

        <button
          id="create-project-btn"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.projects.newProject}</span>
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Projects List */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            All Projects ({projects.length})
          </h2>
          <div className="space-y-2">
            {projects.map((p) => {
              const isSelected = p.id === activeProject?.id;
              return (
                <div
                  key={p.id}
                  id={`project-card-${p.id}`}
                  onClick={() => selectProject(p.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all text-left ${
                    isSelected
                      ? "bg-white dark:bg-neutral-850 border-neutral-900 dark:border-white shadow-sm"
                      : "bg-neutral-50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {p.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenEdit(p);
                        }}
                        className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                        title="Edit Project"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {projects.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete project "${p.name}"?`)) {
                              deleteProject(p.id);
                            }
                          }}
                          className="p-1 rounded text-neutral-400 hover:text-rose-600"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
                    {p.name}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                    {p.description}
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                    <span>{p.files.length} attached files</span>
                    <span>Updated {new Date(p.updatedAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Project Detail Workspace */}
        {activeProject && (
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-6">
              {/* Project Header & Quick Chat Launcher */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                      {activeProject.category}
                    </span>
                    <span className="text-xs text-neutral-400">
                      Created {new Date(activeProject.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white mt-1.5">
                    {activeProject.name}
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                    {activeProject.description}
                  </p>
                </div>

                <button
                  id="project-chat-launch-btn"
                  onClick={handleStartProjectChat}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity shadow-sm"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>New Chat in Project</span>
                </button>
              </div>

              {/* Custom Instructions / System Persona */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-purple-500" />
                    <span>Project System Persona & Instructions</span>
                  </h3>
                  <button
                    onClick={() => handleOpenEdit(activeProject)}
                    className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                  >
                    Edit
                  </button>
                </div>
                <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 text-xs text-neutral-700 dark:text-neutral-300 font-mono leading-relaxed">
                  {activeProject.instructions || "No custom instructions specified. Standard NEXA directives apply."}
                </div>
              </div>

              {/* Project Files & Attachments */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Project Context Files ({activeProject.files.length})
                  </h3>
                  <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs text-neutral-900 dark:text-white font-medium hover:underline">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>

                {activeProject.files.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-dashed border-neutral-300 dark:border-neutral-700 text-center text-xs text-neutral-400">
                    No files attached yet. Upload specifications, datasets, or documentation to prime the project's AI context.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {activeProject.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-neutral-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900 dark:text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-neutral-400">
                              {(file.size / 1024).toFixed(1)} KB · {file.type}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-neutral-400 shrink-0 font-mono">
                          Ready
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Scoped Conversations */}
              <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Project Dialogs ({projectConversations.length})
                </h3>

                {projectConversations.length === 0 ? (
                  <p className="text-xs text-neutral-400">
                    No conversations yet created specifically under this project.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {projectConversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => {
                          selectProject(activeProject.id);
                          setCurrentSection("chat");
                        }}
                        className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer transition-colors text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="font-medium text-neutral-900 dark:text-white truncate">
                            {conv.title}
                          </span>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Project Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                {editingProjId ? "Edit Project Workspace" : "Create New Project"}
              </h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Autonomous Agent Engine"
                  className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                  className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="High-level objectives and domain summary..."
                  className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
                  Custom AI Instructions (System Directive)
                </label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                  placeholder="How should the AI behave in this project? E.g. 'Use strict TypeScript, avoid boilerplate, cite specific libraries...'"
                  className="w-full p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold"
                >
                  {editingProjId ? "Save Changes" : "Create Workspace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
