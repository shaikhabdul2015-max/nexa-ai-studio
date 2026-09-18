const aiStudioKey = import.meta.env.VITE_GEMINI_API_KEY || "";

export async function runDeepResearch(prompt: string, mode: string) {
  try {
    if (!aiStudioKey) throw new Error("API Key missing");
    
    // सीधा गूगल के सर्वर को कॉल (कोई एक्सप्रेस सर्वर नहीं)
    const response = await fetch(`https://googleapis.com{aiStudioKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are a deep research expert. Analyze: ${prompt}. Mode: ${mode}` }] }]
      })
    });

    const jsonRes = await response.json();
    const aiText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    return { success: true, data: aiText };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function sendReasoningRequest(prompt: string) {
  return runDeepResearch(prompt, "reasoning");
}
