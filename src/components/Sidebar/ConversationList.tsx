import { MessageSquare } from "lucide-react";
import { conversations } from "../../data/mockData";

export function ConversationList() {
  return (
    <div className="flex flex-col gap-0.5">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          className={`flex items-center gap-2.5 rounded-radius-sm px-3 py-2.5 ${
            conversation.active ? "bg-bg-hover" : ""
          }`}
        >
          <MessageSquare
            className={`h-[18px] w-[18px] shrink-0 ${
              conversation.active ? "text-accent-blue-light" : "text-text-muted"
            }`}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span
              className={`truncate text-[13px] ${
                conversation.active
                  ? "font-medium text-text-light"
                  : "text-[#b0b0c8]"
              }`}
            >
              {conversation.title}
            </span>
            <span className="text-[11px] text-text-muted">
              {conversation.time}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
