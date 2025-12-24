import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config/env.js";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

const geminiService = async (message) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: `
        Actúa como un médico veterinario profesional.
        Responde de forma clara, breve y comprensible para cualquier persona.
        Usa solo texto plano, como si fuera un mensaje de WhatsApp.
        No saludes ni te presentes.
        No hagas preguntas adicionales ni generes conversación.
        Limítate a responder directamente la consulta del usuario.

        Si el problema descrito puede representar una urgencia veterinaria,
        indícalo de forma clara y recomienda acudir de inmediato a una clínica,
        sin dar diagnósticos definitivos ni tratamientos complejos.

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
