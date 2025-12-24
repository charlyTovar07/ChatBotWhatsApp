import fs from "fs";
import path from "path";
import { google } from "googleapis";

const sheets = google.sheets("v4");

async function addRowToSheet(auth, spreadsheetId, values) {
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "reservas",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource: { values: [values] },
      auth,
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

const appendToSheet = async (data) => {
  try {
    // --- Crear archivo temporal de credenciales ---
    const credentialsPath = path.join(process.cwd(), "credentials.json");
    fs.writeFileSync(credentialsPath, process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

    const auth = new google.auth.GoogleAuth({
      keyFile: credentialsPath,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const authClient = await auth.getClient();
    const spreadsheetId = "1tcmkAmd6-Ah1JjDnr0EMZq0FUaUcaPbXvuKb-IGb3Z8";

    await addRowToSheet(authClient, spreadsheetId, data);
    return "Datos correctamente agregados";
  } catch (error) {
    console.error(error);
  } finally {
    // --- Limpiar archivo temporal ---
    if (fs.existsSync(path.join(process.cwd(), "credentials.json"))) {
      fs.unlinkSync(path.join(process.cwd(), "credentials.json"));
    }
  }
};

export default appendToSheet;
