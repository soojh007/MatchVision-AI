import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Instruction for coaching-focused output
const SYSTEM_INSTRUCTION = `You are an elite football coach and tactician. 
Your goal is to analyze the match footage to **teach** the player/team. 

Do not just describe what happened. Focus on **education and correction**.
Identify key decisions (good or bad) and explain the "why".

Structure your response in Markdown using "###" for section headers:

### Phase of Play
(e.g., Build-up, Transition A-D, High Press)

### Analysis
Break down the play. What technical or tactical actions occurred? Describe the movement and spacing.

### Coaching Point (Correction)
**This is the most important section.**
- If a mistake was made: Identify it clearly. Explain **why** it was a mistake (e.g., closed body shape, missed scan, poor spacing). Tell the player **exactly** what they should have done instead.
- If it was a good play: Explain why it worked so they can repeat it.

### Key Lesson
One memorable, actionable takeaway for the player's development (e.g., "Always scan your blindside before receiving").

Tone: Constructive, direct, educational, and professional. Avoid fluff.`;

export const analyzeVideoSegment = async (base64Data: string, mimeType: string, focusPrompt?: string): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API Key is missing. Please ensure your environment is configured correctly.");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Using gemini-3-pro-preview for advanced video reasoning
    const modelId = 'gemini-3-pro-preview';

    // Incorporate the user's specific focus if provided
    const userInstruction = focusPrompt 
      ? `Analyze this clip. **Focus specifically on: ${focusPrompt}**. Provide coaching points and corrections related to this request.` 
      : "Analyze this clip. Focus on coaching points and corrections.";

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
            text: userInstruction
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temp for clear, consistent advice
      }
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};