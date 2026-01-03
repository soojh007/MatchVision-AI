import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are a world-class football (soccer) tactical analyst and scout. 
Your job is to analyze video segments of football matches and provide high-level professional insights.

IMPORTANT: Keep your analysis SHORT and CONCISE. Use bullet points. Do not write long paragraphs. 
Focus only on the most critical details.

Structure your response in Markdown:
1. **Context**: Phase of play (e.g., Build-up, Counter).
2. **Key Tactics**: Formations or movements observed.
3. **Critical Events**: Key passes, errors, or skills.
4. **Verdict**: Brief strategic summary.

Keep the total response under 250 words.`;

export const analyzeVideoSegment = async (base64Data: string, mimeType: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // We use the pro model for complex video understanding
    const modelId = 'gemini-3-pro-preview';

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Analyze this match segment briefly. What are the key tactical points?"
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4, // Lower temperature for more analytical/factual output
      }
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};