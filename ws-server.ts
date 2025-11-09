import { WebSocketServer, WebSocket, Data } from "ws";

const PORT = 8080;

interface Client extends WebSocket {
  id: string;
}

const messages: string[] = [];

const wss = new WebSocketServer({ port: PORT });

wss.on("connection", (ws: Client) => {
  ws.id = Date.now().toString();
  console.log(`New client connected: ${ws.id}`);

  messages.forEach((msg) => {
    ws.send(msg);
  });

  ws.on("message", (message: Data) => {
    const msg = message.toString();
    console.log(`Received message from ${ws.id}: ${msg}`);

    messages.push(msg);

    wss.clients.forEach((client: WebSocket) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ msg, id: ws.id }));
      }
    });
  });

  ws.on("close", () => {
    console.log(`Client disconnected: ${ws.id}`);
  });
});

console.log(`WebSocket server is running on ws://localhost:${PORT}`);
