import dotenv from "dotenv";

dotenv.config();

export const config = {
  verifyToken: process.env.WEBHOOK_VERIFY_TOKEN,
  apiToken: process.env.API_TOKEN,
  phoneNumberId: process.env.BUSINESS_PHONE,
  api_version: process.env.API_VERSION,
  port: process.env.PORT || 3000,
};
