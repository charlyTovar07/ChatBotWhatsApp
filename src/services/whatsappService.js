import axios from 'axios';
import { config } from '../config/env.js';

class WhatsAppService {
  async sendMessage(to, body, messageId) {
    try {
      await axios({
        method: 'POST',
        url: `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json'
        },
        
        data: {
          messaging_product: 'whatsapp',
          to,
          text: { body },
          ...(messageId && {
            context: { message_id: messageId }
          })
        }
      });
    } catch (error) {
      console.error(
        'Error sending message:',
        error.response?.data || error.message
      );
    }
  }

  async markAsRead(messageId) {
    try {
      await axios({
        method: 'POST',
        url: `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId
        }
      });
    } catch (error) {
      console.error(
        'Error marking as read:',
        error.response?.data || error.message
      );
    }
  }

  async sendInteractiveBottons (to, BodyText, buttons) {
    try{
      await axios({
        method: 'POST',
        url: `https://graph.facebook.com/v18.0/${config.phoneNumberId}/messages`,
        headers: {
          Authorization: `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json'
        },
        
        data: {
          messaging_product: 'whatsapp',
          to,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: { text: BodyText },
            action: {
              buttons: buttons
            }
          }
        }
      });
    } catch (error) {
      console.error(error);
    }
  }

}

export const whatsappService = new WhatsAppService();
