import "./load-env.js";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";

import { backendConfig } from "./config.js";
import { createApp } from "./routes.js";

const app = createApp();

const { injectWebSocket, upgradeWebSocket, wss } = createNodeWebSocket({ app });

import { createWsSyncHandler } from "./routes/ws-sync.js";

app.get("/ws/sync", createWsSyncHandler(upgradeWebSocket));

const server = serve(
  {
    fetch: app.fetch,
    port: backendConfig.port,
    hostname: "0.0.0.0",
  },
  () => {
    console.log(`abdimas-backend listening on 0.0.0.0:${backendConfig.port}`);
  },
);

injectWebSocket(server);

wss.on("error", (err: unknown) => {
  console.error("[ws] WebSocket server error:", err);
});

console.log("[ws] WebSocket server initialized");
