import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "http://3.88.37.132";
const port = 4001;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

interface Message {
  msg: string;
  name: string;
  id: string;
}

// 🔹 Armazenamento em memória (você pode salvar no banco depois)
const messages: Message[] = [
  {
    msg: "Welcome to the chat!",
    name: "Server",
    id: "server-id",
  },
];

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer, {
    cors: {
      origin: ["*"],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ New client connected: ${socket.id}`);

    // 🔹 Cliente pede histórico explicitamente
    socket.on("getPreviousMessages", () => {
      console.log(`📜 Sending history to ${socket.id}`);
      socket.emit("previousMessages", messages);
    });

    // 🔹 Nova mensagem recebida
    socket.on("message", (data: Message) => {
      console.log(`💬 ${data.name}: ${data.msg}`);

      messages.push(data); // salva no histórico
      io.emit("message", data); // envia pra todos os clientes
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Server ready at http://${hostname}:${port}`);
  });
});
