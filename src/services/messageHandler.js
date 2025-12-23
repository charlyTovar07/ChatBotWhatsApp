import { whatsappService } from "../services/whatsappService.js";
import { config } from "../config/env.js";

class MessageHandler {
  async handleIncomingMessage(message) {
    if (message?.type !== "text") return;

    const from = message.from;
    const text = message.text.body;

    console.log("API VERSION:", config.api_version);
    console.log("PHONE NUMBER ID:", config.phoneNumberId);

    const response = `Echo: ${text}`;

    await whatsappService.sendMessage(from, response, message.id);
    await whatsappService.markAsRead(message.id);
  }

  isGreeting(message) {
    const greetings = [
      "Hola",
      "hola",
      "Hi",
      "hi",
      "Buenos días",
      "Buenas tardes",
      "buenos días",
      "buenas tardes",
    ];
    return greetings.includes(message);
  }

  async sendWelcomeMessage(to, messageId) {
    const welcomeMessage =
      "Hola, bienvenido al servicio de PETVET online." +
      "¿En que puedo ayudarte hoy?";

    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }
}

export default new MessageHandler();
