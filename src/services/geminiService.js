import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env.js';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

const geminiService = async (message) => {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: `
                Comportarte como un veterinario.
                Resuelve las preguntas de la forma más simple posible.
                Responde en texto plano como si fuera una conversación de WhatsApp.
                No saludes.
                No generes conversación.
                Solo responde a la pregunta del usuario.
            `.trim()
        });

        const result = await model.generateContent(message);
        return result.response.text();
    } catch (error) {
        console.error(error);
    }
};

export default geminiService;
