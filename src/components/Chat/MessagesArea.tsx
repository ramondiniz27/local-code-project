import { UserMessage } from "./UserMessage";
import { AIMessage } from "./AIMessage";
import type { ChatMessage } from "../../lib/ollama";

interface MessagesAreaProps {
  messages: ChatMessage[];
  error: string | null;
}

export function MessagesArea({ messages, error }: MessagesAreaProps) {
  if (messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-12 py-6">
        <p className="text-sm text-text-muted">
          Não existem mensagens a serem exibidas
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-12 py-6">
      {messages.map((message, index) =>
        message.role === "user" ? (
          <UserMessage key={index} text={message.content} />
        ) : (
          <AIMessage key={index} content={message.content} />
        ),
      )}
      {error && <p className="text-sm text-red-500">Erro: {error}</p>}
    </div>
  );
}
