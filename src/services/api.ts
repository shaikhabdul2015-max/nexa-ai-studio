import { ChatAttachment, ChatMessage } from "../types";

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onError: (error: string) => void;
  onDone: () => void;
}

async function parseResponse(response: Response, fallbackMessage: string) {
  const text = await response.text();

  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        text ||
        `${fallbackMessage} (${response.status})`
    );
  }

  return data;
}

export async function checkSystemHealth() {
  try {
    const res = await fetch("/api/health", {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    });

    const data = await parseResponse(res, "Health check failed");

    return data;
  } catch (err: any) {
    return {
      status: "offline",
      geminiConfigured: false,
      error: err?.message || "Unable to connect to server"
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
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream"
      },
      body: JSON.stringify({
        messages: messages.map((message) => ({
          role: message.role,
          content: message.content
        })),
        model,
        systemInstruction,
        attachments,
        stream: true
      }),
      signal
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));

      throw new Error(
        data?.error ||
          data?.message ||
          `Server responded with status ${response.status}`
      );
    }

    if (!response.body) {
      throw new Error("AI response stream is unavailable");
    }

    reader = response.body.getReader();

    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let completed = false;

    const finish = () => {
      if (!completed) {
        completed = true;
        callbacks.onDone();
      }
    };

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || "";

      for (const event of events) {
        const lines = event.split(/\r?\n/);

        for (const line of lines) {
          if (!line.startsWith("data:")) {
            continue;
          }

          const dataStr = line.slice(5).trim();

          if (!dataStr) {
            continue;
          }

          if (dataStr === "[DONE]") {
            finish();
            return;
          }

          try {
            const parsed = JSON.parse(dataStr);

            if (parsed?.error) {
              callbacks.onError(String(parsed.error));
              return;
            }

            if (typeof parsed?.text === "string" && parsed.text.length > 0) {
              callbacks.onChunk(parsed.text);
            }
          } catch {
            // Ignore malformed/partial SSE events.
          }
        }
      }
    }

    if (buffer.trim()) {
      const lines = buffer.split(/\r?\n/);

      for (const line of lines) {
        if (!line.startsWith("data:")) {
          continue;
        }

        const dataStr = line.slice(5).trim();

        if (!dataStr || dataStr === "[DONE]") {
          continue;
        }

        try {
          const parsed = JSON.parse(dataStr);

          if (parsed?.error) {
            callbacks.onError(String(parsed.error));
            return;
          }

          if (typeof parsed?.text === "string" && parsed.text.length > 0) {
            callbacks.onChunk(parsed.text);
          }
        } catch {
          // Ignore incomplete final event.
        }
      }
    }

    finish();
  } catch (err: any) {
    if (err?.name === "AbortError") {
      callbacks.onDone();
      return;
    }

    callbacks.onError(
      err?.message || "Failed to communicate with AI model."
    );
  } finally {
    try {
      reader?.releaseLock();
    } catch {
      // Reader may already be released.
    }
  }
}

/**
 * AI reasoning request
 *
 * Backend route:
 * POST /api/reason
 */
export async function sendReasoningRequest(
  prompt: string,
  context?: string
) {
  const res = await fetch("/api/reason", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      prompt,
      context: context || ""
    })
  });

  return await parseResponse(res, "Reasoning request failed");
}

/**
 * Deep Research
 *
 * Backend route:
 * POST /api/research
 */
export async function runDeepResearch(
  topic: string,
  mode:
    | "Quick Research"
    | "Deep Research"
    | "Academic Research"
    | "News Research"
) {
  if (!topic.trim()) {
    throw new Error("Research topic cannot be empty.");
  }

  const res = await fetch("/api/research", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      topic: topic.trim(),
      mode
    })
  });

  return await parseResponse(res, "Deep research request failed");
}

export async function runDocumentAnalysis(
  task: string,
  question: string,
  documents: Array<{
    name: string;
    type: string;
    content?: string;
    base64?: string;
  }>
) {
  const res = await fetch("/api/documents/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      task,
      question,
      documents
    })
  });

  return await parseResponse(res, "Document analysis failed");
}

export async function runDataAnalysis(
  csvData: string,
  query?: string,
  mode?: string
) {
  const res = await fetch("/api/data/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      csvData,
      query,
      mode: mode || "insights"
    })
  });

  return await parseResponse(res, "Data analysis failed");
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
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      action,
      code,
      language,
      prompt,
      fileName
    })
  });

  return await parseResponse(res, "Coding assistant failed");
}

export async function generateHighResImage(
  prompt: string,
  aspectRatio: string = "1:1",
  imageSize: "1K" | "2K" | "4K" = "1K",
  style: string = "photorealistic"
) {
  const res = await fetch("/api/image/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      prompt,
      aspectRatio,
      imageSize,
      style
    })
  });

  return await parseResponse(res, "Image generation failed");
}

export async function synthesizeTTS(
  text: string,
  voice?: string
) {
  const res = await fetch("/api/audio/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      text,
      voice
    })
  });

  return await parseResponse(res, "Text-to-speech request failed");
} 