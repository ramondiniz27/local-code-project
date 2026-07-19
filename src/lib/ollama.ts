import { invoke } from "@tauri-apps/api/core";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface OllamaModel {
  name: string;
  size: number;
}

export async function testConnection(url: string): Promise<void> {
  await invoke("ollama_test_connection", { url });
}

export async function listModels(url: string): Promise<OllamaModel[]> {
  return invoke<OllamaModel[]>("ollama_list_models", { url });
}

export async function selectModel(url: string, model: string): Promise<void> {
  await invoke("ollama_select_model", { url, model });
}

export async function streamChat(
  messages: ChatMessage[],
  onChunk: (content: string) => void,
): Promise<void> {
  let unlistenChunk: UnlistenFn | undefined;
  let unlistenDone: UnlistenFn | undefined;

  try {
    await new Promise<void>((resolve, reject) => {
      Promise.all([
        listen<string>("ollama-chunk", (event) => onChunk(event.payload)),
        listen<void>("ollama-done", () => resolve()),
      ])
        .then(([chunkFn, doneFn]) => {
          unlistenChunk = chunkFn;
          unlistenDone = doneFn;
          return invoke("ollama_chat", { messages });
        })
        .catch(reject);
    });
  } finally {
    unlistenChunk?.();
    unlistenDone?.();
  }
}
