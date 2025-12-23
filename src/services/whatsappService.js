import axios from "axios";
import { config } from "../config/env.js";

class WhatsAppService {
  async sendMessage(to, body, messageId) {
    try {
      await axios({
        method: "POST",
        url: `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          "Content-Type": "application/json",
        },

        data: {
          messaging_product: "whatsapp",
          to,
          text: { body },
          // context: { message_id: messageId },
        },
      });
    } catch (error) {
      console.error(
        "Error sending message:",
        error.response?.data || error.message
      );
    }
  }

  async markAsRead(messageId) {
    try {
      await axios({
        method: "POST",
        url: `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          "Content-Type": "application/json",
        },
        data: {
          messaging_product: "whatsapp",
          status: "read",
          message_id: messageId,
        },
      });
    } catch (error) {
      console.error(
        "Error marking as read:",
        error.response?.data || error.message
      );
    }
  }

  async sendInteractiveBottons(to, BodyText, buttons) {
    try {
      await axios({
        method: "POST",
        url: `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          "Content-Type": "application/json",
        },

        data: {
          messaging_product: "whatsapp",
          to,
          type: "interactive",
          interactive: {
            type: "button",
            body: { text: BodyText },
            action: {
              buttons: buttons,
            },
          },
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  async sendMediaMessage(to, type, mediaUrl, caption) {
    try {
      const mediaObject = {};

      switch (type) {
        case "image":
          mediaObject.image = { link: mediaUrl, caption };
          break;

        case "audio":
          mediaObject.audio = { link: mediaUrl };
          break;

        case "video":
          mediaObject.video = { link: mediaUrl, caption };
          break;

        case "document":
          mediaObject.document = {
            link: mediaUrl,
            caption,
            filename: "archivo.pdf",
          };
          break;

        case "sticker":
          mediaObject.sticker = { link: mediaUrl };
          break;

        default:
          throw new Error("Unsupported media type");
      }

      await axios.post(
        `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
        {
          messaging_product: "whatsapp",
          to,
          type,
          ...mediaObject,
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error(
        "Error sending media:",
        error.response?.data || error.message
      );
    }
  }
}

export const whatsappService = new WhatsAppService();
