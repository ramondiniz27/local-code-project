import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCoworkStore } from "@/store/coworkStore";

export function StopConfirmationModal() {
  const { isStopModalOpen, setStopModalOpen, resetSession } = useCoworkStore();

  if (!isStopModalOpen) return null;

  const handleConfirmReset = () => {
    resetSession();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="flex w-full max-w-md flex-col rounded-2xl border border-border-light bg-bg-input p-6 shadow-2xl overflow-hidden gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-primary">
                Cancelar e Limpar Sessão
              </h2>
              <p className="text-xs text-text-muted mt-0.5">
                Deseja parar o processo do Cowork?
              </p>
            </div>
          </div>
          <Button
            onClick={() => setStopModalOpen(false)}
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 text-text-secondary hover:text-text-primary cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <p className="text-xs text-text-secondary leading-relaxed bg-bg-main/60 rounded-xl p-3.5 border border-black/5">
          Tem certeza de que deseja parar o processo atual? Isso irá cancelar a execução e limpar os dados da tela para disponibilizar o Cowork para uma nova tarefa.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <Button
            onClick={() => setStopModalOpen(false)}
            variant="outline"
            size="sm"
            className="h-8 px-4 text-xs font-semibold rounded-lg border-border-light text-text-secondary hover:bg-black/5 cursor-pointer"
          >
            Continuar Sessão
          </Button>
          <Button
            onClick={handleConfirmReset}
            size="sm"
            className="h-8 px-4 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-xs"
          >
            Sim, Parar e Limpar
          </Button>
        </div>
      </div>
    </div>
  );
}
