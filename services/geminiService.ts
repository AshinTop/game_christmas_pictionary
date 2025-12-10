import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const identifyDrawing = async (base64Image: string, targetWord: string): Promise<{ isCorrect: boolean; guess: string; reasoning: string }> => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing!");
    return { isCorrect: false, guess: "Error: No API Key", reasoning: "Please set your API Key." };
  }

  try {
    // Remove the data URL prefix if present to get just the base64 string
    const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const prompt = `
      You are playing Pictionary. The theme is Christmas.
      The secret word is "${targetWord}".
      
      Look at this line drawing.
      1. Identify what is drawn. 
      2. Determine if the drawing reasonably represents the secret word "${targetWord}".
      
      Be lenient but accurate. If it looks like a generic version of the object, count it.
      
      Return a JSON object with this structure:
      {
        "guess": "What you see in 1-3 words",
        "isMatch": boolean (true if it matches the secret word closely),
        "reasoning": "Short explanation"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    const result = JSON.parse(responseText);
    
    return {
      isCorrect: result.isMatch,
      guess: result.guess,
      reasoning: result.reasoning
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      isCorrect: false,
      guess: "I couldn't see that.",
      reasoning: "There was a technical error processing the image."
    };
  }
};