import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/env.js";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

const geminiService = async (message) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: `
        Comportarte como un veterinario.
        Responde simple, texto plano.
        No saludes.
        No generes conversación.
        Solo responde a la pregunta del usuario.
      `.trim(),
    });

    const result = await model.generateContent(message);
    const text = result.response.text();

    return text || "No pude generar una respuesta en este momento.";
  } catch (error) {
    console.error("Gemini error:", error);
    return "Lo siento, ocurrió un problema al procesar tu consulta.";
  }
};

export default geminiService;
