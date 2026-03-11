import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateYogaRoutine(level: string, goals: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `Generate a personalized 15-minute yoga routine for a ${level} level practitioner with the following goals: ${goals}. 
  Return the response in JSON format with the following structure:
  {
    "title": "Routine Title",
    "description": "Short description",
    "poses": [
      { "name": "Pose Name", "duration": "Duration in seconds", "instructions": "Brief instructions" }
    ]
  }`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating yoga routine:", error);
    return {
      title: "Morning Flow",
      description: "A gentle morning flow to wake up your body.",
      poses: [
        { name: "Mountain Pose", duration: 60, instructions: "Stand tall with feet together." },
        { name: "Forward Fold", duration: 60, instructions: "Hinge at your hips and fold forward." }
      ]
    };
  }
}
