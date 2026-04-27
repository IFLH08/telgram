import { UIMessage } from "ai";

interface ChatMessageListProps {
  messages: UIMessage[];
  isLoading: boolean;
}

function getMessageText(message: UIMessage) {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function ChatMessageList({
  messages,
  isLoading,
}: ChatMessageListProps) {
  return (
    <main className="flex-1 overflow-y-auto py-4 space-y-4">
      {messages.length === 0 ? (
        <div className="text-center text-gray-400 mt-10">
          Hola, Tequi. Soy tu asistente local. En que puedo ayudarte hoy?
        </div>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-lg max-w-[80%] shadow-sm ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 border"
              }`}
            >
              <span className="font-bold block text-xs mb-1 opacity-75">
                {message.role === "user" ? "Tu" : "Gemma 3"}
              </span>
              {getMessageText(message)}
            </div>
          </div>
        ))
      )}

      {isLoading ? (
        <div className="text-left text-gray-400 text-sm italic">
          Gemma esta pensando...
        </div>
      ) : null}
    </main>
  );
}
