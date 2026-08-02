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
import { useSettingsStore } from "../store/settingsStore";

export function useChats(url: string) {
  const [chats, setChats] = useState<StoredChat[]>(() => loadChats());
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const lastKnownModels = useSettingsStore((s) => s.lastKnownModels);
  const setLastKnownModels = useSettingsStore((s) => s.setLastKnownModels);
  const modelPreferences = useSettingsStore((s) => s.modelPreferences);

  const [rawModels, setRawModels] = useState<OllamaModel[]>(() => lastKnownModels);
  const [draftModel, setDraftModel] = useState<string>(() => {
    const visible = lastKnownModels.filter(
      (m) => modelPreferences[m.name] ?? true,
    );
    return visible[0]?.name ?? "";
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamingChatIdRef = useRef<string | null>(null);

  const models = useMemo(
    () => rawModels.filter((model) => modelPreferences[model.name] ?? true),
    [rawModels, modelPreferences],
  );

  const refreshModels = useCallback(async () => {
    try {
      const list = await listModels(url);
      setRawModels(list);
      setLastKnownModels(list);
      const visible = list.filter(
        (model) => modelPreferences[model.name] ?? true,
      );
      const initial = visible[0]?.name ?? "";

      setDraftModel((prev) => {
        if (prev && visible.some((m) => m.name === prev)) {
          return prev;
        }
        return initial;
      });

      if (initial) {
        selectModel(url, initial).catch((err) => setError(String(err)));
      }
    } catch (err) {
      setError(String(err));
    }
  }, [url, modelPreferences, setLastKnownModels]);

  useEffect(() => {
    const initialModel = draftModel || rawModels[0]?.name;
    if (url && initialModel) {
      selectModel(url, initialModel).catch(() => {});
    }
    refreshModels();

    const timer = setInterval(() => {
      refreshModels();
    }, 5000);

    return () => clearInterval(timer);
  }, [url, refreshModels]);

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

  const pendingChunkBufferRef = useRef<string>("");
  const rafIdRef = useRef<number | null>(null);

  const flushChunkBuffer = useCallback(() => {
    const chunkToAppend = pendingChunkBufferRef.current;
    if (!chunkToAppend) return;
    pendingChunkBufferRef.current = "";

    const id = streamingChatIdRef.current;
    if (id === null) return;

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== id) return chat;
        const messages = [...chat.messages];
        const lastIndex = messages.length - 1;
        messages[lastIndex] = {
          ...messages[lastIndex],
          content: messages[lastIndex].content + chunkToAppend,
        };
        return { ...chat, messages };
      }),
    );
  }, []);

  const scheduleFlush = useCallback(() => {
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        flushChunkBuffer();
      });
    }
  }, [flushChunkBuffer]);

  const startNewChat = useCallback(() => {
    if (isStreaming) return;
    setActiveChatId(null);
    refreshModels().catch(() => {});
  }, [isStreaming, refreshModels]);

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
      pendingChunkBufferRef.current = "";

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
          pendingChunkBufferRef.current += chunk;
          scheduleFlush();
        });
      } catch (err) {
        setError(String(err));
      } finally {
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        flushChunkBuffer();
        setIsStreaming(false);
        streamingChatIdRef.current = null;
        setChats((prev) => {
          persistChats(prev);
          return prev;
        });
      }
    },
    [activeChatId, chats, draftModel, flushChunkBuffer, isStreaming, scheduleFlush, selectedModel],
  );

  const deleteChat = useCallback(
    (id: string) => {
      if (isStreaming) return;
      setChats((prev) => {
        const next = prev.filter((chat) => chat.id !== id);
        persistChats(next);
        return next;
      });
      if (activeChatId === id) {
        setActiveChatId(null);
      }
    },
    [activeChatId, isStreaming],
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
    deleteChat,
    setSelectedModel,
    sendMessage,
  };
}
