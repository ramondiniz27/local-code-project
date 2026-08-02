import { MessageSquare, Trash2 } from "lucide-react";
import { formatRelativeTime } from "../../lib/time";
import type { StoredChat } from "../../lib/chatStorage";

interface ConversationListProps {
  chats: StoredChat[];
  activeChatId: string | null;
  onSelect: (id: string) => void;
  onDelete?: (id: string) => void;
  disabled: boolean;
}

export function ConversationList({
  chats,
  activeChatId,
  onSelect,
  onDelete,
  disabled,
}: ConversationListProps) {
  return (
    <div className="flex flex-col gap-0.5">
      {chats.map((chat) => {
        const active = chat.id === activeChatId;
        return (
          <div
            key={chat.id}
            role="button"
            tabIndex={0}
            onClick={() => !disabled && onSelect(chat.id)}
            onKeyDown={(e) => e.key === "Enter" && !disabled && onSelect(chat.id)}
            className={`group relative flex items-center gap-2.5 rounded-radius-sm px-3 py-2.5 text-left cursor-pointer transition-colors ${
              disabled ? "cursor-not-allowed opacity-70" : ""
            } ${active ? "bg-bg-hover" : "hover:bg-bg-hover/60"}`}
          >
            <MessageSquare
              className={`h-[18px] w-[18px] shrink-0 ${
                active ? "text-accent-blue-light" : "text-text-muted"
              }`}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 pr-1">
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
            {onDelete && (
              <button
                type="button"
                disabled={disabled}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(chat.id);
                }}
                title="Excluir conversa"
                className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all shrink-0 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
