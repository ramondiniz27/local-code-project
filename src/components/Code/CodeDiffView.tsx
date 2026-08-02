export interface DiffLine {
  id: string;
  num?: number | string;
  prefix: " " | "+" | "−";
  type: "normal" | "add" | "del";
  code: string;
}

interface CodeDiffViewProps {
  lines?: DiffLine[];
}

export function CodeDiffView({ lines = [] }: CodeDiffViewProps) {
  if (lines.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center py-8 text-[11px] italic text-[#4b5563]">
        Nenhum diff disponível
      </div>
    );
  }

  return (
    <div className="flex flex-col font-mono text-xs select-text overflow-x-auto py-1">
      {lines.map((line) => {
        let bgStyle = "";
        let prefixColor = "text-[#565b73]";
        let codeColor = "text-[#d4d4e0]";

        if (line.type === "add") {
          bgStyle = "bg-[#16301f]";
          prefixColor = "text-[#98c379]";
          codeColor = "text-[#b5e8a0]";
        } else if (line.type === "del") {
          bgStyle = "bg-[#34202a]";
          prefixColor = "text-[#e06c75]";
          codeColor = "text-[#e8949c]";
        }

        return (
          <div
            key={line.id}
            className={`flex items-center gap-3 px-3.5 py-0.5 leading-5 transition-colors ${bgStyle}`}
          >
            {/* Line Number */}
            <span className="w-6 shrink-0 text-right text-[11px] text-[#565b73]">
              {line.num}
            </span>

            {/* Prefix (+ / - / space) */}
            <span className={`w-3 shrink-0 font-bold ${prefixColor}`}>
              {line.prefix}
            </span>

            {/* Code Line */}
            <span className={`whitespace-pre ${codeColor}`}>
              {line.code}
            </span>
          </div>
        );
      })}
    </div>
  );
}
