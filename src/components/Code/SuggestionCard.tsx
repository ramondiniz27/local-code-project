import { Sparkles } from "lucide-react";

interface SuggestionCardProps {
  title?: string;
  text?: string;
  onApply?: () => void;
  onDismiss?: () => void;
}

export function SuggestionCard({ title, text, onApply, onDismiss }: SuggestionCardProps) {
  // Don't render when there is no suggestion content
  if (!title || !text) return null;

  return (
    <div className="w-full px-3.5 pt-3 pb-1">
      <div className="flex flex-col gap-2.5 rounded-lg border border-[#2d2d4c] bg-[#20203a] p-3.5 shadow-sm">
        {/* Top Header */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[#60a5fa]" />
          <span className="text-xs font-semibold text-white">
            {title}
          </span>
        </div>

        {/* Suggestion Text */}
        <p className="text-xs leading-relaxed text-[#b8bdd0]">
          {text}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onApply}
            className="rounded-md bg-[#3b82f6] px-3.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#2563eb] active:scale-95"
          >
            Aplicar
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-md border border-[#374151] px-3.5 py-1.5 text-xs font-medium text-[#9ca3af] transition-colors hover:bg-[#282844] hover:text-white"
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  );
}
