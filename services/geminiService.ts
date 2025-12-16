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

const applyChromaKey = (base64Image: string): Promise<string> => {
  return new Promise((resolve) => {
    // If running in non-browser environment (unlikely for this app), return original
    if (typeof Image === 'undefined' || typeof document === 'undefined') {
      resolve(base64Image);
      return;
    }

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        resolve(base64Image);
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Auto-detect background color from top-left corner
      // The model usually places the object in the center, so (0,0) should be background.
      const bgR = data[0];
      const bgG = data[1];
      const bgB = data[2];
      
      // Determine target color. Default to Magenta #FF00FF if auto-detection seems off (e.g. if the corner is black/white)
      // Magenta is roughly High R, Low G, High B.
      let targetR = bgR;
      let targetG = bgG;
      let targetB = bgB;

      // Safety check: if the detected color isn't "saturated" enough or "magenta-ish" enough, force pure magenta
      // Pure Magenta is (255, 0, 255). 
      // If we see lots of Green, it's definitely not the magenta key we asked for.
      if (bgG > 100 && bgR < 150) {
         // Fallback to strict Magenta
         targetR = 255;
         targetG = 0;
         targetB = 255;
      }

      // Euclidean distance tolerance. 
      // 90 is lenient enough to catch compression artifacts but strict enough to keep the item.
      const tolerance = 90; 

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const distance = Math.sqrt(
          Math.pow(r - targetR, 2) +
          Math.pow(g - targetG, 2) +
          Math.pow(b - targetB, 2)
        );

        if (distance < tolerance) {
           data[i + 3] = 0; // Transparent
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      console.warn("Failed to load image for chroma keying");
      resolve(base64Image);
    };
    img.src = base64Image;
  });
};

export const removeBackgroundAI = async (imageUri: string): Promise<string | null> => {
  try {
    let mimeType = 'image/png';
    let data = imageUri;

    // Parse base64 if present
    if (imageUri.includes('data:')) {
      const matches = imageUri.match(/^data:(.*);base64,(.*)$/);
      if (matches) {
        mimeType = matches[1];
        data = matches[2];
      }
    } else {
        // Remote URL not supported for this edit operation in this context
        return null;
    }

    // We ask Gemini to put the object on a Magenta background.
    // This allows us to easily filter it out client-side.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: 'Extract the main clothing item from this image. Place the item on a solid, pure Magenta background (Hex: #FF00FF, RGB: 255, 0, 255). Ensure the edges are clean and there are no shadows cast on the magenta background. Do not crop the item.'
          },
          {
            inlineData: {
              mimeType,
              data
            }
          }
        ]
      }
    });

    // Extract image from response
    if (response.candidates && response.candidates[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64String = part.inlineData.data;
                const rawImage = `data:image/png;base64,${base64String}`;
                
                // Process the image to remove the magenta background
                const transparentImage = await applyChromaKey(rawImage);
                return transparentImage;
            }
        }
    }

    return null;

  } catch (error) {
    console.error("Gemini Background Removal Error:", error);
    return null;
  }
};
