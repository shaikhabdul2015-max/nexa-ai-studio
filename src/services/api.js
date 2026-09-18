const aiStudioKey = import.meta.env.VITE_GEMINI_API_KEY || "";

export async function runDeepResearch(prompt, mode) {
  try {
    if (!aiStudioKey) throw new Error("API Key missing");
    
    const response = await fetch(`https://googleapis.com{aiStudioKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `You are a deep research expert. Analyze: ${prompt}. Mode: ${mode}` }] }]
      })
    });

    const jsonRes = await response.json();
    const aiText = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    return { success: true, data: aiText };
  } catch (error) {
    return { success: false, data: error.message };
  }
}

export async function sendReasoningRequest(prompt) {
  return runDeepResearch(prompt, "reasoning");
}
export async function checkSystemHealth() {
  return { status: "ok" };
}

  