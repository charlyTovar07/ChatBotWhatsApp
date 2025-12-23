import { whatsappService } from "../services/whatsappService.js";

class MessageHandler {
  async handleIncomingMessage(message, senderInfo) {
    if (message?.type !== "text") return;
    
    const from = message.from;
    const text = message.text.body;
    const incommingMessage = message.text.body.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

    if (this.isGreeting(incommingMessage)) {
      await this.sendWelcomeMessage(message.from, message.id, senderInfo);
    } else {
      const response = `Echo: ${text}`;
      await whatsappService.sendMessage(from, response, message.id);
    }
    

    await whatsappService.markAsRead(message.id);
  }

  isGreeting(message) {
    const greetings = ["hola", "hi", "buenos días", "buenos dias", "buenas tardes", "buenas noches"];
    return greetings.includes(message);
  }

  getSenderName(senderInfo){
    if (!senderInfo) return "Practicante de ValcomTI";

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
