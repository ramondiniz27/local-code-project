import { Check } from "lucide-react";
import { models } from "../../data/mockData";

export function ModelDropdown() {
  return (
    <div className="absolute left-4 top-14 z-10 flex w-[260px] flex-col gap-0.5 rounded-[10px] border border-border-light bg-bg-input p-1.5 shadow-[0_4px_16px_rgba(0,0,0,0.1)]">
      {models.map((model) => (
        <div
          key={model.id}
          className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 ${
            model.selected ? "bg-[#f0f4ff]" : "bg-transparent"
          }`}
        >
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span
              className={`text-[13px] ${
                model.selected ? "font-semibold text-accent-blue" : "text-text-primary"
              }`}
            >
              {model.name}
            </span>
            <span className="text-[11px] text-text-muted">
              {model.description}
            </span>
          </div>
          {model.selected && (
            <>
              <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold bg-[#eff6ff] text-accent-blue">
                Latest
              </span>
              <Check className="h-4 w-4 text-accent-blue" />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
