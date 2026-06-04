import "./load-env.js";
import { serve } from "@hono/node-server";

import { backendConfig } from "./config.js";
import { createApp } from "./routes.js";

const app = createApp();

serve(
  {
    fetch: app.fetch,
    port: backendConfig.port,
    hostname: "0.0.0.0",
  },
  () => {
    console.log(`abdimas-backend listening on 0.0.0.0:${backendConfig.port}`);
  },
);
