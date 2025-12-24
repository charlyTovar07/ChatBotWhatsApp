import axios from "axios";
import sendToWhatsApp from "./httpRequest/sendToWhatsApp.js";
import { config } from "../config/env.js";

class WhatsAppService {

  async sendMessage(to, body) {
    const data = {
      messaging_product: "whatsapp",
      to,
      text: { body },
    };

    await sendToWhatsApp(data);
  }

  async markAsRead(messageId) {
    const data = {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    };

    await sendToWhatsApp(data);
  }

  async sendInteractiveBottons(to, bodyText, buttons) {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "interactive",
      interactive: {
        type: "button",
        body: { text: bodyText },
        action: { buttons },
      },
    };

    await sendToWhatsApp(data);
  }

  async sendMediaMessage(to, type, mediaUrl, caption = null) {
    const mediaMap = {
      image: { image: { link: mediaUrl, caption } },
      audio: { audio: { link: mediaUrl } },
      video: { video: { link: mediaUrl, caption } },
      document: {
        document: { link: mediaUrl, caption, filename: "archivo.pdf" },
      },
      sticker: { sticker: { link: mediaUrl } },
    };

    if (!mediaMap[type]) {
      throw new Error("Unsupported media type");
    }

    const data = {
      messaging_product: "whatsapp",
      to,
      type,
      ...mediaMap[type],
    };

    await sendToWhatsApp(data);
  }

  async sendContactMessage(to, contact) {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "contacts",
      contacts: [contact],
    };

    await sendToWhatsApp(data);
  }

  async sendLocationMessage(to, location) {
    const data = {
      messaging_product: "whatsapp",
      to,
      type: "location",
      location: {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        name: location.name,
        address: location.address,
      },
    };

    await sendToWhatsApp(data);
  }
}

export const whatsappService = new WhatsAppService();
