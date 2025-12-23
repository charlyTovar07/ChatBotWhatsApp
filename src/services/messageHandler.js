import { whatsappService } from "../services/whatsappService.js";
import { config } from "../config/env.js";

class MessageHandler {
  async handleIncomingMessage(message) {
    if (message?.type !== "text") return;

    const incommingMessage = message.text.body.toLowerCase().trim();

    if (this.isGreeting(incommingMessage)) {
      await this.sendWelcomeMessage(message.from, message.id);
    } else {
      const response = `Echo: ${text}`;
      await whatsappService.sendMessage(from, response, message.id);
    }
    const from = message.from;
    const text = message.text.body;

    await whatsappService.markAsRead(message.id);
  }

  isGreeting(message) {
    const greetings = ["hola", "hi", "buenos días", "buenas tardes"];
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
