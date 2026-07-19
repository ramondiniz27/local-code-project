import type { ChatMessage } from "./ollama";

export interface StoredChat {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  model: string;
  messages: ChatMessage[];
}

const STORAGE_KEY = "oc.chats";
const TITLE_MAX_LENGTH = 40;

export const MAX_VISIBLE_CHATS = 10;

export function loadChats(): StoredChat[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function persistChats(chats: StoredChat[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}

export function deriveTitle(firstMessage: string): string {
  const trimmed = firstMessage.trim();
  if (trimmed.length <= TITLE_MAX_LENGTH) return trimmed;
  return `${trimmed.slice(0, TITLE_MAX_LENGTH)}…`;
}
