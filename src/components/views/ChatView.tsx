import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Send,
  Square,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  Mic,
  Copy,
  Check,
  RotateCw,
  Edit2,
  Trash2,
  Pin,
  Archive,
  Share2,
  ChevronDown,
  Brain,
  X,
  FileText,
  Search,
  ExternalLink,
  Code,
  Terminal,
} from "lucide-react";
import { ChatAttachment, ChatMessage, AIModel } from "../../types";
import { sendChatStream, sendReasoningRequest } from "../../services/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const ChatView: React.FC = () => {
  const {
    t,
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
    trackUsage,
    addNotification,
    currentProjectId,
    projects,
    memories,
    memoryEnabled,
  } = useApp();

  const [inputPrompt, setInputPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");
  const [reasoningEnabled, setReasoningEnabled] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [activeCodeSandbox, setActiveCodeSandbox] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const availableModels: AIModel[] = [
    {
      id: "gemini-3.1-flash-lite",
      name: "Gemini 3.1 Flash Lite",
      category: "Fast",
      description: "Ultra-fast response with high throughput",
      badge: "Fastest",
    },
    {
      id: "gemini-3.5-flash",
      name: "Gemini 3.5 Flash",
      category: "Balanced",
      description: "Premier multimodal balance of speed and intelligence",
      badge: "Recommended",
    },
    {
      id: "gemini-3.8-flash",
      name: "Gemini 3.8 Flash",
      category: "Vision",
      description: "Advanced multimodal vision and context synthesis",
    },
    {
      id: "gemini-3.1-pro-preview",
      name: "Gemini 3.1 Pro",
      category: "Reasoning",
      description: "Deep cognitive reasoning, math, and STEM architecture",
      badge: "Deep Think",
    },
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, isGenerating]);

  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isImage: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 20 * 1024 * 1024) {
        addNotification("File Too Large", "Maximum file upload size is 20MB", "error");
        continue;
      }

      const reader = new FileReader();
      if (isImage || file.type.startsWith("image/")) {
        reader.readAsDataURL(file);
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              id: "att-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
              name: file.name,
              type: file.type || "image/png",
              size: file.size,
              base64: reader.result as string,
            },
          ]);
        };
      } else {
        reader.readAsText(file);
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              id: "att-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
              name: file.name,
              type: file.type || "text/plain",
              size: file.size,
              content: reader.result as string,
            },
          ]);
        };
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Voice Input simulation via Web Speech API
  const handleVoiceToggle = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      addNotification("Voice Unavailable", "Web Speech API is not supported in this browser.", "warning");
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (isVoiceRecording) {
      setIsVoiceRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsVoiceRecording(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt((prev) => (prev ? prev + " " + transcript : transcript));
      };
      recognition.onerror = () => setIsVoiceRecording(false);
      recognition.onend = () => setIsVoiceRecording(false);
      recognition.start();
    } catch {
      setIsVoiceRecording(false);
    }
  };

  // Send message
  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt !== undefined ? customPrompt : inputPrompt;
    if ((!promptToSend.trim() && attachments.length === 0) || isGenerating) return;

    const userMessageId = "msg-" + Date.now();
    const userMessage: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: promptToSend,
      timestamp: new Date().toISOString(),
      attachments: [...attachments],
      model: selectedModel,
    };

    const targetConvId = currentConversationId || createNewConversation(selectedModel);
    addMessageToConversation(targetConvId, userMessage);
    setInputPrompt("");
    const sentAttachments = [...attachments];
    setAttachments([]);
    setIsGenerating(true);
    trackUsage("message");

    // Construct system instructions with memory context & project context
    let systemInstruction = "You are NEXA AI, an advanced next-generation multimodal assistant. Be direct, clear, structured, and helpful.";

    if (currentProjectId) {
      const p = projects.find((proj) => proj.id === currentProjectId);
      if (p) {
        systemInstruction += `\n[Active Project Context: ${p.name} - ${p.instructions}]`;
      }
    }

    if (memoryEnabled && memories.length > 0) {
      const memContext = memories
        .filter((m) => m.enabled)
        .map((m) => `${m.key}: ${m.value}`)
        .join("; ");
      systemInstruction += `\n[Saved User Preferences/Memory: ${memContext}]`;
    }

    // Model ID decision
    const modelToUse = reasoningEnabled ? "gemini-3.1-pro-preview" : selectedModel;

    // Model placeholder message
    const botMessageId = "msg-bot-" + Date.now();
    addMessageToConversation(targetConvId, {
      id: botMessageId,
      role: "model",
      content: "",
      timestamp: new Date().toISOString(),
      model: modelToUse,
      isStreaming: true,
    });

    if (reasoningEnabled) {
      // Execute specialized reasoning flow
      try {
        const reasoningData = await sendReasoningRequest(
          promptToSend,
          sentAttachments.map((a) => a.content || a.name).join("\n")
        );
        updateLastMessageContent(targetConvId, reasoningData.reasoning || "", false);
        trackUsage("request", 800);
      } catch (err: any) {
        updateLastMessageContent(targetConvId, `\n\n**Error**: ${err.message || "Failed to complete reasoning."}`, false);
      } finally {
        setIsGenerating(false);
      }
      return;
    }

    // Standard streaming chat
    abortControllerRef.current = new AbortController();
    const historyMessages = currentConversation ? [...currentConversation.messages, userMessage] : [userMessage];

    sendChatStream(
      historyMessages,
      modelToUse,
      systemInstruction,
      sentAttachments,
      {
        onChunk: (chunk: string) => {
          updateLastMessageContent(targetConvId, chunk, true);
        },
        onError: (err: string) => {
          updateLastMessageContent(targetConvId, `\n\n**Error**: ${err}`, false);
          setIsGenerating(false);
        },
        onDone: () => {
          updateLastMessageContent(targetConvId, "", false);
          setIsGenerating(false);
          trackUsage("request", 400);
        },
      },
      abortControllerRef.current.signal
    );
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      updateLastMessageContent(currentConversationId, " *(Generation stopped)*", false);
    }
  };

  const handleRegenerate = () => {
    if (!currentConversation || currentConversation.messages.length === 0 || isGenerating) return;
    const lastUserMsg = [...currentConversation.messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (msg: ChatMessage) => {
    if (navigator.share) {
      navigator.share({
        title: "NEXA AI Conversation",
        text: msg.content,
      }).catch(() => {});
    } else {
      handleCopyText(msg.id, msg.content);
      addNotification("Shared", "Conversation snippet copied to clipboard", "success");
    }
  };

  const handleSaveEdit = (msgId: string) => {
    if (!editPrompt.trim()) return;
    setEditingMessageId(null);
    handleSendMessage(editPrompt);
  };

  // Filter conversations list
  const filteredConversations = conversations.filter((c) => {
    if (c.archived) return false;
    if (!searchFilter.trim()) return true;
    return c.title.toLowerCase().includes(searchFilter.toLowerCase());
  });

  return (
    <div id="ai-chat-view-container" className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left Chat History List Drawer (Desktop visible, Tablet/Mobile compact) */}
      <div className="hidden md:flex flex-col w-64 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-850 overflow-hidden shrink-0">
        {/* Header & Search */}
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 space-y-2">
          <button
            id="chat-sidebar-new-btn"
            onClick={() => createNewConversation(selectedModel)}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <span>+ New Conversation</span>
          </button>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter chats..."
              className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 border-0 focus:ring-1 focus:ring-neutral-400"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.map((conv) => {
            const isSelected = conv.id === currentConversationId;
            return (
              <div
                key={conv.id}
                id={`chat-thread-${conv.id}`}
                onClick={() => selectConversation(conv.id)}
                className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-colors ${
                  isSelected
                    ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                }`}
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    {conv.pinned && <Pin className="w-3 h-3 text-amber-500 shrink-0 fill-amber-500" />}
                    <span className="truncate">{conv.title}</span>
                  </div>
                  <span className="text-[10px] text-neutral-400 block truncate mt-0.5">
                    {conv.messages.length} msgs · {conv.model.replace("gemini-", "")}
                  </span>
                </div>

                {/* Quick actions hover */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      pinConversation(conv.id);
                    }}
                    title={conv.pinned ? "Unpin" : "Pin"}
                    className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                  >
                    <Pin className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    title="Delete"
                    className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-950/60 text-neutral-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-850 overflow-hidden shadow-xs">
        {/* Chat Workspace Header: Title, Model Picker, Reasoning Toggle, Actions */}
        <div className="p-3.5 border-b border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/70 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-xs md:text-sm text-neutral-900 dark:text-white truncate max-w-xs md:max-w-md">
              {currentConversation?.title || "AI Chat"}
            </span>
            <button
              onClick={() => {
                const newTitle = prompt("Rename conversation:", currentConversation?.title);
                if (newTitle && currentConversation) {
                  renameConversation(currentConversation.id, newTitle);
                }
              }}
              title="Rename conversation"
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Deep Reasoning Toggle */}
            <button
              id="reasoning-toggle-btn"
              onClick={() => setReasoningEnabled(!reasoningEnabled)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                reasoningEnabled
                  ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800"
                  : "bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700"
              }`}
              title="Toggle Deep Reasoning mode for multi-step structured analysis"
            >
              <Brain className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden sm:inline">Reasoning</span>
            </button>

            {/* Model Selector */}
            <div className="relative">
              <select
                id="chat-model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="text-xs py-1.5 pl-3 pr-7 rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer font-medium"
              >
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id} className="bg-white dark:bg-neutral-900">
                    {m.name} ({m.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Conversation Pin/Archive */}
            {currentConversation && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => pinConversation(currentConversation.id)}
                  title={currentConversation.pinned ? "Unpin conversation" : "Pin conversation"}
                  className={`p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 ${
                    currentConversation.pinned ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40" : "text-neutral-400"
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => archiveConversation(currentConversation.id)}
                  title="Archive conversation"
                  className="p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
          {(!currentConversation || currentConversation.messages.length === 0) ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 mb-4 shadow-2xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
                How can NEXA assist you today?
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1.5 leading-relaxed">
                Ask a complex question, request code generation, attach documents, or toggle Deep Reasoning for structured technical analysis.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-6">
                {[
                  "Design a microservices auth architecture",
                  "Compare quantum computing modalities",
                  "Analyze an algorithmic time complexity",
                  "Write a React custom hook for SSE",
                ].map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(sug)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            currentConversation.messages.map((msg) => {
              const isUser = msg.role === "user";
              const isEditing = editingMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  id={`chat-msg-${msg.id}`}
                  className={`flex gap-3 max-w-4xl ${isUser ? "ml-auto justify-end" : "mr-auto justify-start"}`}
                >
                  {/* Model Avatar */}
                  {!isUser && (
                    <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-2xs">
                      NX
                    </div>
                  )}

                  <div className={`space-y-2 max-w-2xl ${isUser ? "items-end" : "items-start"}`}>
                    {/* User Attachments display */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-end mb-1">
                        {msg.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-[11px] font-mono border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                          >
                            {att.type.startsWith("image/") ? (
                              <ImageIcon className="w-3 h-3 text-blue-500" />
                            ) : (
                              <FileText className="w-3 h-3 text-amber-500" />
                            )}
                            <span className="truncate max-w-[140px]">{att.name}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-br-xs"
                          : "bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100 border border-neutral-200/80 dark:border-neutral-700/80 rounded-bl-xs shadow-2xs"
                      }`}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            className="w-full p-2 text-xs rounded-lg bg-neutral-800 text-white border border-neutral-700 focus:outline-none"
                            rows={3}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingMessageId(null)}
                              className="px-2.5 py-1 text-xs rounded bg-neutral-700 text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEdit(msg.id)}
                              className="px-2.5 py-1 text-xs rounded bg-white text-black font-medium"
                            >
                              Save & Run
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="markdown-body prose prose-sm dark:prose-invert max-w-none overflow-x-auto">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code(props) {
                                const { children, className, node, ...rest } = props;
                                const match = /language-(\w+)/.exec(className || "");
                                const isInline = !match && !String(children).includes("\n");

                                if (isInline) {
                                  return (
                                    <code className="px-1.5 py-0.5 rounded bg-neutral-200/60 dark:bg-neutral-700/60 font-mono text-xs" {...rest}>
                                      {children}
                                    </code>
                                  );
                                }

                                const codeString = String(children).replace(/\n$/, "");
                                const lang = match ? match[1] : "text";

                                return (
                                  <div className="my-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-900 text-neutral-100 overflow-hidden text-xs">
                                    <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-950 border-b border-neutral-800 font-mono text-[11px] text-neutral-400">
                                      <span className="uppercase">{lang}</span>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => handleCopyText(`code-${msg.id}`, codeString)}
                                          className="flex items-center gap-1 hover:text-white transition-colors"
                                        >
                                          {copiedId === `code-${msg.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                          <span>{copiedId === `code-${msg.id}` ? "Copied" : "Copy"}</span>
                                        </button>
                                        {(lang === "html" || lang === "javascript" || lang === "js") && (
                                          <button
                                            onClick={() => setActiveCodeSandbox(codeString)}
                                            className="flex items-center gap-1 text-amber-400 hover:text-amber-300"
                                            title="Run in secure sandbox"
                                          >
                                            <Terminal className="w-3 h-3" />
                                            <span>Run Sandbox</span>
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                    <pre className="p-3 overflow-x-auto font-mono text-xs leading-relaxed text-neutral-200">
                                      <code>{children}</code>
                                    </pre>
                                  </div>
                                );
                              },
                              table(props) {
                                return (
                                  <div className="overflow-x-auto my-3">
                                    <table className="min-w-full divide-y divide-neutral-300 dark:divide-neutral-700 text-xs border border-neutral-300 dark:border-neutral-700 rounded-lg" {...props} />
                                  </div>
                                );
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>

                    {/* Action Bar under model response */}
                    {!isUser && !msg.isStreaming && (
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 pt-0.5">
                        <button
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <span>·</span>
                        <button
                          onClick={() => handleShare(msg)}
                          className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                          title="Share snippet"
                        >
                          <Share2 className="w-3 h-3" />
                          <span>Share</span>
                        </button>
                        <span>·</span>
                        <button
                          onClick={handleRegenerate}
                          className="flex items-center gap-1 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                          title="Regenerate response"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>Regenerate</span>
                        </button>
                        {msg.model && (
                          <>
                            <span>·</span>
                            <span className="font-mono text-[10px] text-neutral-400">
                              {msg.model}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    {/* Action bar for user message */}
                    {isUser && (
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 justify-end pt-0.5">
                        <button
                          onClick={() => {
                            setEditingMessageId(msg.id);
                            setEditPrompt(msg.content);
                          }}
                          className="hover:text-neutral-700 dark:hover:text-neutral-200"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Sandbox Preview if active */}
        {activeCodeSandbox && (
          <div className="mx-4 mb-3 p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-900 text-white flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-xs">
              <span className="font-semibold flex items-center gap-1.5 text-amber-400">
                <Terminal className="w-3.5 h-3.5" />
                Secure In-Browser Sandbox Preview
              </span>
              <button
                onClick={() => setActiveCodeSandbox(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <iframe
              srcDoc={activeCodeSandbox}
              sandbox="allow-scripts"
              className="w-full h-44 bg-white rounded-lg mt-2 border border-neutral-700"
              title="Code sandbox preview"
            />
          </div>
        )}

        {/* Message Composer */}
        <div className="p-3 md:p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850">
          {/* Active attachments strip */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-900 text-xs text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                >
                  <span className="font-mono text-[11px] truncate max-w-[160px]">{att.name}</span>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="p-0.5 rounded text-neutral-400 hover:text-rose-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e, false)}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e, true)}
          />

          <div className="flex items-end gap-2">
            <div className="flex-1 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus-within:border-neutral-400 dark:focus-within:border-neutral-500 transition-colors p-2 flex flex-col">
              <textarea
                id="chat-composer-textarea"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  reasoningEnabled
                    ? "Deep Reasoning mode active. Enter technical problem or logic scenario..."
                    : t.chat.inputPlaceholder
                }
                rows={2}
                className="w-full bg-transparent border-0 resize-none text-xs sm:text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-0 p-1"
              />

              {/* Toolbar in composer */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-200/50 dark:border-neutral-700/50 mt-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-700"
                    title={t.chat.attachFile}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-700"
                    title={t.chat.attachImage}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isVoiceRecording
                        ? "bg-rose-500 text-white animate-pulse"
                        : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-700"
                    }`}
                    title={isVoiceRecording ? "Stop Recording" : "Speak (Voice input)"}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">
                  Shift+Enter for newline
                </span>
              </div>
            </div>

            {/* Send / Stop Button */}
            {isGenerating ? (
              <button
                id="chat-stop-generation-btn"
                onClick={handleStopGeneration}
                className="p-3 rounded-2xl bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm flex items-center justify-center"
                title="Stop generation"
              >
                <Square className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                id="chat-send-message-btn"
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() && attachments.length === 0}
                className="p-3 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-40 transition-opacity shadow-sm flex items-center justify-center"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
