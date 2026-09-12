import { Pause, Play, Square, Settings, Folder, Sparkles, ChevronDown, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCoworkStore } from "@/store/coworkStore";
import { CoworkModelDropdown } from "./CoworkModelDropdown";
import { invoke } from "@tauri-apps/api/core";
import { useSettingsStore } from "@/store/settingsStore";

export function CoworkHeaderPen() {
  const setIsSettingsOpen = useSettingsStore((s) => s.setIsSettingsOpen);
  const {
    sessionTitle,
    sessionStatus,
    workingDir,
    selectedModel,
    isModelDropdownOpen,
    setWorkingDir,
    pauseProcess,
    resumeProcess,
    startProcess,
    finishTask,
    resetSession,
    setModelDropdownOpen,
    setStopModalOpen,
  } = useCoworkStore();

  const handleSelectDirectory = async () => {
    try {
      const selected = await invoke<string>("fs_select_directory");
      if (selected) {
        setWorkingDir(selected);
      }
    } catch {
      // User cancelled dialog or error occurred
    }
  };

  const handleTogglePause = () => {
    if (sessionStatus === "running") {
      pauseProcess();
    } else if (sessionStatus === "paused") {
      resumeProcess();
    }
  };

  const handleToggleStop = () => {
    if (sessionStatus === "stopped" || sessionStatus === "idle") {
      startProcess();
    } else {
      setStopModalOpen(true);
    }
  };

  const getStatusBadge = () => {
    switch (sessionStatus) {
      case "running":
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-accent-blue border-0"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent-blue animate-ping"></span>
            Em execução
          </Badge>
        );
      case "paused":
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600 border-0"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            Pausado
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 border-0"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Concluído
          </Badge>
        );
      case "stopped":
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 border-0"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
            Parado
          </Badge>
        );
      default:
        return (
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 border-0"
          >
            Aguardando
          </Badge>
        );
    }
  };

  const isInactive = sessionStatus === "stopped" || sessionStatus === "idle" || sessionStatus === "completed";
  const isPaused = sessionStatus === "paused";
  const isActiveSession = sessionStatus === "running" || sessionStatus === "paused";

  return (
    <header className="relative flex h-16 w-full shrink-0 items-center justify-between border-b border-border-light bg-bg-input px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-text-primary truncate max-w-md" title={sessionTitle || "Sessão de Cowork"}>
          {sessionTitle || "Nova sessão de cowork"}
        </h1>

        {getStatusBadge()}

        <button
          onClick={handleSelectDirectory}
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-bg-main/60 px-2.5 py-1 text-xs text-text-secondary border border-black/5 hover:bg-bg-main transition-colors cursor-pointer"
          title="Clique para alterar diretório de trabalho"
        >
          <Folder className="h-3.5 w-3.5 text-text-secondary" />
          <span className="font-mono text-[11px] truncate max-w-[200px]">
            {workingDir || "Selecionar pasta do projeto..."}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        {/* Seletor de Modelo */}
        <button
          onClick={() => setModelDropdownOpen(!isModelDropdownOpen)}
          type="button"
          className="flex items-center gap-2 rounded-lg bg-bg-main px-3 py-1.5 text-xs font-semibold text-text-primary border border-accent-blue hover:bg-black/5 transition-colors cursor-pointer"
          title="Selecionar modelo de IA para o Cowork"
        >
          <Sparkles className="h-3.5 w-3.5 text-accent-blue" />
          <span className="truncate max-w-[140px]">{selectedModel}</span>
          <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
        </button>

        {/* Botão Nova Tarefa / Encerrar (Exibido quando existe uma sessão iniciada) */}
        {sessionTitle && (
          <Button
            onClick={resetSession}
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold border-border-light text-text-primary hover:bg-black/5 cursor-pointer"
            title="Encerrar tarefa atual e limpar a tela para uma nova tarefa"
          >
            <Plus className="h-3.5 w-3.5 text-accent-blue" />
            Nova tarefa
          </Button>
        )}

        {/* Botão Finalizar Tarefa (Exibido quando a sessão está ativa/executando ou pausada) */}
        {isActiveSession && (
          <Button
            onClick={finishTask}
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
            title="Marcar tarefa ativa como finalizada"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Finalizar tarefa
          </Button>
        )}

        {/* Botão Pausar / Continuar */}
        <Button
          onClick={handleTogglePause}
          variant="outline"
          size="sm"
          disabled={isInactive}
          className={`h-8 gap-1.5 text-xs font-semibold border-border-light cursor-pointer ${
            isPaused
              ? "text-accent-blue hover:bg-blue-50 border-accent-blue/40"
              : "hover:bg-black/5 text-text-primary"
          }`}
        >
          {isPaused ? (
            <>
              <Play className="h-3.5 w-3.5 text-accent-blue fill-accent-blue" />
              Continuar
            </>
          ) : (
            <>
              <Pause className="h-3.5 w-3.5 text-text-secondary" />
              Pausar
            </>
          )}
        </Button>

        {/* Botão Parar / Iniciar */}
        <Button
          onClick={handleToggleStop}
          variant="outline"
          size="sm"
          className={`h-8 gap-1.5 text-xs font-semibold border-border-light cursor-pointer ${
            isInactive
              ? "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border-emerald-500/30"
              : "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
          }`}
        >
          {isInactive ? (
            <>
              <Play className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" />
              Iniciar
            </>
          ) : (
            <>
              <Square className="h-3.5 w-3.5 text-rose-600 fill-rose-600" />
              Parar
            </>
          )}
        </Button>

        <Button onClick={() => setIsSettingsOpen(true)} variant="ghost" size="icon-sm" className="h-8 w-8 text-text-secondary hover:text-text-primary cursor-pointer">
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <CoworkModelDropdown />
    </header>
  );
}
