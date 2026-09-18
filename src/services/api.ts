// यह फ्रंटएंड से सीधे Gemini API को कॉल करेगा
const aiStudioKey = import.meta.env.VITE_GEMINI_API_KEY || "";

export async function runDeepResearch(prompt: string, mode: string) {
  try {
    if (!aiStudioKey) {
      throw new Error("Gemini API Key is missing in Environment Variables!");
    }

    // सीधे Gemini API को बिना बैकएंड के कॉल करना
    const url = `https://googleapis.com{aiStudioKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert deep research agent. Provide an exhaustive, structured analysis on the following topic with detailed sections, pros/cons, and verified data checkpoints. Mode: ${mode}\n\nTopic: ${prompt}`
          }]
        }]
      })
    });

    const jsonRes = await response.json();
    
    if (!response.ok) {
      throw new Error(jsonRes.error?.message || "Gemini API Request Failed");
    }

    const aiText = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text || "No response text found.";

    // आपके फ्रंटएंड के पुराने स्ट्रक्चर से मैच करने के लिए रिटर्न डेटा फॉर्मेट
    return {
      success: true,
      data: aiText
    };
  } catch (error: any) {
    console.error("Gemini Direct Error:", error);
    throw new Error(error.message || "Failed to generate research");
  }
}

export async function sendReasoningRequest(prompt: string) {
  return runDeepResearch(prompt, "reasoning");
}
