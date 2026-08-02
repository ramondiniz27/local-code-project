import { FolderGit2 } from "lucide-react";

export function CodeEmptyState() {
  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-5 bg-[#141426] px-8 text-center select-none">
      {/* Icon with subtle glow */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#3b82f6]/10 blur-xl" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[#2d2d48] bg-[#20203a]">
          <FolderGit2 className="h-7 w-7 text-[#3b82f6]/70" />
        </div>
      </div>

      {/* Title */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-white/80">
          Nenhum projeto conectado
        </h2>
        <p className="max-w-[280px] text-xs leading-relaxed text-[#6b7280]">
          Use o modo{" "}
          <span className="font-medium text-[#60a5fa]">Cowork</span> para
          iniciar uma sessão de desenvolvimento com o agente
        </p>
      </div>
    </div>
  );
}
