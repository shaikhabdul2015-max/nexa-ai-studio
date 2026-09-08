export type AppSection =
  | "home"
  | "chat"
  | "research"
  | "projects"
  | "agents"
  | "knowledge"
  | "documents"
  | "code"
  | "data"
  | "image"
  | "voice"
  | "history"
  | "settings";

export type LanguageCode = "en" | "hi" | "mr";

export type ModelCategory = "Fast" | "Balanced" | "Reasoning" | "Vision";

export interface AIModel {
  id: string;
  name: string;
  category: ModelCategory;
  description: string;
  badge?: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  base64?: string;
  content?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  model?: string;
  isStreaming?: boolean;
  reasoning?: {
    approach?: string;
    considerations?: string;
    result?: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  model: string;
  pinned?: boolean;
  archived?: boolean;
  projectId?: string;
  agentId?: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  content?: string;
}

export type ProjectCategory =
  | "School Project"
  | "Business"
  | "Research"
  | "Coding"
  | "Content Creation"
  | "Writing"
  | "Learning"
  | "Custom";

export interface Project {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  instructions: string;
  createdAt: string;
  updatedAt: string;
  files: ProjectFile[];
  knowledgeSnippet?: string;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  role: string;
  systemInstruction: string;
  personality: string;
  model: string;
  tools: string[];
  outputFormat: string;
  enabled: boolean;
  isBuiltIn?: boolean;
  iconName: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: "Guidelines" | "Reference" | "Note" | "Manual" | "Snippet" | "Policy" | "Project File" | "Research" | string;
  tags: string[];
  content: string;
  fileType: string;
  createdAt: string;
  sizeBytes: number;
}

export interface MemoryItem {
  id: string;
  key: string;
  value: string;
  category: "user_preference" | "fact" | "work_context" | "instruction";
  createdAt: string;
  enabled: boolean;
}

export interface ResearchCitation {
  title?: string;
  uri?: string;
  url?: string;
  source?: string;
}

export interface ResearchReport {
  id: string;
  topic: string;
  mode: "Quick Research" | "Deep Research" | "Academic Research" | "News Research";
  report: string;
  content: string;
  sources: ResearchCitation[];
  citations?: ResearchCitation[];
  createdAt: string;
}

export interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  caption?: string;
  aspectRatio: string;
  imageSize: "1K" | "2K" | "4K";
  style: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  plan: "Free" | "Pro" | "Enterprise";
  joinedDate: string;
}

export interface UsageStats {
  messagesSent: number;
  requestsCount: number;
  filesProcessed: number;
  researchTasks: number;
  imageGenerations: number;
  estimatedTokens: number;
  limits: {
    messagesLimit: number;
    researchLimit: number;
    imageLimit: number;
    fileSizeMbLimit: number;
  };
}

export interface ToolPermissionRequest {
  id: string;
  toolName: string;
  actionDescription: string;
  dataToUse: string;
  timestamp: string;
  status: "pending" | "allowed" | "denied";
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: string;
}
