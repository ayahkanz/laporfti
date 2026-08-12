import "dotenv/config";
import { seedIfEmpty } from "./db/seed";
import { createApp } from "./app";

seedIfEmpty();

const PORT = Number(process.env.API_PORT) || 8787;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Lapor FIT API listening on port ${PORT}`);
});
