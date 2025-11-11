import { io } from "socket.io-client";

// Configuração do socket.io client com o endereço do servidor
const socket = io(
  "wss://aqua-sheriff-continues-secretariat.trycloudflare.com",
  {
    transports: ["websocket"],
  }
);

export { socket };
