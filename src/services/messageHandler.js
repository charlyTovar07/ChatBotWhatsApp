import { whatsappService } from "../services/whatsappService.js";

class MessageHandler {
  async handleIncomingMessage(message, senderInfo) {
    if (message?.type !== "text") return;

    const from = message.from;
    const text = message.text.body;
    const incommingMessage = message.text.body
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    if (this.isGreeting(incommingMessage)) {
      await this.sendWelcomeMessage(message.from, message.id, senderInfo);
      await this.sendWelcomeMenu(message.from);

    } else {
      const response = `Echo: ${text}`;
      await whatsappService.sendMessage(from, response, message.id);
    }
    await whatsappService.markAsRead(message.id);
  }

  isGreeting(message) {
    const greetings = [
      "hola",
      "hi",
      "buenos días",
      "buenos dias",
      "buenas tardes",
      "buenas noches",
    ];
    return greetings.includes(message);
  }

  getSenderName(senderInfo) {
    if (!senderInfo) return "Practicante de ValcomTI";

    const name =
      senderInfo.profile?.name || senderInfo.wa_id || "Practicante de ValcomTI";

    const firstName = name.split(" ")[0];
    return firstName;
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo);

    const welcomeMessage =
      `Hola ${name}, Bienvenido al servicio de PETVET online. ` +
      "¿En que puedo ayudarte hoy?";

    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

  async sendWelcomeMenu(to) {
    const menuMessage = "Elige una opción";
    const buttons = [
      {
        type: "reply",
        reply: { id: "option_1", title: "Agendar" },
      },
      {
        type: "reply",
        reply: { id: "option_2", title: "Consultar" },
      },
      {
        type: "reply",
        reply: { id: "option_3", title: "Ubicación" },
      },
    ];

    await whatsappService.sendInteractiveBottons(to, menuMessage, buttons);
  }
}

export default new MessageHandler();
