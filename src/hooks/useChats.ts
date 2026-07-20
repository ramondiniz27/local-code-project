import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  listModels,
  selectModel,
  streamChat,
  type ChatMessage,
  type OllamaModel,
} from "../lib/ollama";
import {
  loadChats,
  persistChats,
  deriveTitle,
  MAX_VISIBLE_CHATS,
  type StoredChat,
} from "../lib/chatStorage";

export function useChats(url: string) {
  const [chats, setChats] = useState<StoredChat[]>(() => loadChats());
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [draftModel, setDraftModel] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamingChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    listModels(url)
      .then((list) => {
        setModels(list);
        const initial = list[0]?.name ?? "";
        if (initial) {
          setDraftModel(initial);
          selectModel(url, initial).catch((err) => setError(String(err)));
        }
      })
      .catch((err) => setError(String(err)));
  }, [url]);

  const visibleChats = useMemo(
    () => [...chats].sort((a, b) => b.updatedAt - a.updatedAt).slice(0, MAX_VISIBLE_CHATS),
    [chats],
  );

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? null,
    [chats, activeChatId],
  );

  const messages = activeChat?.messages ?? [];
  const selectedModel = activeChat?.model ?? draftModel;

  const startNewChat = useCallback(() => {
    if (isStreaming) return;
    setActiveChatId(null);
  }, [isStreaming]);

  const selectChat = useCallback(
    (id: string) => {
      if (isStreaming) return;
      setActiveChatId(id);
    },
    [isStreaming],
  );

  const setSelectedModel = useCallback(
    (model: string) => {
      if (activeChatId === null) {
        setDraftModel(model);
      } else {
        setChats((prev) => {
          const next = prev.map((chat) =>
            chat.id === activeChatId ? { ...chat, model } : chat,
          );
          persistChats(next);
          return next;
        });
      }
      selectModel(url, model).catch((err) => setError(String(err)));
    },
    [url, activeChatId],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming || !selectedModel) return;

      setError(null);

      let chatId = activeChatId;
      let historyForApi: ChatMessage[];

      if (chatId === null) {
        const now = Date.now();
        const newChat: StoredChat = {
          id: crypto.randomUUID(),
          title: deriveTitle(trimmed),
          createdAt: now,
          updatedAt: now,
          model: draftModel,
          messages: [{ role: "user", content: trimmed }],
        };
        chatId = newChat.id;
        historyForApi = newChat.messages;
        setChats((prev) => {
          const next = [newChat, ...prev];
          persistChats(next);
          return next;
        });
        setActiveChatId(chatId);
      } else {
        const targetId = chatId;
        setChats((prev) => {
          const next = prev.map((chat) =>
            chat.id === targetId
              ? {
                  ...chat,
                  messages: [...chat.messages, { role: "user" as const, content: trimmed }],
                  updatedAt: Date.now(),
                }
              : chat,
          );
          persistChats(next);
          return next;
        });
        const current = chats.find((chat) => chat.id === targetId);
        historyForApi = [...(current?.messages ?? []), { role: "user", content: trimmed }];
      }

      const targetId = chatId;
      streamingChatIdRef.current = targetId;
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === targetId
            ? { ...chat, messages: [...chat.messages, { role: "assistant", content: "" }] }
            : chat,
        ),
      );
      setIsStreaming(true);

      try {
        await streamChat(historyForApi, (chunk) => {
          const id = streamingChatIdRef.current;
          if (id === null) return;
          setChats((prev) =>
            prev.map((chat) => {
              if (chat.id !== id) return chat;
              const messages = [...chat.messages];
              const lastIndex = messages.length - 1;
              messages[lastIndex] = {
                ...messages[lastIndex],
                content: messages[lastIndex].content + chunk,
              };
              return { ...chat, messages };
            }),
          );
        });
      } catch (err) {
        setError(String(err));
      } finally {
        setIsStreaming(false);
        streamingChatIdRef.current = null;
        setChats((prev) => {
          persistChats(prev);
          return prev;
        });
      }
    },
    [activeChatId, chats, draftModel, isStreaming, selectedModel],
  );

  return {
    chats: visibleChats,
    activeChatId,
    messages,
    models,
    selectedModel,
    isStreaming,
    error,
    startNewChat,
    selectChat,
    setSelectedModel,
    sendMessage,
  };
}
