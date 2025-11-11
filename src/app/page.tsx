"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { onEnterPress } from "@/utils/submitInputWithEnter";
import { useRouter } from "next/navigation";
import { useState } from "react";

const Home = () => {
  const router = useRouter();

  const [name, setName] = useState("");

  const handleJoinChat = () => {
    console.log(`Joining chat as: ${name}`);
    localStorage.setItem("username", name.trim());
    router.push("/socket");
  };

  console.log("Hello world");

  return (
    <Card className="relative mx-auto max-w-3xl h-screen flex flex-col justify-center items-center">
      <CardTitle className="text-2xl font-bold p-4">
        Welcome to the Chat App!
      </CardTitle>
      <CardContent className="flex flex-col items-center gap-4">
        <Input
          placeholder="What is your name?"
          className="mr-2"
          value={name}
          onKeyDown={onEnterPress(handleJoinChat)}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          className="w-24"
          onClick={handleJoinChat}
          disabled={name.trim() === ""}
        >
          Join Chat
        </Button>
      </CardContent>
    </Card>
  );
};

export default Home;
