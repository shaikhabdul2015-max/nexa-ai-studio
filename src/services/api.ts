import { ChatAttachment, ChatMessage } from "../types";

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onError: (error: string) => void;
  onDone: () => void;
}

export async function checkSystemHealth() {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) throw new Error("Health check failed");
    return await res.json();
  } catch (err: any) {
    return {
      status: "offline",
      geminiConfigured: false,
      error: err.message
    };
  }
}

export async function sendChatStream(
  messages: ChatMessage[],
  model: string,
  systemInstruction: string,
  attachments: ChatAttachment[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal
) {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
        model,
        systemInstruction,
        attachments,
        stream: true
      }),
      signal
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with status ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is not readable");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.replace("data: ", "").trim();
          if (dataStr === "[DONE]") {
            callbacks.onDone();
            return;
          }
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.error) {
              callbacks.onError(parsed.error);
              return;
            }
            if (parsed.text) {
              callbacks.onChunk(parsed.text);
            }
          } catch {
            // ignore partial json
          }
        }
      }
    }
    callbacks.onDone();
  } catch (err: any) {
    if (err.name === "AbortError") {
      callbacks.onDone();
    } else {
      callbacks.onError(err.message || "Failed to communicate with AI model.");
    }
  }
}

export async function sendReasoningRequest(prompt: string, context?: string) {
  const res = await fetch("/api/reason", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, context })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Reasoning request failed");
  return data;
}

export async function runDeepResearch(
  topic: string,
  mode: "Quick Research" | "Deep Research" | "Academic Research" | "News Research"
) {
  const res = await fetch("/api/research", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, mode })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Deep research request failed");
  return data;
}

export async function runDocumentAnalysis(
  task: string,
  question: string,
  documents: Array<{ name: string; type: string; content?: string; base64?: string }>
) {
  const res = await fetch("/api/documents/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, question, documents })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Document analysis failed");
  return data;
}

export async function runDataAnalysis(csvData: string, query?: string, mode?: string) {
  const res = await fetch("/api/data/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ csvData, query, mode: mode || "insights" })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Data analysis failed");
  return data;
}

export async function runCodeAssist(
  action: string,
  code: string,
  language: string,
  prompt?: string,
  fileName?: string
) {
  const res = await fetch("/api/code/assist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, code, language, prompt, fileName })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Coding assistant failed");
  return data;
}

export async function generateHighResImage(
  prompt: string,
  aspectRatio: string = "1:1",
  imageSize: "1K" | "2K" | "4K" = "1K",
  style: string = "photorealistic"
) {
  const res = await fetch("/api/image/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, aspectRatio, imageSize, style })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Image generation failed");
  return data;
}

export async function synthesizeTTS(text: string, voice?: string) {
  const res = await fetch("/api/audio/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice })
  });
  return await res.json();
}
