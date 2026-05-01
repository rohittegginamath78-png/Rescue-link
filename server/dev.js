import dotenv from "dotenv";
import { serve } from "@hono/node-server";
import app from "./src/index.js";

dotenv.config();

const port = Number(process.env.PORT || 5000);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    process.stdout.write(
      `RescueLink API running on http://localhost:${info.port}\n`,
    );
  },
);
