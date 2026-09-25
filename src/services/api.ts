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

// Google Gemini API का लाइव एंडपॉइंट
const targetModel = model.includes("gemini") ? model : "gemini-2.5-flash";
const url = https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey};

// Vite / Frontend के हिसाब से डेटा स्ट्रक्चर तैयार करना
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
const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "कोई जवाब नहीं मिला।";

// स्ट्रीम जैसा बर्ताव दिखाने के लिए फ्रंटएंड को चंक भेजना
callbacks.onChunk(replyText);
callbacks.onDone();

} catch (err: any) {
if (err.name === 'AbortError') return;
callbacks.onError(err.message || "कुछ गड़बड़ हुई है।");
}
}
