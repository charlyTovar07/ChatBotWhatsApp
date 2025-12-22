import express from 'express';
import axios from 'axios';
import 'dotenv/config';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

// Verificación del webhook
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('WEBHOOK VERIFIED');
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Recepción ECO
app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    const message = value?.messages?.[0];
    if (!message) {
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text?.body;
    if (!text) {
      return res.sendStatus(200);
    }

    console.log('Mensaje recibido:', text);

    await axios.post(
      `https://graph.facebook.com/v24.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: from,
        text: { body: `Eco: ${text}` }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.sendStatus(200);
  } catch (error) {
    console.error(
      'Error enviando mensaje:',
      error.response?.data || error.message
    );
    res.sendStatus(200);
  }
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
