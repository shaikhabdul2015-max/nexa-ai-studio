import React, { createContext, useContext, useState, useEffect } from "react";
import {
  AppSection,
  LanguageCode,
  Conversation,
  ChatMessage,
  Project,
  AgentTemplate,
  KnowledgeDocument,
  MemoryItem,
  UsageStats,
  UserProfile,
  ToolPermissionRequest,
  SystemNotification,
} from "../types";
import { translations, Translations } from "../i18n/translations";
import { checkSystemHealth } from "../services/api";

const BUILT_IN_AGENTS: AgentTemplate[] = [
  {
    id: "agent-researcher",
    name: "Dr. Aris (Researcher)",
    role: "Lead Synthesis & Investigation Scientist",
    description: "Deep academic and empirical investigation with citation grounding and structured synthesis.",
    systemInstruction: "You are Dr. Aris, an elite researcher. Approach queries methodically, verify assumptions, cite real factual foundations, and break down complex phenomena into clear principles.",
    personality: "Analytical, thorough, objective, and scholarly.",
    model: "gemini-3.1-pro-preview",
    tools: ["webSearch", "grounding", "documentAnalysis"],
    outputFormat: "Structured markdown reports with executive summary, empirical evidence, and sources.",
    enabled: true,
    isBuiltIn: true,
    iconName: "Search",
  },
  {
    id: "agent-coder",
    name: "Krypton (Coding Expert)",
    role: "Senior Full-Stack Architect",
    description: "Designs robust architectures, writes production-grade code, fixes bugs, and performs deep refactoring.",
    systemInstruction: "You are Krypton, a world-class software engineer and architect. Write idiomatic, fully functional, type-safe, and self-contained code. Always explain design decisions and edge cases.",
    personality: "Precise, pragmatic, performance-oriented, and pedagogical.",
    model: "gemini-3.1-pro-preview",
    tools: ["codeSandbox", "lintCheck", "unitTestGen"],
    outputFormat: "Clean annotated code blocks, architectural diagrams, and complexity analysis.",
    enabled: true,
    isBuiltIn: true,
    iconName: "Code2",
  },
  {
    id: "agent-analyst",
    name: "Vantage (Data Analyst)",
    role: "Quantitative Intelligence Lead",
    description: "Dissects tabular datasets, extracts distributions, computes metrics, and pinpoints statistical anomalies.",
    systemInstruction: "You are Vantage, a seasoned quantitative analyst and statistician. Extract trends, suggest data cleansing routines, highlight correlations, and recommend optimal visualizations.",
    personality: "Inquisitive, metric-driven, sharp, and concise.",
    model: "gemini-3.5-flash",
    tools: ["csvParser", "statisticsEngine", "chartRecommender"],
    outputFormat: "Statistical summary tables, trend observations, and chart schemas.",
    enabled: true,
    isBuiltIn: true,
    iconName: "BarChart3",
  },
  {
    id: "agent-writer",
    name: "Calliope (Writing Assistant)",
    role: "Executive Prose & Editorial Strategist",
    description: "Crafts compelling narratives, executive memos, technical documentation, and refined copy.",
    systemInstruction: "You are Calliope, an executive editor and narrative craftsman. Focus on tone modulation, vivid clarity, structural rhythm, and zero fluff.",
    personality: "Eloquent, perceptive, persuasive, and refined.",
    model: "gemini-3.5-flash",
    tools: ["toneModulator", "grammarCheck", "styleGuide"],
    outputFormat: "Polished long-form prose with clear section headers.",
    enabled: true,
    isBuiltIn: true,
    iconName: "PenTool",
  },
  {
    id: "agent-tutor",
    name: "Mentor (Study Tutor)",
    role: "Socratic Educator & Concept Master",
    description: "Breaks down hard STEM, humanities, and algorithmic concepts using analogies and interactive checks.",
    systemInstruction: "You are Mentor, an adaptive educator. Guide the learner using the Socratic method, step-by-step scaffolding, real-world analogies, and quick comprehension questions.",
    personality: "Encouraging, patient, illuminating, and structured.",
    model: "gemini-3.5-flash",
    tools: ["socraticQuizzer", "conceptMapper"],
    outputFormat: "Conceptual walkthroughs, visual analogies, and check-for-understanding quizzes.",
    enabled: true,
    isBuiltIn: true,
    iconName: "GraduationCap",
  },
  {
    id: "agent-business",
    name: "Stratum (Business Assistant)",
    role: "Corporate Strategy & Operations Partner",
    description: "Evaluates business models, unit economics, market expansion, and operational bottlenecks.",
    systemInstruction: "You are Stratum, an executive business advisor. Structure advice around ROI, risk mitigation, resource allocation, and measurable competitive advantages.",
    personality: "Direct, strategic, executive, and outcome-focused.",
    model: "gemini-3.5-flash",
    tools: ["swotMatrix", "financialModeler"],
    outputFormat: "Executive briefing memos, decision matrices, and action roadmaps.",
    enabled: true,
    isBuiltIn: true,
    iconName: "Briefcase",
  },
  {
    id: "agent-doc-analyst",
    name: "Lexicon (Document Analyst)",
    role: "Contracts, Specifications & PDF Specialist",
    description: "Scans legal agreements, research papers, and technical manuals for clauses, numbers, and obligations.",
    systemInstruction: "You are Lexicon, a document intelligence specialist. Scrutinize text with extreme fidelity, noting page references, definitions, caveats, and obligations.",
    personality: "Meticulous, cautious, forensic, and dependable.",
    model: "gemini-3.5-flash",
    tools: ["pdfReader", "clauseExtractor"],
    outputFormat: "Itemized clauses, page citations, risk flags, and summary tables.",
    enabled: true,
    isBuiltIn: true,
    iconName: "FileSearch",
  },
  {
    id: "agent-creative",
    name: "Luminary (Creative Assistant)",
    role: "Ideation & Visual Prompt Alchemist",
    description: "Brainstorms inventive concepts, worldbuilding lore, visual generation prompts, and unique hooks.",
    systemInstruction: "You are Luminary, an avant-garde creative catalyst. Explore high-entropy ideas, cinematic descriptions, evocative aesthetics, and fresh lateral thinking.",
    personality: "Imaginative, boundary-pushing, vibrant, and expressive.",
    model: "gemini-3.8-flash",
    tools: ["imagePromptGen", "storyWeaver"],
    outputFormat: "Evocative prompt recipes, creative outlines, and pitch treatments.",
    enabled: true,
    isBuiltIn: true,
    iconName: "Sparkles",
  },
];

const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Next-Gen Autonomous Agent Engine",
    category: "Coding",
    description: "Developing scalable event-driven agent architectures with streaming SSE and tool permission checkpoints.",
    instructions: "Enforce TypeScript strict mode, zero-unhandled promise rejections, and isolated execution boundaries.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    files: [
      { id: "f-1", name: "agent_spec.ts", size: 4200, type: "typescript", uploadedAt: new Date().toISOString() },
      { id: "f-2", name: "security_policy.md", size: 2100, type: "markdown", uploadedAt: new Date().toISOString() }
    ],
    knowledgeSnippet: "Agent workflows require proactive user consent for any external state alteration."
  },
  {
    id: "proj-2",
    name: "Quantum Computing Hardware Review 2026",
    category: "Research",
    description: "Comparative study of superconducting qubits, topological qubits, and neutral atom quantum computing systems.",
    instructions: "Focus on gate fidelity, coherence times (T1/T2), and error mitigation milestones.",
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    files: [
      { id: "f-3", name: "neutral_atoms_qec.pdf", size: 184000, type: "pdf", uploadedAt: new Date().toISOString() }
    ],
    knowledgeSnippet: "Neutral atom arrays demonstrate high spatial addressability and two-qubit gate fidelities exceeding 99.5%."
  }
];

const INITIAL_KNOWLEDGE: KnowledgeDocument[] = [
  {
    id: "k-1",
    title: "NEXA Architecture & Security Guidelines",
    category: "Reference",
    tags: ["architecture", "security", "guardrails"],
    content: "All AI actions that modify external systems or access sensitive credentials must invoke the user permission modal. Model outputs must be sanitized before rendering.",
    fileType: "text/markdown",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    sizeBytes: 1540
  },
  {
    id: "k-2",
    title: "API Design Standards: REST & EventStream",
    category: "Manual",
    tags: ["api", "rest", "sse"],
    content: "Streaming endpoints must adhere to W3C Server-Sent Events with standard 'data: [DONE]' delimiters and structured JSON payloads.",
    fileType: "text/plain",
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    sizeBytes: 980
  }
];

const INITIAL_CONVERSATION: Conversation = {
  id: "conv-initial",
  title: "Welcome to NEXA AI",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  model: "gemini-3.5-flash",
  messages: [
    {
      id: "msg-welcome",
      role: "model",
      content: "### Welcome to NEXA AI\n\n*One AI. Infinite Possibilities.*\n\nI am your unified multimodal AI workspace. Here is what we can accomplish together:\n\n* **Multi-turn Chat**: Fluid, streaming multimodal dialog powered by Google Gemini.\n* **Deep Reasoning**: Structured methodological breakdown for complex STEM, logic, and architectural inquiries.\n* **Deep Research**: Rigorous web-grounded reports with verifiable citations.\n* **Coding Lab & Sandbox**: Real-time syntax highlighting, refactoring, and secure sandbox preview.\n* **Data Analyst Workspace**: Upload CSV/tabular data to detect anomalies, review cleaning tips, and generate interactive charts.\n* **Document AI & Knowledge Base**: Comprehensive analysis of PDFs, spreadsheets, and personal notes.\n* **Image Studio**: High-resolution image generation (1K, 2K, 4K) using Google Gemini.\n* **Voice Mode**: Real-time speech interaction and voice synthesis.\n\nHow would you like to begin today?",
      timestamp: new Date().toISOString(),
      model: "gemini-3.5-flash",
    }
  ]
};

interface AppContextType {
  currentSection: AppSection;
  setCurrentSection: (section: AppSection) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: Translations;
  theme: "dark" | "light" | "system";
  setTheme: (theme: "dark" | "light" | "system") => void;

  // Conversations
  conversations: Conversation[];
  currentConversationId: string;
  currentConversation: Conversation | undefined;
  createNewConversation: (model?: string, projectId?: string) => string;
  selectConversation: (id: string) => void;
  renameConversation: (id: string, newTitle: string) => void;
  deleteConversation: (id: string) => void;
  pinConversation: (id: string) => void;
  archiveConversation: (id: string) => void;
  addMessageToConversation: (convId: string, message: ChatMessage) => void;
  updateLastMessageContent: (convId: string, chunk: string, isStreaming?: boolean) => void;

  // Projects
  projects: Project[];
  currentProjectId: string | null;
  selectProject: (id: string | null) => void;
  createProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt" | "files">) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addFileToProject: (projectId: string, file: Omit<Project["files"][0], "id" | "uploadedAt">) => void;

  // Agents
  agents: AgentTemplate[];
  createAgent: (agent: Omit<AgentTemplate, "id">) => AgentTemplate;
  updateAgent: (id: string, updates: Partial<AgentTemplate>) => void;
  duplicateAgent: (id: string) => void;
  deleteAgent: (id: string) => void;
  toggleAgent: (id: string) => void;

  // Knowledge Base
  knowledgeDocs: KnowledgeDocument[];
  addKnowledgeDoc: (doc: Omit<KnowledgeDocument, "id" | "createdAt">) => void;
  deleteKnowledgeDoc: (id: string) => void;
  clearAllKnowledgeDocs: () => void;

  // Memory
  memories: MemoryItem[];
  memoryEnabled: boolean;
  setMemoryEnabled: (enabled: boolean) => void;
  addMemory: (key: string, value: string, category?: MemoryItem["category"]) => void;
  updateMemory: (id: string, key: string, value: string) => void;
  deleteMemory: (id: string) => void;
  clearAllMemories: () => void;

  // Subscriptions & Usage
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  usage: UsageStats;
  trackUsage: (type: "message" | "request" | "file" | "research" | "image", tokens?: number) => void;

  // Notifications
  notifications: SystemNotification[];
  addNotification: (title: string, message: string, type?: SystemNotification["type"]) => void;
  dismissNotification: (id: string) => void;

  // Tool Permissions
  permissionModal: ToolPermissionRequest | null;
  requestPermission: (toolName: string, actionDescription: string, dataToUse: string) => Promise<boolean>;
  respondPermission: (allowed: boolean) => void;

  // Global Search & Command Palette
  isCommandPaletteOpen: boolean;
  setIsCommandPaletteOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // System Health
  systemHealth: { geminiConfigured: boolean; status: string; models: any[] };
  refreshHealth: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [currentSection, setCurrentSection] = useState<AppSection>("home");
  const [language, setLanguage] = useState<LanguageCode>(() => {
    return (localStorage.getItem("nexa_lang") as LanguageCode) || "en";
  });
  const [theme, setTheme] = useState<"dark" | "light" | "system">(() => {
    return (localStorage.getItem("nexa_theme") as any) || "dark";
  });

  // Sync theme attribute on documentElement
  useEffect(() => {
    localStorage.setItem("nexa_theme", theme);
    if (theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Sync language
  useEffect(() => {
    localStorage.setItem("nexa_lang", language);
  }, [language]);

  // Conversations
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem("nexa_conversations");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [INITIAL_CONVERSATION];
  });
  const [currentConversationId, setCurrentConversationId] = useState<string>(() => {
    return conversations[0]?.id || "conv-initial";
  });

  useEffect(() => {
    localStorage.setItem("nexa_conversations", JSON.stringify(conversations));
  }, [conversations]);

  // Projects
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("nexa_projects");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_PROJECTS;
  });
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("nexa_projects", JSON.stringify(projects));
  }, [projects]);

  // Agents
  const [agents, setAgents] = useState<AgentTemplate[]>(() => {
    const saved = localStorage.getItem("nexa_agents");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return BUILT_IN_AGENTS;
  });

  useEffect(() => {
    localStorage.setItem("nexa_agents", JSON.stringify(agents));
  }, [agents]);

  // Knowledge
  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>(() => {
    const saved = localStorage.getItem("nexa_knowledge");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return INITIAL_KNOWLEDGE;
  });

  useEffect(() => {
    localStorage.setItem("nexa_knowledge", JSON.stringify(knowledgeDocs));
  }, [knowledgeDocs]);

  // Memory
  const [memoryEnabled, setMemoryEnabled] = useState<boolean>(() => {
    return localStorage.getItem("nexa_mem_enabled") !== "false";
  });
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    const saved = localStorage.getItem("nexa_memories");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      {
        id: "mem-1",
        key: "Preferred Coding Style",
        value: "Strict TypeScript with explicit interfaces, functional paradigms, and detailed explanations.",
        category: "user_preference",
        createdAt: new Date().toISOString(),
        enabled: true,
      },
      {
        id: "mem-2",
        key: "Workspace Identity",
        value: "NEXA AI Enterprise Multimodal Assistant with strict tool permissions.",
        category: "instruction",
        createdAt: new Date().toISOString(),
        enabled: true,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("nexa_mem_enabled", String(memoryEnabled));
    localStorage.setItem("nexa_memories", JSON.stringify(memories));
  }, [memoryEnabled, memories]);

  // User Profile & Usage
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("nexa_user");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {
      id: "usr-nexa-pro",
      name: "Alex Vance",
      email: "alex.vance@nexa.ai",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      plan: "Pro",
      joinedDate: "2026-01-15",
    };
  });

  const [usage, setUsage] = useState<UsageStats>(() => {
    const saved = localStorage.getItem("nexa_usage");
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return {
      messagesSent: 42,
      requestsCount: 68,
      filesProcessed: 14,
      researchTasks: 6,
      imageGenerations: 9,
      estimatedTokens: 142850,
      limits: {
        messagesLimit: 1000,
        researchLimit: 100,
        imageLimit: 150,
        fileSizeMbLimit: 50,
      }
    };
  });

  useEffect(() => {
    localStorage.setItem("nexa_usage", JSON.stringify(usage));
  }, [usage]);

  const trackUsage = (type: "message" | "request" | "file" | "research" | "image", tokens: number = 350) => {
    setUsage((prev) => ({
      ...prev,
      messagesSent: type === "message" ? prev.messagesSent + 1 : prev.messagesSent,
      requestsCount: prev.requestsCount + 1,
      filesProcessed: type === "file" ? prev.filesProcessed + 1 : prev.filesProcessed,
      researchTasks: type === "research" ? prev.researchTasks + 1 : prev.researchTasks,
      imageGenerations: type === "image" ? prev.imageGenerations + 1 : prev.imageGenerations,
      estimatedTokens: prev.estimatedTokens + tokens,
    }));
  };

  // Notifications
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  const addNotification = (title: string, message: string, type: SystemNotification["type"] = "info") => {
    const newNotif: SystemNotification = {
      id: "notif-" + Math.random().toString(36).substring(2, 9),
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 8));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Tool Permissions
  const [permissionModal, setPermissionModal] = useState<ToolPermissionRequest | null>(null);
  const [permissionResolver, setPermissionResolver] = useState<((val: boolean) => void) | null>(null);

  const requestPermission = (toolName: string, actionDescription: string, dataToUse: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setPermissionModal({
        id: "perm-" + Math.random().toString(36).substring(2, 9),
        toolName,
        actionDescription,
        dataToUse,
        timestamp: new Date().toISOString(),
        status: "pending",
      });
      setPermissionResolver(() => resolve);
    });
  };

  const respondPermission = (allowed: boolean) => {
    if (permissionResolver) {
      permissionResolver(allowed);
      setPermissionResolver(null);
    }
    setPermissionModal(null);
  };

  // Command palette & search
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // System Health
  const [systemHealth, setSystemHealth] = useState<any>({
    geminiConfigured: false,
    status: "checking",
    models: [],
  });

  const refreshHealth = async () => {
    const health = await checkSystemHealth();
    setSystemHealth(health);
  };

  useEffect(() => {
    refreshHealth();
  }, []);

  // Conversation Helpers
  const currentConversation = conversations.find((c) => c.id === currentConversationId) || conversations[0];

  const createNewConversation = (model: string = "gemini-3.5-flash", projectId?: string) => {
    const newId = "conv-" + Date.now();
    const newConv: Conversation = {
      id: newId,
      title: "New Conversation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      model,
      projectId: projectId || currentProjectId || undefined,
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(newId);
    return newId;
  };

  const selectConversation = (id: string) => {
    setCurrentConversationId(id);
    setCurrentSection("chat");
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle.trim() || "Untitled Chat" } : c))
    );
  };

  const deleteConversation = (id: string) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        return [INITIAL_CONVERSATION];
      }
      return filtered;
    });
    if (currentConversationId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setCurrentConversationId(remaining[0].id);
      }
    }
  };

  const pinConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const archiveConversation = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, archived: !c.archived } : c))
    );
  };

  const addMessageToConversation = (convId: string, message: ChatMessage) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId) return c;
        const updatedMessages = [...c.messages, message];
        let newTitle = c.title;
        // Auto-generate a title from first user query if still default
        if (
          (c.title === "New Conversation" || c.title === "Untitled Chat") &&
          message.role === "user"
        ) {
          newTitle = message.content.slice(0, 36) + (message.content.length > 36 ? "..." : "");
        }
        return {
          ...c,
          title: newTitle,
          updatedAt: new Date().toISOString(),
          messages: updatedMessages,
        };
      })
    );
  };

  const updateLastMessageContent = (convId: string, chunk: string, isStreaming: boolean = true) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== convId || c.messages.length === 0) return c;
        const msgs = [...c.messages];
        const last = { ...msgs[msgs.length - 1] };
        last.content += chunk;
        last.isStreaming = isStreaming;
        msgs[msgs.length - 1] = last;
        return { ...c, messages: msgs, updatedAt: new Date().toISOString() };
      })
    );
  };

  // Projects Helpers
  const selectProject = (id: string | null) => {
    setCurrentProjectId(id);
  };

  const createProject = (projectData: Omit<Project, "id" | "createdAt" | "updatedAt" | "files">) => {
    const newProject: Project = {
      ...projectData,
      id: "proj-" + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: [],
    };
    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    if (currentProjectId === id) setCurrentProjectId(null);
  };

  const addFileToProject = (projectId: string, fileData: Omit<Project["files"][0], "id" | "uploadedAt">) => {
    const newFile = {
      ...fileData,
      id: "file-" + Date.now(),
      uploadedAt: new Date().toISOString(),
    };
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, files: [...p.files, newFile] } : p))
    );
  };

  // Agents Helpers
  const createAgent = (agentData: Omit<AgentTemplate, "id">) => {
    const newAgent: AgentTemplate = {
      ...agentData,
      id: "agent-" + Date.now(),
    };
    setAgents((prev) => [...prev, newAgent]);
    return newAgent;
  };

  const updateAgent = (id: string, updates: Partial<AgentTemplate>) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const duplicateAgent = (id: string) => {
    const existing = agents.find((a) => a.id === id);
    if (!existing) return;
    const duplicated: AgentTemplate = {
      ...existing,
      id: "agent-" + Date.now(),
      name: `${existing.name} (Copy)`,
      isBuiltIn: false,
    };
    setAgents((prev) => [...prev, duplicated]);
  };

  const deleteAgent = (id: string) => {
    setAgents((prev) => prev.filter((a) => a.id !== id));
  };

  const toggleAgent = (id: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  // Knowledge Docs Helpers
  const addKnowledgeDoc = (docData: Omit<KnowledgeDocument, "id" | "createdAt">) => {
    const newDoc: KnowledgeDocument = {
      ...docData,
      id: "k-" + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setKnowledgeDocs((prev) => [newDoc, ...prev]);
  };

  const deleteKnowledgeDoc = (id: string) => {
    setKnowledgeDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const clearAllKnowledgeDocs = () => {
    setKnowledgeDocs([]);
  };

  // Memory Helpers
  const addMemory = (key: string, value: string, category: MemoryItem["category"] = "user_preference") => {
    const newMem: MemoryItem = {
      id: "mem-" + Date.now(),
      key,
      value,
      category,
      createdAt: new Date().toISOString(),
      enabled: true,
    };
    setMemories((prev) => [newMem, ...prev]);
  };

  const updateMemory = (id: string, key: string, value: string) => {
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, key, value } : m))
    );
  };

  const deleteMemory = (id: string) => {
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const clearAllMemories = () => {
    setMemories([]);
  };

  const t = translations[language] || translations.en;

  return (
    <AppContext.Provider
      value={{
        currentSection,
        setCurrentSection,
        language,
        setLanguage,
        t,
        theme,
        setTheme,

        conversations,
        currentConversationId,
        currentConversation,
        createNewConversation,
        selectConversation,
        renameConversation,
        deleteConversation,
        pinConversation,
        archiveConversation,
        addMessageToConversation,
        updateLastMessageContent,

        projects,
        currentProjectId,
        selectProject,
        createProject,
        updateProject,
        deleteProject,
        addFileToProject,

        agents,
        createAgent,
        updateAgent,
        duplicateAgent,
        deleteAgent,
        toggleAgent,

        knowledgeDocs,
        addKnowledgeDoc,
        deleteKnowledgeDoc,
        clearAllKnowledgeDocs,

        memories,
        memoryEnabled,
        setMemoryEnabled,
        addMemory,
        updateMemory,
        deleteMemory,
        clearAllMemories,

        userProfile,
        setUserProfile,
        usage,
        trackUsage,

        notifications,
        addNotification,
        dismissNotification,

        permissionModal,
        requestPermission,
        respondPermission,

        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        searchQuery,
        setSearchQuery,

        systemHealth,
        refreshHealth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
