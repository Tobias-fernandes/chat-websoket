/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useCallback } from "react";
import { socket } from "../../socket";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useChatScroll } from "@/utils/useChatScroll";
import { getOrCreateUserId } from "@/utils/getUserID";
import { onEnterPress } from "@/utils/submitInputWithEnter";

// interface para a estrutura da mensagem
interface Message {
  msg: string;
  name: string;
  id: string;
}

export default function ChatPage() {
  const router = useRouter();
  const userId = getOrCreateUserId();

  const [isConnected, setIsConnected] = useState(false); // estado de conexão
  const [transport, setTransport] = useState("N/A"); // transporte atual
  const [messages, setMessages] = useState<Message[]>([]); // mensagens do chat
  const [inputValue, setInputValue] = useState(""); // valor do input
  const [username, setUsername] = useState(""); // nome do usuário
  const [isLoading, setIsLoading] = useState(true); // estado de loading
  const [hasRequestedHistory, setHasRequestedHistory] = useState(false); // estado para monitorar se o histórico já foi solicitado

  /** Carrega o nome do usuário */
  const loadUserName = useCallback(() => {
    const storedName = localStorage.getItem("username");
    if (!storedName) return router.push("/");
    setUsername(storedName);
  }, [router]);

  /** Conectou no servidor */
  const handleConnect = useCallback(() => {
    setIsConnected(true);
    setTransport(socket.io.engine.transport.name);

    // Solicita o histórico de mensagens apenas uma vez
    if (!hasRequestedHistory) {
      // Pequeno delay para garantir que o socket esteja totalmente pronto antes de solicitar o histórico
      setTimeout(() => {
        socket.emit("getPreviousMessages");
      }, 200);
      setHasRequestedHistory(true);
    }

    // Monitora mudanças no transporte (ex: polling -> websocket)
    socket.io.engine.on("upgrade", (t) => {
      setTransport(t.name);
    });
  }, [hasRequestedHistory]);

  /** Desconectou */
  function handleDisconnect() {
    setIsConnected(false);
    setTransport("N/A");
  }

  /** Mensagem nova recebida */
  function handleMessage(data: Message) {
    setMessages((prev) => [...prev, data]);
  }

  /** Recebe histórico completo */
  function handlePreviousMessages(data: Message[]) {
    console.log("📜 Histórico recebido:", data);
    setMessages(data);
    setIsLoading(false);
  }

  /** Envia uma nova mensagem */
  function handleSendMessage() {
    if (!inputValue.trim() || !username) return;

    const messageData = { msg: inputValue, id: userId, name: username };
    socket.emit("message", messageData);

    setInputValue("");
  }

  /** Inicialização do socket */
  useEffect(() => {
    loadUserName();

    if (socket.connected) handleConnect();

    socket.once("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("message", handleMessage);
    socket.on("previousMessages", handlePreviousMessages);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("message", handleMessage);
      socket.off("previousMessages", handlePreviousMessages);
    };
  }, [loadUserName, handleConnect]);

  // Hook para rolar o chat automaticamente
  const chatContainerRef = useChatScroll<HTMLUListElement>([messages]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="w-12 h-12 text-primary" />
      </div>
    );
  }

  return (
    <Card className="relative mx-auto max-w-3xl h-screen">
      <CardHeader>
        <CardTitle>Web Chat App</CardTitle>
        <CardDescription>
          <p>Name: {username}</p>
          <p>Status: {isConnected ? "Connected" : "Disconnected"}</p>
          <p>Transport: {transport}</p>
        </CardDescription>
      </CardHeader>

      <CardContent>
        <ul
          id="chat-container"
          ref={chatContainerRef}
          className="overflow-auto bg-accent-foreground h-screen rounded-2xl flex flex-col gap-2 max-h-[75vh] px-4 py-6"
        >
          {!messages.length && (
            <li className="text-center text-gray-500">
              No messages yet. Start the conversation!
            </li>
          )}

          {messages.map((data, index) => {
            const { msg, name, id } = data;
            const isOwnMessage = id === userId;
            return (
              <li
                key={index}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl text-white ${
                    isOwnMessage
                      ? "bg-green-500 rounded-br-none"
                      : "bg-gray-600 rounded-bl-none"
                  }`}
                >
                  <span className="font-bold text-xs mr-2">
                    {isOwnMessage ? "You" : name}:
                  </span>
                  {msg}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>

      <CardFooter className="absolute bottom-0 left-0 right-0 flex mb-8">
        <Input
          placeholder="Type your message..."
          className="mr-2"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onEnterPress(handleSendMessage)}
        />
        <Button
          className="w-24"
          onClick={handleSendMessage}
          disabled={!isConnected || !inputValue.trim()}
        >
          Send
        </Button>
      </CardFooter>
    </Card>
  );
}
