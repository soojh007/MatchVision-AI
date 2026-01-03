import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are a world-class football (soccer) tactical analyst and scout. 
Your job is to analyze video segments of football matches and provide high-level professional insights.

When analyzing a clip, structure your response in Markdown with the following sections:
1. **Match Context & Phase**: Briefly describe the current phase of play (e.g., Build-up, Counter-attack, High Press).
2. **Key Tactical Observations**: Analyze player positioning, formations (if visible), and off-the-ball movement.
3. **Critical Moments**: Identify specific events like key passes, defensive errors, excellent tackles, or shots.
4. **Player Performance**: Highlight specific players (refer to them by jersey number or description if names aren't known) who made a significant impact in the clip.
5. **Strategic Verdict**: A summary of what went right or wrong for the attacking/defending team.

Keep the tone professional, objective, and insightful, similar to top-tier broadcast analysis like Sky Sports or tactical blogs like The Athletic.`;

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
            text: "Analyze this football match segment. Identify the key tactical points, player movements, and significant plays."
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