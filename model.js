import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyBzzpg_gZEX7FQaxTRH4WeMEF1_pZn0qAg"
});

const interaction = await ai.interactions.create({
  model: "gemini-3.6-flash",
  input: "hi",
});

console.log(interaction.output_text);