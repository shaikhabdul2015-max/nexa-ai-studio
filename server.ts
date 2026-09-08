import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsers with generous limits for file uploads / multimodal base64
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy/safe Gemini Client initialization
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health & System Status Endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
  res.json({
    status: "ok",
    appName: "NEXA AI",
    version: "2.0.0",
    geminiConfigured: hasKey,
    defaultModel: "gemini-3.5-flash",
    models: [
      { id: "gemini-3.1-flash-lite", name: "Gemini 3.1 Flash Lite", category: "Fast", description: "Ultra-fast response for everyday tasks" },
      { id: "gemini-3.5-flash", name: "Gemini 3.5 Flash", category: "Balanced", description: "High-speed multimodal intelligence for all tasks" },
      { id: "gemini-3.8-flash", name: "Gemini 3.8 Flash", category: "General", description: "Next-gen multimodal balanced model" },
      { id: "gemini-3.1-pro-preview", name: "Gemini 3.1 Pro", category: "Reasoning", description: "Deep reasoning, math, coding and complex problem solving" },
      { id: "gemini-3-pro-image-preview", name: "Gemini 3 Pro Image", category: "Vision/Image", description: "High-resolution image generation (1K, 2K, 4K)" }
    ]
  });
});

// 1. AI Chat & Multimodal Streaming
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured. Please set a valid Gemini API key in Settings > Secrets."
      });
    }

    const {
      messages = [],
      model = "gemini-3.5-flash",
      systemInstruction = "You are NEXA AI, an advanced next-generation AI assistant. Be helpful, precise, and well-structured.",
      attachments = [],
      stream = true,
      temperature = 0.7,
    } = req.body;

    // Validate selected model against approved models
    const validModels = [
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.8-flash",
      "gemini-3.1-pro-preview"
    ];
    const selectedModel = validModels.includes(model) ? model : "gemini-3.5-flash";

    // Build contents from conversation history
    // Each item in contents can have parts
    const contents: any[] = [];

    // Add prior messages
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const role = msg.role === "user" ? "user" : "model";
      const parts: any[] = [];

      // If last message has attachments, add them to user prompt
      if (i === messages.length - 1 && attachments && attachments.length > 0) {
        for (const att of attachments) {
          if (att.base64 && att.mimeType) {
            parts.push({
              inlineData: {
                data: att.base64.replace(/^data:[^;]+;base64,/, ""),
                mimeType: att.mimeType
              }
            });
          }
        }
      }

      parts.push({ text: msg.content || "" });
      contents.push({ role, parts });
    }

    if (contents.length === 0) {
      return res.status(400).json({ error: "No messages provided." });
    }

    if (stream) {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const responseStream = await ai.models.generateContentStream({
        model: selectedModel,
        contents,
        config: {
          systemInstruction,
          temperature,
        }
      });

      for await (const chunk of responseStream) {
        const text = chunk.text || "";
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      return res.end();
    } else {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction,
          temperature,
        }
      });

      return res.json({ text: response.text || "" });
    }
  } catch (err: any) {
    console.error("Chat error:", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: err.message || "Failed to generate AI response. Please check your API quota or model settings."
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: err.message || "Streaming interrupted" })}\n\n`);
      res.end();
    }
  }
});

// 2. AI Reasoning Workflow (Approach, Key Considerations, Result)
app.post("/api/reason", async (req: Request, res: Response) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured. Please set a valid Gemini API key in Settings > Secrets."
      });
    }

    const { prompt, context = "" } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const systemInstruction = `You are the NEXA AI Deep Reasoning Engine.
Analyze the user's problem carefully.
NEVER expose raw private chain-of-thought or internal unpolished scratchpad.
Instead, provide a structured, polished breakdown strictly formatted into three distinct sections:
### 1. Approach
Explain the methodological strategy, problem decomposition, and logic used to address the query.

### 2. Key Considerations
Detail critical constraints, edge cases, trade-offs, potential pitfalls, and foundational assumptions.

### 3. Result
Provide the definitive, comprehensive, and high-quality solution or answer.`;

    const fullPrompt = context
      ? `Context / Prior knowledge:\n${context}\n\nProblem to solve:\n${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      }
    });

    res.json({
      reasoning: response.text || "",
      modelUsed: "gemini-3.1-pro-preview"
    });
  } catch (err: any) {
    console.error("Reasoning error:", err);
    res.status(500).json({ error: err.message || "Reasoning engine error" });
  }
});

// 3. Deep Research with Google Search Grounding
app.post("/api/research", async (req: Request, res: Response) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured. Live web research is currently unavailable without an active API key."
      });
    }

    const {
      topic,
      mode = "Deep Research", // "Quick Research" | "Deep Research" | "Academic Research" | "News Research"
      depth = "comprehensive"
    } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Research topic is required." });
    }

    const systemInstruction = `You are the NEXA Deep Research System.
You perform rigorous, objective analysis based on real grounded web sources.
Mode: ${mode}.
Strict requirements:
1. Ground your report in real findings.
2. If web access or groundings are limited, state limitations transparently.
3. Structure your response with the following exact Markdown headers:
# Research Report: ${topic}

## Executive Summary
A concise overview of the central subject, current state, and vital takeaways.

## Key Findings
Bullet points of verifiable facts, discoveries, and recent breakthroughs.

## Detailed Analysis
Thorough multi-dimensional examination, contrasting perspectives, and structural evaluation.

## Evidence & Data Points
Empirical evidence, metrics, dates, and identified consensus or conflicting points.

## Limitations & Open Questions
Known uncertainties, gaps in available information, or areas requiring further investigation.

## Sources & References
List verifiable sources and titles referenced during the investigation.`;

    // Attempt generation with googleSearch tool grounding
    let response;
    let sources: Array<{ title?: string; uri?: string }> = [];

    try {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Conduct a ${mode} inquiry on the following topic: ${topic}`,
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        }
      });

      // Extract grounded chunks
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (Array.isArray(chunks)) {
        for (const ch of chunks) {
          if (ch?.web?.uri) {
            sources.push({
              title: ch.web.title || ch.web.uri,
              uri: ch.web.uri
            });
          }
        }
      }
    } catch (groundingError: any) {
      console.warn("Search grounding fallback:", groundingError.message);
      // If search tool fails or is restricted in this tier, run without tools and note it clearly
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: `Conduct a ${mode} inquiry on the following topic: ${topic}.\nNote: Live web search is currently restricted; synthesize best available comprehensive knowledge.`,
        config: {
          systemInstruction,
        }
      });
    }

    res.json({
      report: response.text || "",
      sources,
      mode,
      topic,
      completedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Deep research error:", err);
    res.status(500).json({ error: err.message || "Research failed to complete." });
  }
});

// 4. Document AI (Summarize, Q&A, Extract, Compare, Tabularize)
app.post("/api/documents/analyze", async (req: Request, res: Response) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured. Please set a valid Gemini API key in Settings > Secrets."
      });
    }

    const {
      task = "summarize", // "summarize" | "qa" | "extract" | "compare" | "tabularize" | "report"
      question = "",
      documents = [], // [{ name, type, content, base64 }]
    } = req.body;

    if (!documents || documents.length === 0) {
      return res.status(400).json({ error: "At least one document is required." });
    }

    const parts: any[] = [];

    // Append document content or inline data
    for (const doc of documents) {
      if (doc.base64 && (doc.type === "image/png" || doc.type === "image/jpeg" || doc.type === "application/pdf")) {
        parts.push({
          inlineData: {
            data: doc.base64.replace(/^data:[^;]+;base64,/, ""),
            mimeType: doc.type
          }
        });
      }
      if (doc.content) {
        parts.push({
          text: `\n=== DOCUMENT: ${doc.name} (${doc.type}) ===\n${doc.content}\n`
        });
      }
    }

    let taskInstruction = "";
    switch (task) {
      case "summarize":
        taskInstruction = "Provide an executive summary of the document(s), followed by primary insights and key takeaways. Include page or section references whenever discernible.";
        break;
      case "qa":
        taskInstruction = `Answer the following specific user question based strictly on the provided document(s):\nQuestion: "${question}"\nIf the information is not present, state so clearly. Cite specific pages or sections where applicable.`;
        break;
      case "extract":
        taskInstruction = "Extract all critical data points, named entities, dates, quantitative metrics, terms, and action items in structured format.";
        break;
      case "compare":
        taskInstruction = "Perform a comparative analysis across the provided documents. Highlight similarities, conflicting claims, key differences, and unique value points in each.";
        break;
      case "tabularize":
        taskInstruction = "Convert all structured or semi-structured information, statistics, and metrics into clear Markdown tables with descriptive column headers.";
        break;
      case "report":
        taskInstruction = "Generate a formal, publication-ready intelligence report analyzing the findings, conclusions, and strategic implications of the document(s).";
        break;
      default:
        taskInstruction = "Analyze the provided document(s) thoroughly.";
    }

    parts.push({ text: taskInstruction });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        systemInstruction: "You are the NEXA Document AI engine. You provide accurate, factual document analysis with page references whenever technically possible."
      }
    });

    res.json({
      result: response.text || "",
      task,
      documentCount: documents.length
    });
  } catch (err: any) {
    console.error("Document AI error:", err);
    res.status(500).json({ error: err.message || "Document analysis failed." });
  }
});

// 5. Data Analyst Workspace
app.post("/api/data/analyze", async (req: Request, res: Response) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured. Please set a valid Gemini API key in Settings > Secrets."
      });
    }

    const {
      csvData = "",
      query = "",
      mode = "insights" // "insights" | "cleaning" | "anomalies" | "trends" | "query"
    } = req.body;

    if (!csvData) {
      return res.status(400).json({ error: "CSV or tabular data is required." });
    }

    const sampleLines = csvData.split("\n").slice(0, 100).join("\n");

    const prompt = `Dataset excerpt (first 100 rows):\n\`\`\`csv\n${sampleLines}\n\`\`\`\n
Task requested: ${mode}
User query / question: ${query || "Provide comprehensive data analysis, summary metrics, cleaning suggestions, trend observations, and anomalies."}

Return a structured markdown report containing:
1. Dataset Overview (Columns, inferred types, size)
2. Statistical Highlights & Distribution
3. Data Quality & Cleaning Recommendations (missing values, format irregularities, duplicates)
4. Key Trends & Anomalies Detected
5. Actionable Insights
6. Recommended Visualizations (Bar chart, Line chart, or Scatter plot with specific X and Y fields)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are NEXA Data Analyst, an expert data scientist and quantitative researcher."
      }
    });

    res.json({
      analysis: response.text || "",
      mode
    });
  } catch (err: any) {
    console.error("Data analyst error:", err);
    res.status(500).json({ error: err.message || "Data analysis failed." });
  }
});

// 6. Coding Lab Assistant (Generate, Explain, Debug, Refactor, Tests, Analyze Errors)
app.post("/api/code/assist", async (req: Request, res: Response) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured. Please set a valid Gemini API key in Settings > Secrets."
      });
    }

    const {
      action = "generate", // "generate" | "explain" | "debug" | "refactor" | "tests" | "error"
      code = "",
      language = "typescript",
      prompt = "",
      fileName = "main.ts"
    } = req.body;

    let instruction = "";
    switch (action) {
      case "generate":
        instruction = `Write clean, modern, fully functional, and production-ready ${language} code for the following request: "${prompt}". Provide clean code blocks and brief explanations.`;
        break;
      case "explain":
        instruction = `Explain this ${language} code clearly. Detail its logic flow, complexity, and design choices:\n\`\`\`${language}\n${code}\n\`\`\``;
        break;
      case "debug":
        instruction = `Inspect this ${language} code for bugs, syntax mistakes, logic errors, or memory leaks. Provide the corrected code and explain each fix:\n\`\`\`${language}\n${code}\n\`\`\`\nUser note: ${prompt}`;
        break;
      case "refactor":
        instruction = `Refactor this ${language} code for maximum readability, performance, and best practices. Show the modernized code:\n\`\`\`${language}\n${code}\n\`\`\``;
        break;
      case "tests":
        instruction = `Generate comprehensive unit and edge-case test suites for this ${language} code:\n\`\`\`${language}\n${code}\n\`\`\``;
        break;
      case "error":
        instruction = `Analyze the following execution or compile error and show how to resolve it:\nError message: "${prompt}"\nCode context:\n\`\`\`${language}\n${code}\n\`\`\``;
        break;
      default:
        instruction = `Assist with this ${language} code: "${prompt}"\n\`\`\`${language}\n${code}\n\`\`\``;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: instruction,
      config: {
        systemInstruction: "You are the NEXA Coding Lab AI. You write robust, idiomatic, high-performance code with proper type definitions and explanations."
      }
    });

    res.json({
      output: response.text || "",
      action,
      language
    });
  } catch (err: any) {
    console.error("Coding lab error:", err);
    res.status(500).json({ error: err.message || "Coding assistant encountered an error." });
  }
});

// 7. Image Studio (Generate High-Quality Images with gemini-3-pro-image-preview / gemini-3.1-flash-image)
app.post("/api/image/generate", async (req: Request, res: Response) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured. High-quality image generation requires a configured Gemini API key in Settings > Secrets."
      });
    }

    const {
      prompt,
      aspectRatio = "1:1", // "1:1", "3:4", "4:3", "9:16", "16:9"
      imageSize = "1K", // "1K", "2K", "4K"
      style = "photorealistic"
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Image prompt is required." });
    }

    const enrichedPrompt = style && style !== "default"
      ? `${prompt}, high detail, ${style} aesthetic, masterpiece composition`
      : prompt;

    // Supported resolutions: "1K", "2K", "4K"
    const validSizes = ["1K", "2K", "4K"];
    const chosenSize = validSizes.includes(imageSize) ? imageSize : "1K";

    // Supported aspect ratios
    const validAspectRatios = ["1:1", "3:4", "4:3", "9:16", "16:9"];
    const chosenAspect = validAspectRatios.includes(aspectRatio) ? aspectRatio : "1:1";

    let imageUrl = "";
    let caption = "";

    try {
      // Primary instruction specifies using gemini-3-pro-image-preview with imageSize (1K, 2K, 4K)
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: {
          parts: [{ text: enrichedPrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: chosenAspect,
            imageSize: chosenSize
          }
        }
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          caption += part.text;
        }
      }
    } catch (primaryErr: any) {
      console.warn("gemini-3-pro-image-preview error, attempting fallback:", primaryErr.message);
      // Fallback to gemini-3.1-flash-image
      const fallbackResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-image",
        contents: {
          parts: [{ text: enrichedPrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: chosenAspect,
            imageSize: chosenSize
          }
        }
      });

      const parts = fallbackResponse.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || "image/png";
          imageUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          caption += part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.status(500).json({
        error: "Image generation model did not return image data. Please try modifying your prompt."
      });
    }

    res.json({
      imageUrl,
      caption: caption || `Generated image for "${prompt}"`,
      aspectRatio: chosenAspect,
      imageSize: chosenSize,
      prompt,
      createdAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("Image generation error:", err);
    res.status(500).json({
      error: err.message || "Failed to generate image. Please ensure your API key has appropriate image model permissions."
    });
  }
});

// 8. Voice & Text-to-Speech (TTS)
app.post("/api/audio/tts", async (req: Request, res: Response) => {
  try {
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(400).json({
        error: "GEMINI_API_KEY is not configured.",
        useClientFallback: true
      });
    }

    const { text, voice = "Kore" } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required." });
    }

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || "Kore" }
            }
          }
        }
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({
          audio: `data:audio/mp3;base64,${base64Audio}`,
          voice
        });
      }
    } catch (ttsErr: any) {
      console.warn("TTS API call failed, offering client-side speech synthesis:", ttsErr.message);
    }

    res.json({
      audio: null,
      useClientFallback: true,
      message: "Use browser Web Speech API for seamless voice playback."
    });
  } catch (err: any) {
    console.error("TTS error:", err);
    res.json({ audio: null, useClientFallback: true });
  }
});

// Start Server and mount Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NEXA AI Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Fatal server start error:", err);
  process.exit(1);
});
