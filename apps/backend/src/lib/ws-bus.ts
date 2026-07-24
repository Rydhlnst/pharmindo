import type { WebSocket } from "ws";

export type WsClient = {
  ws: WebSocket;
  keys: Set<string>;
  userId: string;
  role: string;
};

const clients = new Set<WsClient>();

export function addClient(client: WsClient) {
  clients.add(client);
}

export function removeClient(client: WsClient) {
  clients.delete(client);
}

export function subscribeClient(client: WsClient, keys: string[]) {
  for (const key of keys) {
    client.keys.add(key);
  }
}

export function unsubscribeClient(client: WsClient, keys: string[]) {
  for (const key of keys) {
    client.keys.delete(key);
  }
}

export function broadcastToClients(changedKeys: string[], versions: Record<string, number>) {
  const message = JSON.stringify({ type: "sync", keys: changedKeys, versions });

  for (const client of clients) {
    if (client.ws.readyState !== 1) continue;

    let matches = false;
    for (const key of changedKeys) {
      if (client.keys.has(key)) {
        matches = true;
        break;
      }
    }

    if (matches) {
      try {
        client.ws.send(message);
      } catch {
        clients.delete(client);
      }
    }
  }
}

export function getClientCount() {
  return clients.size;
}
