import { useState } from "react";
import {
  CheckCircle2,
  Loader2,
  Circle,
  FileSearch,
  FilePen,
  FilePlus,
  ShieldAlert,
  ArrowUp,
  Terminal as TerminalIcon,
  XCircle,
  PauseCircle,
  RotateCcw,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCoworkStore } from "@/store/coworkStore";

function cleanStepLabel(label: string): string {
  return label
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\*(.*?)\*/g, "$1");
}

export function CoworkFeed() {
  const [inputText, setInputText] = useState("");
  const {
    sessionTitle,
    sessionStatus,
    planSteps,
    activities,
    terminalExecutions,
    pendingPermission,
    submitTaskPrompt,
    approvePermission,
    denyPermission,
    finishTask,
    resetSession,
  } = useCoworkStore();

  const completedStepsCount = planSteps.filter((s) => s.status === "completed").length;
  const totalStepsCount = planSteps.length;

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText("");
    await submitTaskPrompt(text);
  };

  const getActivityIcon = (kind: string) => {
    switch (kind) {
      case "read":
        return <FileSearch className="h-[15px] w-[15px] text-text-secondary shrink-0" />;
      case "write":
        return <FilePen className="h-[15px] w-[15px] text-text-secondary shrink-0" />;
      case "create":
        return <FilePlus className="h-[15px] w-[15px] text-text-secondary shrink-0" />;
      default:
        return <TerminalIcon className="h-[15px] w-[15px] text-text-secondary shrink-0" />;
    }
  };

  const isPausedOrStopped = sessionStatus === "paused" || sessionStatus === "stopped";

  return (
    <div className="flex flex-1 flex-col gap-4">
      {/* Card Tarefa */}
      <div className="rounded-xl border border-border-light bg-bg-input p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="bg-transparent text-text-muted border-0 p-0 text-[10px] font-bold tracking-widest uppercase">
            TAREFA
          </Badge>
          <div className="flex items-center gap-2">
            {sessionTitle && (sessionStatus === "running" || sessionStatus === "paused") && (
              <>
                <Button
                  onClick={finishTask}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs font-semibold rounded-lg border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Finalizar tarefa
                </Button>
                <Button
                  onClick={resetSession}
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs font-semibold rounded-lg border-border-light text-text-secondary hover:bg-black/5 cursor-pointer gap-1.5"
                  title="Encerrar tarefa e limpar a tela"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-text-muted" />
                  Encerrar e limpar
                </Button>
              </>
            )}
            {sessionTitle && (sessionStatus === "completed" || sessionStatus === "stopped") && (
              <Button
                onClick={resetSession}
                size="sm"
                className="h-7 px-3 text-xs font-semibold rounded-lg bg-accent-blue text-white hover:bg-accent-blue/90 cursor-pointer gap-1.5 shadow-xs"
                title="Limpar a tela para realizar uma nova tarefa"
              >
                <Plus className="h-3.5 w-3.5 text-white" />
                Nova tarefa
              </Button>
            )}
            {sessionTitle && <span className="text-xs text-text-muted">Sessão Ativa</span>}
          </div>
        </div>
        <p className="text-sm font-normal text-text-primary leading-relaxed">
          {sessionTitle || "Digite uma orientação ou tarefa na barra de prompt abaixo para iniciar o agente em modo Cowork no seu projeto."}
        </p>
      </div>

      {/* Card Plano do Agente */}
      {planSteps.length > 0 && (
        <div className="rounded-xl border border-border-light bg-bg-input p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-border-light/60">
            <h2 className="text-sm font-semibold text-text-primary">Plano do agente</h2>
            <span className="text-xs text-text-muted">
              {completedStepsCount} de {totalStepsCount} etapas
            </span>
          </div>

          <div className="flex flex-col gap-1">
            {planSteps.map((step) => {
              const isInProgress = step.status === "in_progress";
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-2.5 text-xs p-1.5 rounded-md ${
                    isInProgress
                      ? isPausedOrStopped
                        ? "font-semibold text-amber-700 bg-amber-50"
                        : "font-semibold text-text-primary bg-[#eff6ff]"
                      : step.status === "completed"
                      ? "text-text-primary"
                      : "text-text-muted"
                  }`}
                >
                  {step.status === "completed" && (
                    <CheckCircle2 className="h-[15px] w-[15px] text-[#10b981] shrink-0" />
                  )}
                  {isInProgress && (
                    isPausedOrStopped ? (
                      <PauseCircle className="h-[15px] w-[15px] text-amber-600 shrink-0" />
                    ) : (
                      <Loader2 className="h-[15px] w-[15px] text-accent-blue animate-spin shrink-0" />
                    )
                  )}
                  {step.status === "pending" && (
                    <Circle className="h-[15px] w-[15px] text-[#d1d5db] shrink-0" />
                  )}
                  {step.status === "failed" && (
                    <XCircle className="h-[15px] w-[15px] text-rose-500 shrink-0" />
                  )}
                  <span>{cleanStepLabel(step.label)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stream de Atividades */}
      {activities.length > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-border-light bg-bg-input p-4 shadow-xs">
          {activities.map((act) => (
            <div key={act.id} className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2 text-text-secondary">
                {getActivityIcon(act.kind)}
                <span className="text-text-secondary">{act.description}</span>
              </div>
              <span className="text-xs text-text-muted">{act.timestamp}</span>
            </div>
          ))}
        </div>
      )}

      {/* Bloco Terminal */}
      {terminalExecutions.length > 0 && (
        <div className="rounded-xl bg-[#1a1a2e] p-3 text-white font-mono text-xs shadow-inner flex flex-col gap-1.5">
          {terminalExecutions.slice(0, 2).map((exec, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <TerminalIcon className="h-3.5 w-3.5 text-accent-blue-light" />
                  <span>{exec.command}</span>
                </div>
                <span className="text-[10px] text-gray-400">{exec.executionTime}</span>
              </div>
              <div className={`pl-5 text-xs ${exec.isSuccess ? "text-[#10b981]" : "text-rose-400"}`}>
                {exec.output}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Card Aprovação */}
      {pendingPermission && (
        <div className="rounded-xl border border-accent-blue bg-bg-input p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-center gap-2 text-text-primary font-semibold text-xs">
            <ShieldAlert className="h-4 w-4 text-accent-blue" />
            <span>{pendingPermission.reason}</span>
          </div>

          <div className="rounded-md bg-bg-main px-3 py-2 font-mono text-xs text-text-primary">
            {pendingPermission.command}
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => approvePermission()}
              size="sm"
              className="h-8 px-4 text-xs font-semibold rounded-lg bg-accent-blue hover:bg-accent-blue/90 text-text-light cursor-pointer"
            >
              Permitir
            </Button>
            <Button
              onClick={() => denyPermission()}
              variant="outline"
              size="sm"
              className="h-8 px-4 text-xs font-semibold rounded-lg border-border-light text-text-secondary hover:bg-black/5 cursor-pointer"
            >
              Negar
            </Button>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <div className="sticky bottom-0 mt-2 flex items-center gap-3 rounded-2xl border border-border-light bg-bg-input px-4 py-3 shadow-md">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Orientar o agente ou ajustar a tarefa..."
          className="flex-1 bg-transparent text-xs text-text-primary outline-hidden placeholder:text-text-muted"
        />
        <Button
          onClick={handleSend}
          size="icon-sm"
          className="h-7 w-7 rounded-lg bg-accent-blue text-text-light hover:bg-accent-blue/90 cursor-pointer"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
