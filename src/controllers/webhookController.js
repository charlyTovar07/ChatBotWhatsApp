import messageHandler from "../services/messageHandler.js";
import { config } from "../config/env.js";

class WebhookController {
  handleIncoming = async (req, res) => {
    try {
      const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (message) {
        await messageHandler.handleIncomingMessage(message);
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("Webhook error:", error);
      res.sendStatus(200);
    }
  };

  verifyWebhook = (req, res) => {

    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === config.verifyToken) {
      console.log("Webhook verified successfully!");
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  };
}

export default new WebhookController();
