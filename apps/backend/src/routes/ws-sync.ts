import type { Context } from "hono";
import type { UpgradeWebSocket } from "hono/ws";
import type { WebSocket } from "ws";

import { resolveSession } from "../session.js";
import { addClient, removeClient, subscribeClient, unsubscribeClient, type WsClient } from "../lib/ws-bus.js";

type WsSyncMessage =
  | { type: "subscribe"; keys: string[] }
  | { type: "unsubscribe"; keys: string[] }
  | { type: "ping" };

export function createWsSyncHandler(upgradeWebSocket: UpgradeWebSocket<WebSocket>) {
  return upgradeWebSocket((c: Context) => {
    let client: WsClient | null = null;

    return {
      onOpen: async (_evt, ws) => {
        const cookie = c.req.header("cookie");
        const sessionUser = await resolveSession(cookie);
        if (!sessionUser) {
          ws.close(4001, "Unauthorized");
          return;
        }

        client = {
          ws: ws.raw as unknown as WebSocket,
          keys: new Set(),
          userId: sessionUser.id,
          role: sessionUser.role,
        };
        addClient(client);

        ws.send(JSON.stringify({ type: "connected", userId: sessionUser.id, role: sessionUser.role }));
      },

      onMessage: (evt, ws) => {
        if (!client) return;

        try {
          const data = JSON.parse(typeof evt.data === "string" ? evt.data : evt.data.toString()) as WsSyncMessage;

          switch (data.type) {
            case "subscribe": {
              if (!Array.isArray(data.keys)) break;
              const validKeys = data.keys.filter((key) => {
                if (client!.role === "ADMIN" || client!.role === "SUPER_ADMIN") {
                  return key.startsWith("admin:");
                }
                const userPrefix = `user:${client!.userId}:`;
                return key.startsWith(userPrefix) && /^(identity|requests|history|aspirations)$/.test(key.slice(userPrefix.length));
              });
              if (validKeys.length > 0) {
                subscribeClient(client!, validKeys);
                ws.send(JSON.stringify({ type: "subscribed", keys: validKeys }));
              }
              break;
            }
            case "unsubscribe": {
              if (!Array.isArray(data.keys)) break;
              unsubscribeClient(client!, data.keys);
              ws.send(JSON.stringify({ type: "unsubscribed", keys: data.keys }));
              break;
            }
            case "ping": {
              ws.send(JSON.stringify({ type: "pong" }));
              break;
            }
          }
        } catch {
          // ignore malformed messages
        }
      },

      onClose: () => {
        if (client) {
          removeClient(client);
        }
      },

      onError: () => {
        if (client) {
          removeClient(client);
        }
      },
    };
  });
}
