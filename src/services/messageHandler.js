import { whatsappService } from "../services/whatsappService.js";

class MessageHandler {
  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === "text") {
      const from = message.from;
      const text = message.text.body;

      const incomingMessage = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(from, message.id, senderInfo);
        await this.sendWelcomeMenu(from);
      } else {
        await whatsappService.sendMessage(from, `Echo: ${text}`, message.id);
      }

      await whatsappService.markAsRead(message.id);
    } else if (message?.type === "audio") {
      await this.sendMedia(message.from);
      await whatsappService.markAsRead(message.id);
    } else if (message?.type === "interactive") {
      const option = message.interactive?.button_reply?.id;
      await this.handleMenuOption(message.from, option);
      await whatsappService.markAsRead(message.id);
    }
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

  async handleMenuOption(to, option) {
    let response;
    switch (option) {
      case "option_1":
        response = "Agendar Cita";
        break;
      case "option_2":
        response = "Realiza tu consulta";
        break;
      case "option_3":
        response = "Esta es nuestra Ubicación";
        break;
      default:
        response =
          "Lo siento, no entendí tu selección. Por favor elige una opción válida.";
    }
    await whatsappService.sendMessage(to, response);
  }

  async sendMedia(to) {
    const mediaURL =
      "https://www.dropbox.com/scl/fi/jawylgtksb7xrj12yy0j7/Bienvenida.m4a?rlkey=arrd1zlgpw6g7hnuv07eioro6&st=u90o3mg2&dl=1";
    const caption = "¡Bienvenido!";
    const type = "audio";

    await whatsappService.sendMediaMessage(to, type, mediaURL, caption);
  }
}

export default new MessageHandler();
