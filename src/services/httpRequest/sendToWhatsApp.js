import axios from "axios";
import { config } from "../../config/env.js";

const sendToWhatsApp = async (data) => {
  const url = `${config.rutaHttps}/${config.api_version}/${config.phoneNumberId}/messages`;

  try {
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${config.apiToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error(
      "WhatsApp API error:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export default sendToWhatsApp;
