import { ChatAttachment, ChatMessage } from "../types"; 

export interface StreamCallbacks {
onChunk: (text: string) => void;
onError: (error: string) => void;
onDone: () => void;
} 

export async function checkSystemHealth() {
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
if (!apiKey) {
return { status: "offline", geminiConfigured: false, error: "API Key missing" };
}
return { status: "online", geminiConfigured: true };
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
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; 

if (!apiKey) {
throw new Error("VITE_GEMINI_API_KEY Vercel पर सेट नहीं है।");
}

const targetModel = model.includes("gemini") ? model : "gemini-2.5-flash";
const url = https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey};

const contents = messages.map(msg => ({
role: msg.role === "user" ? "user" : "model",
parts: [{ text: msg.content }]
}));

const response = await fetch(url, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
contents: contents,
systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined
}),
signal
});

if (!response.ok) {
const errData = await response.json().catch(() => ({}));
throw new Error(errData.error?.message || API Error: ${response.status});
}

const data = await response.json();

// TypeScript को शांत रखने के लिए सुरक्षित ऑब्जेक्ट पाथ का इस्तेमाल
const candidates = data.candidates;
let replyText = "कोई जवाब नहीं मिला।";

if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts && candidates[0].content.parts[0]) {
replyText = candidates[0].content.parts[0].text || replyText;
}

callbacks.onChunk(replyText);
callbacks.onDone();

} catch (err: any) {
if (err.name === 'AbortError') return;
callbacks.onError(err.message || "कुछ गड़बड़ हुई है।");
}
}
