import { MessageSquare } from "lucide-react";
import { formatRelativeTime } from "../../lib/time";
import type { StoredChat } from "../../lib/chatStorage";

interface ConversationListProps {
  chats: StoredChat[];
  activeChatId: string | null;
  onSelect: (id: string) => void;
  disabled: boolean;
}

export function ConversationList({
  chats,
  activeChatId,
  onSelect,
  disabled,
}: ConversationListProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {chats.map((chat) => {
        const active = chat.id === activeChatId;
        return (
          <button
            key={chat.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(chat.id)}
            className={`flex items-center gap-2.5 rounded-radius-sm px-3 py-2.5 text-left disabled:cursor-not-allowed ${
              active ? "bg-bg-hover" : ""
            }`}
          >
            <MessageSquare
              className={`h-[18px] w-[18px] shrink-0 ${
                active ? "text-accent-blue-light" : "text-text-muted"
              }`}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span
                className={`truncate text-[13px] ${
                  active ? "font-medium text-text-light" : "text-[#b0b0c8]"
                }`}
              >
                {chat.title}
              </span>
              <span className="text-[11px] text-text-muted">
                {formatRelativeTime(chat.updatedAt)}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
