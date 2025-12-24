import { whatsappService } from "../services/whatsappService.js";
import geminiService from "./geminiService.js";
import appendToSheet from "./googleSheetsService.js";

class MessageHandler {
  constructor() {
    this.appointmentState = {};
    this.assistandState = {};
  }

  async handleIncomingMessage(message, senderInfo) {
    const from = message.from;

    if (message.type === "text") {
      const rawText = message.text.body;

      const incomingMessage = rawText
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

      if (this.isGreeting(incomingMessage)) {
        await this.sendWelcomeMessage(from, message.id, senderInfo);
        await this.sendWelcomeMenu(from);
      } else if (incomingMessage === "media") {
        await this.sendMedia(from, "audio");
      } else if (this.appointmentState[from]) {
        await this.handleAppointmentFlow(from, incomingMessage);
      } else if (this.assistandState[from]) {
        await this.handleAssistandFlow(from, incomingMessage);
      } else {
        await this.handleMenuOption(from, incomingMessage);
      }

      await whatsappService.markAsRead(message.id);
      return;
    }

    if (
      ["image", "audio", "video", "document", "sticker"].includes(message.type)
    ) {
      await this.sendMedia(from, message.type);
      await whatsappService.markAsRead(message.id);
      return;
    }

    if (message.type === "interactive") {
      const option = message.interactive?.button_reply?.id;
      await this.handleMenuOption(from, option);
      await whatsappService.markAsRead(message.id);
    }
  }

  isGreeting(message) {
    return [
      "hola",
      "hi",
      "buenos dias",
      "buenas tardes",
      "buenas noches",
    ].includes(message);
  }

  getSenderName(senderInfo) {
    const name = senderInfo?.profile?.name || senderInfo?.wa_id || "Usuario";

    return name.split(" ")[0];
  }

  async sendWelcomeMessage(to, messageId, senderInfo) {
    const name = this.getSenderName(senderInfo);
    const welcomeMessage = `Hola ${name}, Bienvenido al servicio de PETVET online. ¿En que puedo ayudarte hoy?`;
    await whatsappService.sendMessage(to, welcomeMessage, messageId);
  }

  async sendWelcomeMenu(to) {
    const buttons = [
      { type: "reply", reply: { id: "option_1", title: "Agendar" } },
      { type: "reply", reply: { id: "option_2", title: "Consultar" } },
      { type: "reply", reply: { id: "option_3", title: "Ubicación" } },
    ];

    await whatsappService.sendInteractiveBottons(
      to,
      "Elige una opción",
      buttons
    );
  }

  async handleMenuOption(to, option) {
    let response;

    switch (option) {
      case "option_1":
        this.appointmentState[to] = { step: "name" };
        response = "Por favor, ingresa tu nombre:";
        break;
      case "option_2":
        this.assistandState[to] = { step: "question" };
        response = "Realiza tu consulta";
        break;
      case "option_3":
        response = "Te esperamos en nuestra sucursal.";
        await this.sendLocation(to);
        break;
      case "option_emergencia":
        await this.sendContact(to);
        response =
          "Sí esto es una emergencia, te invitamos a llamar a nuestra línea de atención";
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
        url: "https://bucketcharlyamazon07.s3.us-east-2.amazonaws.com/public/good_moorning.aac",
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
        url: "https://bucketcharlyamazon07.s3.us-east-2.amazonaws.com/public/DOCUMENTO+DE+VALCOM+TI.docx",
        caption: "¡Esto es un documento!",
      },
      sticker: {
        url: "https://bucketcharlyamazon07.s3.us-east-2.amazonaws.com/public/sticker_vetpet.webp",
        caption: null,
      },
    };

    const media = mediaMap[type];
    if (!media) return;

    await whatsappService.sendMediaMessage(to, type, media.url, media.caption);
  }

  async handleAppointmentFlow(to, message) {
    const state = this.appointmentState[to];
    let response;

    switch (state.step) {
      case "name":
        state.name = message;
        state.step = "petName";
        response = "Gracias, ahora, ¿Cuál es el nombre de tu mascota?";
        break;
      case "petName":
        state.petName = message;
        state.step = "petType";
        response = "¿Qué tipo de mascota es? (perro, gato, huron, etc)";
        break;
      case "petType":
        state.petType = message;
        state.step = "reason";
        response = "¿Cuál es el motivo de la consulta?";
        break;
      case "reason":
        state.reason = message;
        response = this.completeAppointment(to);
        break;
    }

    await whatsappService.sendMessage(to, response);
  }

  completeAppointment(to) {
    const appointment = this.appointmentState[to];
    delete this.appointmentState[to];

    const userData = [
      to,
      appointment.name,
      appointment.petName,
      appointment.petType,
      appointment.reason,
      new Date().toISOString(),
    ];

    appendToSheet(userData);

    return `Gracias por agendar tu cita. Resumen de tu cita:
            Nombre: ${appointment.name}
            Nombre de la mascota: ${appointment.petName}
            Tipo de mascota: ${appointment.petType}
            Motivo: ${appointment.reason}
            Nos pondremos en contacto contigo pronto, para confirmar la fecha y hora de tu cita.`;
  }

  async handleAssistandFlow(to, message) {
    const state = this.assistandState[to];
    let response;

    const menuMessage = "¿La respuesta fué de tu ayuda?";
    const buttons = [
      { type: "reply", reply: { id: "option_4", title: "Sí, Gracias" } },
      {
        type: "reply",
        reply: { id: "option_5", title: "Hacer otra pregunta" },
      },
      {
        type: "reply",
        reply: { id: "option_emergencia", title: "Emergencia" },
      },
    ];

    if (state.step === "question") {
      response = await geminiService(message);
    }

    delete this.assistandState[to];
    await whatsappService.sendMessage(to, response);
    await whatsappService.sendInteractiveBottons(to, menuMessage, buttons);
  }

  async sendContact(to) {
    const contact = {
      addresses: [
        {
          street: "123 Calle de las Mascotas",
          city: "Ciudad",
          state: "Estado",
          zip: "12345",
          country: "Paí­s",
          country_code: "PA",
          type: "WORK",
        },
      ],
      emails: [
        {
          email: "contacto@VetPet.com",
          type: "WORK",
        },
      ],
      name: {
        formatted_name: "VetPet Contacto",
        first_name: "VetPet",
        last_name: "Contacto",
        middle_name: "",
        suffix: "",
        prefix: "",
      },
      org: {
        company: "VetPet",
        department: "Atención al Cliente",
        title: "Representante",
      },
      phones: [
        {
          phone: "+1234567890",
          wa_id: "1234567890",
          type: "WORK",
        },
      ],
      urls: [
        {
          url: "https://www.VetPet.com",
          type: "WORK",
        },
      ],
    };

    await whatsappService.sendContactMessage(to, contact);
  }

  async sendLocation(to) {
    const location = {
      latitude: 21.149412091722603,
      longitude: -101.65857289178,
      name: "Valcom TI",
      address:
        "Catalina Villavicencio 210, La Alameda, 37204 León de los Aldama, Gto.",
    };

    await whatsappService.sendLocationMessage(to, location);
  }
}

export default new MessageHandler();
