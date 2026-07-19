import { useState, type KeyboardEvent } from "react";
import { ArrowUp, Mic, Paperclip } from "lucide-react";

interface InputAreaProps {
  onSend: (text: string) => void;
  disabled: boolean;
}

export function InputArea({ onSend, disabled }: InputAreaProps) {
  const [value, setValue] = useState("");

  function handleSend() {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col gap-2 px-12 pb-6">
      <div className="flex items-center gap-3 rounded-radius-lg border border-border-light bg-bg-input px-4 py-3.5">
        <Paperclip className="h-5 w-5 text-text-muted" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message..."
          className="min-w-0 flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
        />
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-text-muted" />
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || !value.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue disabled:opacity-50"
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4 text-text-light" />
          </button>
        </div>
      </div>
      <p className="text-center text-[11px] text-text-muted">
        Modelos locais também podem cometer erros. Confira as respostas.
      </p>
    </div>
  );
}
