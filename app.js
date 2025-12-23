import express from "express";
import webhookRoutes from "./src/routes/webhookRoutes.js";
import { config } from "./src/config/env.js";

const app = express();
app.use(express.json());

app.use("/", webhookRoutes);

app.get("/", (req, res) => {
  res.send("<pre>Nothing to see here. Checkout README.md to start</pre>");
});

app.listen(config.port, () => {
  console.log(`Server is listening on port: ${config.port}`);
});
