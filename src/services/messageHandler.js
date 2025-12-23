import { whatsappService } from "../services/whatsappService.js";
import { config } from "../config/env.js";

class MessageHandler {
  async handleIncomingMessage(message, senderInfo) {
    if (message?.type !== "text") return;

    const incommingMessage = message.text.body.toLowerCase().trim();

    if (this.isGreeting(incommingMessage)) {
      await this.sendWelcomeMessage(message.from, message.id);
    } else {
      const response = `Echo: ${text}`;
      await whatsappService.sendMessage(from, response, message.id, senderInfo);
    }
    const from = message.from;
    const text = message.text.body;

    await whatsappService.markAsRead(message.id);
  }

  isGreeting(message) {
    const greetings = ["hola", "hi", "buenos días", "buenas tardes"];
    return greetings.includes(message);
  }

  getSenderName(senderInfo){
    return senderInfo.profile?.name || senderInfo.wa_id || "Practicante de ValcomTI";
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo);

    const welcomeMessage =
      `Hola ${name}, Bienvenido al servicio de PETVET online. `+ "¿En que puedo ayudarte hoy?";

    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }
}

export default new MessageHandler();
