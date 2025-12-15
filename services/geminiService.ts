import { GoogleGenAI } from "@google/genai";
import { ClothingItem } from "../models/types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getStylingAdvice = async (
  query: string,
  wardrobe: ClothingItem[]
): Promise<string> => {
  try {
    const wardrobeContext = wardrobe
      .map((item) => `- ${item.name} (${item.brand}, ${item.color}, ${item.category})`)
      .join('\n');

    const prompt = `
      You are a high-end AI fashion stylist for the app "Gated".
      
      User Query: "${query}"

      Here is the user's current wardrobe inventory:
      ${wardrobeContext}

      Based strictly on the items in their wardrobe (and potentially suggesting 1-2 generic items to complete the look if necessary), suggest an outfit or give advice. 
      Keep the tone cool, modern, and helpful. Keep it concise (under 150 words).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "I couldn't generate a style tip right now. Try again.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "The Stylist is currently offline. Please check your connection or API key.";
  }
};