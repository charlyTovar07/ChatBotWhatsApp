import { whatsappService } from "../services/whatsappService.js";

class MessageHandler {
  async handleIncomingMessage(message, senderInfo) { 
    if (message?.type === "text") {
      const from = message.from;
      const text = message.text.body;
      const mediaFile = []

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
    } else if (message?.type === "media") {
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
      "https://bucketcharlyamazon07.s3.us-east-2.amazonaws.com/Bienvenida.m4a?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEEsaCXVzLWVhc3QtMiJHMEUCIEZVD8XUrguq6KFfO%2FTe74kaQihtO9IAIFS89ISeF5uFAiEAvG8%2BcfxntEVsnjcL%2BjWdfeEOMXDkL1II3j%2F%2BJahiYHsq%2BQIIFRAAGgw1NjYyMDg0MTcyODMiDKExSrpgMw3zh%2BCLvirWApp79BP0ZgHc9LhRCv2SOPvkvrqoYzsCKFAHSzX3oFHjzReh%2FHVR14eWXV5ONRKNd0iwlabQN4YcmwfUoVRuZV5dLdAZKWGG1YBIe%2F3lxckB%2BNEwKMe3HjBkg08hA2uOYsFhuT89lJGyVZTFbuIdHdhhSaXjMuACzbZYg44Hc3msQ%2BT4GL1bX1ekXBKVulGkz1%2FaUj89rA81H59c2MTOqJqSqxkbmCnUghPg2pbeCLkPOQD3%2FrLVOwKw9BD9okIbKNjXmvGLC6D3UHXVt2n5mvDcNqEre5CMp0qETyf9jPj9hV0VP%2F8stzPVItCBKoyzM5p7z%2Frr7G1BoBWceWdDsfgJP4Hd3jKLrHJSkItjnvPlqFXakDUI7u91WvGLibKlYM1wQUjmPq2EfRjJvzKSZoAAQnlQPDBps6%2BUTmj8wDsBmXXfSn4FZfW696qKCC2fVKFyVQVYVzDRyKvKBjqPAuY6P7i17%2BbQCgzSoV2SNzc3ERRUgufgytUbaJYzvj20SLK7It2q23low%2FrPcUm1hsgnRjv%2BA5JfxZsYPE3tCqUiSWPZga6BhtuCxAPEhB3vcIu%2FmpppsdD8kiBJ39yZR35NSDSmRI746K392htgt1x3HZvFgp8%2FCdazR5Q9AyufPpOjjROdF8uJjwiCurJ3VjjaGatXuvKIqJUFQANHQiSU%2Foej3NFQy9XKGEJuTgvi4pselC9%2BviR8XJIHCdpPj827c%2FYLCj%2FZTMKm26fEAWJEGe7ot3gJBgMl6Dh%2FV5KFSs91HAeEwwinOxJ6au3HcEUAp3RW%2Bbz8CWrl0vUkpnofe2fIFRj0T7DRF7EBwe8%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAYHVFGZYB7LHAG62T%2F20251223%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20251223T192350Z&X-Amz-Expires=36000&X-Amz-SignedHeaders=host&X-Amz-Signature=d6b156f85e33b212749d72e8825313214b2208b6c26e5ce35a5e3446bbbe00a2";
    const caption = "¡Bienvenido!";
    const type = "audio";

    await whatsappService.sendMediaMessage(to, type, mediaURL, caption);
  }
}

export default new MessageHandler();
