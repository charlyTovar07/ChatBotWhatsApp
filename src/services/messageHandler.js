import { whatsappService } from "../services/whatsappService.js";

class MessageHandler {
  async handleIncomingMessage(message, senderInfo) {
    if (message?.type === "text") {
      const text = message.text.body;

      const incomingMessage = text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(message.from, message.id, senderInfo);
        await this.sendWelcomeMenu(message.from);
      } else {
        const response = `Echo: ${message.text.body}`;
        await whatsappService.sendMessage(message.from, response, message.id);
      }
      await whatsappService.markAsRead(message.id);
      return;
    }
    // MEDIA (image, audio, video, document, sticker)
    if (
      ["image", "audio", "video", "document", "sticker"].includes(message.type)
    ) {
      await this.sendMedia(from, message.type);
      await whatsappService.markAsRead(message.id);
      return;
    }

    // INTERACTIVOS
    if (message.type === "interactive") {
      const option = message.interactive?.button_reply?.id;
      await this.handleMenuOption(from, option);
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

  async sendMedia(to, type) {
    const mediaMap = {
      audio: {
        url: "https://bucketcharlyamazon07.s3.us-east-2.amazonaws.com/public/Bienvenida.m4a",
        caption: null,
      },
      image: {
        url: "https://bucketcharlyamazon07.s3.us-east-2.amazonaws.com/public/logo.jpg",
        caption: "¡Esto es una imagen!",
      },
      video: {
        url: "https://bucketcharlyamazon07.s3.us-east-2.amazonaws.com/public/Veterinaria.mp4",
        caption: "¡Esto es un video!",
      },
      document: {
        url: "https://s3.amazonaws.com/gndx.dev/medpet-file.pdf",
        caption: "¡Esto es un PDF!",
      },
      sticker: {
        url: "https://s3.amazonaws.com/gndx.dev/medpet-sticker.webp",
        caption: null,
      },
    };

    const media = mediaMap[type];
    if (!media) return;

    await whatsappService.sendMediaMessage(to, type, media.url, media.caption);
  }
}

export default new MessageHandler();
