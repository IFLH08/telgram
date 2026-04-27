"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { ChangeEvent, FormEvent, useState } from "react";
import { ChatMessageList } from "@/components/chatF/ChatMessageList";
import { ChatInput } from "@/components/chatF/ChatInput";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput || isLoading) {
      return;
    }

    void sendMessage({ text: trimmedInput });
    setInput("");
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4 font-sans">
      <header className="py-4 text-center border-b">
        <h1 className="text-2xl font-bold text-blue-600">
          Asistente Oracle Cloud
        </h1>
        <p className="text-sm text-gray-500">
          Impulsado por Gemma 3 local 100% privado
        </p>
      </header>

      <ChatMessageList messages={messages} isLoading={isLoading} />

      {error ? (
        <p className="pb-2 text-sm text-red-500">
          Ocurrio un error al procesar la solicitud. Intenta de nuevo.
        </p>
      ) : null}

      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
