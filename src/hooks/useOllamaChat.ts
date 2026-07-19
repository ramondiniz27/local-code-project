import { useCallback, useEffect, useRef, useState } from "react";
import {
  listModels,
  selectModel,
  streamChat,
  type ChatMessage,
  type OllamaModel,
} from "../lib/ollama";

export function useOllamaChat(url: string) {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [selectedModel, setSelectedModelState] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamingIndexRef = useRef<number | null>(null);

  useEffect(() => {
    listModels(url)
      .then((list) => {
        setModels(list);
        const initial = list[0]?.name ?? "";
        if (initial) {
          setSelectedModelState(initial);
          selectModel(url, initial).catch((err) => setError(String(err)));
        }
      })
      .catch((err) => setError(String(err)));
  }, [url]);

  const setSelectedModel = useCallback(
    (model: string) => {
      setSelectedModelState(model);
      selectModel(url, model).catch((err) => setError(String(err)));
    },
    [url],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming || !selectedModel) return;

      setError(null);
      const history = [...messages, { role: "user", content } as ChatMessage];
      streamingIndexRef.current = history.length;
      setMessages([...history, { role: "assistant", content: "" }]);
      setIsStreaming(true);

      try {
        await streamChat(history, (chunk) => {
          const index = streamingIndexRef.current;
          if (index === null) return;
          setMessages((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], content: next[index].content + chunk };
            return next;
          });
        });
      } catch (err) {
        setError(String(err));
      } finally {
        setIsStreaming(false);
        streamingIndexRef.current = null;
      }
    },
    [messages, selectedModel, isStreaming],
  );

  return {
    models,
    selectedModel,
    setSelectedModel,
    messages,
    isStreaming,
    error,
    sendMessage,
  };
}
