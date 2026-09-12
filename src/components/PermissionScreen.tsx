import { useState } from "react";
import { FolderOpen, AlertCircle } from "lucide-react";
import { selectDirectory, verifyPermission } from "../lib/filesystem";
import { useFilesystemStore } from "../store/filesystemStore";

export function PermissionScreen() {
  const [isSelecting, setIsSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setFsPermissionGranted, setWorkingDirectory } = useFilesystemStore();

  async function handleSelectDirectory() {
    setIsSelecting(true);
    setError(null);
    try {
      const dir = await selectDirectory();
      const ok = await verifyPermission(dir);
      if (!ok) {
        throw new Error("Acesso ao diretório negado pelo sistema operacional.");
      }
      setWorkingDirectory(dir);
      setFsPermissionGranted(true);
      // PermissionGate automaticamente renderiza o app principal ao atualizar o store
    } catch (err) {
      setError(String(err));
    } finally {
      setIsSelecting(false);
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[#1a1a2e]">
      <div className="flex w-[480px] flex-col gap-8 rounded-[16px] bg-white p-[48px_40px] shadow-[0px_8px_32px_0px_#0000000d]">
        {/* Logo */}
        <div className="flex justify-center items-center">
          <span className="text-[36px] font-extrabold leading-none text-[#3b82f6]">
            LOCAL
          </span>
          <span className="text-[36px] font-extrabold leading-none text-[#6b7280]">
            CODE
          </span>
        </div>

        {/* Icon + Title */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eff6ff]">
            <FolderOpen size={28} className="text-[#3b82f6]" />
          </div>
          <h2 className="text-[18px] font-semibold text-[#1f2937]">
            Acesso ao sistema de arquivos
          </h2>
          <p className="text-center text-[14px] text-[#6b7280]">
            Selecione a pasta de trabalho para que o assistente possa ler,
            escrever e executar scripts no seu projeto.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-[13px] text-red-600">{error}</p>
          </div>
        )}

        {/* Select button */}
        <button
          onClick={handleSelectDirectory}
          disabled={isSelecting}
          className="flex h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-[8px] bg-[#3b82f6] text-[14px] font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FolderOpen size={16} />
          {isSelecting ? "Selecionando..." : "Selecionar pasta de trabalho"}
        </button>
      </div>
    </div>
  );
}
