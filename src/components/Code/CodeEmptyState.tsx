import { FolderGit2, FolderOpen } from "lucide-react";

interface CodeEmptyStateProps {
  onOpenProject?: () => void;
}

export function CodeEmptyState({ onOpenProject }: CodeEmptyStateProps) {
  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-5 bg-[#141426] px-8 text-center select-none">
      {/* Icon with subtle glow */}
      <div className="relative flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-[#3b82f6]/10 blur-xl" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[#2d2d48] bg-[#20203a]">
          <FolderGit2 className="h-7 w-7 text-[#3b82f6]" />
        </div>
      </div>

      {/* Title & Description */}
      <div className="flex flex-col gap-2 items-center">
        <h2 className="text-sm font-semibold text-white/90">
          Nenhum projeto conectado
        </h2>
        <p className="max-w-[320px] text-xs leading-relaxed text-[#6b7280]">
          Abra uma pasta de código local para navegar, editar e carregar o contexto dos arquivos nas solicitações ao modelo
        </p>
      </div>

      {/* Action Button */}
      {onOpenProject && (
        <button
          type="button"
          onClick={onOpenProject}
          className="flex items-center gap-2 rounded-lg bg-[#3b82f6] px-4 py-2 text-xs font-semibold text-white shadow-md transition-colors hover:bg-[#2563eb] active:scale-95 cursor-pointer"
        >
          <FolderOpen className="h-4 w-4" />
          <span>Abrir Pasta do Projeto...</span>
        </button>
      )}
    </div>
  );
}
