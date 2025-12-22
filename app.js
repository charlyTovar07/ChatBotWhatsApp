const axios = require('axios');

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

    console.log('Incoming message:', text);

    await axios.post(
      `https://graph.facebook.com/v24.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: from,
        text: {
          body: `Eco: ${text}`
        }
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
    console.error('Error sending reply:', error.response?.data || error.message);
    res.sendStatus(200);
  }
});
