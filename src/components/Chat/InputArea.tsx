import { ArrowUp, Mic, Paperclip } from "lucide-react";

export function InputArea() {
  return (
    <div className="flex flex-col gap-2 px-12 pb-6">
      <div className="flex items-center gap-3 rounded-radius-lg border border-border-light bg-bg-input px-4 py-3.5">
        <Paperclip className="h-5 w-5 text-text-muted" />
        <span className="min-w-0 flex-1 text-sm text-text-muted">
          Message Claude...
        </span>
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-text-muted" />
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-blue"
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4 text-text-light" />
          </button>
        </div>
      </div>
      <p className="text-center text-[11px] text-text-muted">
        Claude can make mistakes. Please double-check responses.
      </p>
    </div>
  );
}
