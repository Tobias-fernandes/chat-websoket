"use client";

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
import { useEffect, useState } from "react";

const Home = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:8080");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWs(websocket);

    websocket.onmessage = (event) => {
      console.log(event);
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    return () => {
      websocket.close();
    };
  }, []);

  const handleSendMessage = () => {
    if (ws && inputValue.trim() !== "") {
      ws.send(inputValue);
      setInputValue("");
    }
  };

  return (
    <Card className="relative mx-auto max-w-3xl h-screen">
      <CardHeader>
        <CardTitle>Web chat app!</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <ul>
          {messages.map((data, index) => {
            const { id, msg } = JSON.parse(data);
            return (
              <Card key={index} className="text-2xl font-bold mb-4 p-4">
                {msg} (from {id})
              </Card>
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
        />
        <Button className="w-24" onClick={handleSendMessage}>
          Send
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Home;
