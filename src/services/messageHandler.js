import { whatsappService } from '../services/whatsappService.js';

class MessageHandler {
  async handleIncomingMessage(message) {
    if (message?.type !== 'text') return;

    const from = message.from;
    const text = message.text.body;

    const response = `Echo: ${text}`;

    await whatsappService.sendMessage(from, response, message.id);
    await whatsappService.markAsRead(message.id);
  }
}

export default new MessageHandler();
