
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export async function generateNarrative(prompt: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: `You are a D&D Narrator Agent. Generate vivid, engaging narrative descriptions of scenes, actions, and outcomes. Write in second-person present tense for player actions. Use vivid sensory details and match the tone to the scene. Be concise (2-4 sentences). Do NOT output markdown.`,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Error generating narrative:", error);
        return "The air crackles with energy, but the vision is unclear...";
    }
}

export async function generateImage(prompt: string): Promise<string | null> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `A D&D fantasy scene. ${prompt}. Style: semi-realistic fantasy art, detailed, dramatic lighting.`,
            config: {
                numberOfImages: 1,
                aspectRatio: "16:9",
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
}
