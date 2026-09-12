import { useEffect } from "react";
import { FileCode, GitCompare, Timer, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCoworkStore } from "@/store/coworkStore";

function formatSeconds(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
}

export function CoworkSidePanel() {
  const {
    changedFiles,
    planSteps,
    metrics,
    setDiffModalOpen,
    tickTimer,
  } = useCoworkStore();

  useEffect(() => {
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickTimer]);

  const completedSteps = planSteps.filter((s) => s.status === "completed").length;
  const totalSteps = planSteps.length;
  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Real data calculations
  const touchedFilesCount = Array.from(
    new Set([
      ...metrics.filesTouched,
      ...changedFiles.map((f) => f.name),
    ])
  ).length;

  const commandsExecutedCount = metrics.commandsExecuted;

  return (
    <aside className="flex w-80 shrink-0 flex-col gap-5 rounded-2xl border border-border-light bg-bg-input p-5 shadow-xs">
      {/* Arquivos Alterados */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-text-primary">
            Arquivos alterados
          </h2>
          <Badge variant="secondary" className="rounded-full bg-[#eff6ff] text-accent-blue text-[11px] font-semibold px-2 py-0.5 border-0">
            {changedFiles.length}
          </Badge>
        </div>

        <div className="flex flex-col gap-2">
          {changedFiles.length === 0 ? (
            <p className="text-xs text-text-muted italic py-1">Nenhum arquivo alterado</p>
          ) : (
            changedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between rounded-md bg-bg-main px-2.5 py-1.5 text-xs gap-2">
                <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                  <FileCode className="h-3.5 w-3.5 text-text-secondary shrink-0" />
                  <span className="font-mono text-[11px] text-text-primary truncate" title={file.name}>
                    {file.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] shrink-0">
                  <span className="text-[#10b981]">+{file.additions}</span>
                  <span className="text-[#ef4444]">−{file.deletions}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <Button
          onClick={() => setDiffModalOpen(true)}
          variant="outline"
          size="sm"
          disabled={changedFiles.length === 0}
          className="w-full h-8 gap-2 text-xs font-semibold rounded-lg border-border-light text-accent-blue hover:bg-black/5 mt-1 cursor-pointer disabled:opacity-50"
        >
          <GitCompare className="h-3.5 w-3.5 text-accent-blue" />
          Revisar todas as alterações
        </Button>
      </div>

      <div className="h-px w-full bg-border-light" />

      {/* Progresso da Tarefa */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-primary">Progresso da tarefa</span>
          <span className="text-xs font-semibold text-accent-blue">{progressPercent}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border-light overflow-hidden">
          <div
            className="h-full rounded-full bg-accent-blue transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="h-px w-full bg-border-light" />

      {/* Resumo da Sessão */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xs font-semibold text-text-primary">
          Resumo da sessão
        </h2>

        <div className="flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-secondary">
              <Timer className="h-3.5 w-3.5 text-text-muted" />
              <span>Tempo ativo</span>
            </div>
            <strong className="text-text-primary font-semibold">
              {formatSeconds(metrics.activeTimeSeconds)}
            </strong>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-secondary">
              <Terminal className="h-3.5 w-3.5 text-text-muted" />
              <span>Comandos executados</span>
            </div>
            <strong className="text-text-primary font-semibold">
              {commandsExecutedCount}
            </strong>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-secondary">
              <FileCode className="h-3.5 w-3.5 text-text-muted" />
              <span>Arquivos tocados</span>
            </div>
            <strong className="text-text-primary font-semibold">
              {touchedFilesCount}
            </strong>
          </div>
        </div>
      </div>
    </aside>
  );
}
