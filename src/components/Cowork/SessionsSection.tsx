import { useState } from "react";
import { FolderGit2, Play, CheckCircle2, Clock3, ChevronRight, Terminal } from "lucide-react";
import type { CoworkSession, CoworkAgent } from "./coworkTypes";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface SessionsSectionProps {
  sessions: CoworkSession[];
  agents: CoworkAgent[];
}

export function SessionsSection({ sessions, agents }: SessionsSectionProps) {
  const [selectedSession, setSelectedSession] = useState<CoworkSession | null>(null);

  const getAgentById = (id: string) => agents.find((a) => a.id === id);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderGit2 className="h-4 w-4 text-accent-blue" />
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Sessões & Tarefas de Co-working ({sessions.length})
          </h2>
        </div>
        <span className="text-xs text-text-secondary font-medium">
          Clique no card para abrir o log detalhado
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {sessions.map((session) => {
          const statusBadge = {
            in_progress: {
              label: "Em Progresso",
              color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
              icon: Play,
            },
            completed: {
              label: "Concluído",
              color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
              icon: CheckCircle2,
            },
            queued: {
              label: "Na Fila",
              color: "bg-gray-500/10 text-gray-600 border-gray-500/20",
              icon: Clock3,
            },
          }[session.status];

          return (
            <div
              key={session.id}
              onClick={() => setSelectedSession(session)}
              className="group cursor-pointer flex flex-col justify-between rounded-xl border border-border-light bg-bg-input p-4 shadow-xs transition-all duration-200 hover:border-accent-blue hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className={`text-[10px] gap-1 py-0.5 px-2 font-medium border ${statusBadge.color}`}>
                    {session.status === "in_progress" && (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-blue animate-ping"></span>
                    )}
                    {statusBadge.label}
                  </Badge>
                  <span className="text-[11px] text-text-secondary">{session.startedAt}</span>
                </div>

                <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-blue transition-colors mb-1">
                  {session.title}
                </h3>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 mb-3">
                  {session.description}
                </p>
              </div>

              <div>
                {/* Progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-text-secondary mb-1">
                    <span>Progresso</span>
                    <span className="text-text-primary">{session.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-black/5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-blue to-cyan-500 transition-all duration-500 rounded-full"
                      style={{ width: `${session.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border-light/60">
                  <div className="flex items-center -space-x-1.5 overflow-hidden">
                    {session.agents.map((agentId) => {
                      const agent = getAgentById(agentId);
                      if (!agent) return null;
                      return (
                        <div
                          key={agent.id}
                          title={`${agent.name} (${agent.role})`}
                          className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${agent.avatarColor} text-white font-bold text-[9px] ring-2 ring-white`}
                        >
                          {agent.avatarInitials}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-semibold text-accent-blue group-hover:translate-x-0.5 transition-transform">
                    <span>Detalhes</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Session Details Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-xl bg-bg-input border-border-light shadow-xl p-6">
          {selectedSession && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-[10px] bg-accent-blue/10 text-accent-blue border-0 font-bold">
                    ID: {selectedSession.id}
                  </Badge>
                  <span className="text-xs text-text-secondary">• Iniciado {selectedSession.startedAt}</span>
                </div>
                <DialogTitle className="text-lg font-bold text-text-primary">
                  {selectedSession.title}
                </DialogTitle>
                <DialogDescription className="text-xs text-text-secondary mt-1">
                  {selectedSession.description}
                </DialogDescription>
              </DialogHeader>

              <div className="my-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-text-secondary bg-bg-main p-3 rounded-lg border border-black/5">
                  <div>
                    <span className="block font-semibold text-text-primary">Agentes Envolvidos:</span>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedSession.agents.map((aid) => {
                        const a = getAgentById(aid);
                        return a ? (
                          <span key={a.id} className="text-xs font-medium text-accent-blue">
                            @{a.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-semibold text-text-primary">Conclusão:</span>
                    <span className="text-xs font-bold text-emerald-600">{selectedSession.progress}%</span>
                  </div>
                </div>

                <div className="rounded-lg bg-[#1e1e2e] p-3 text-white font-mono text-xs shadow-inner">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-gray-400 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Terminal className="h-3.5 w-3.5 text-accent-blue" />
                      <span>Console Logs de Execução ({selectedSession.recentLogs.length})</span>
                    </div>
                    <span>LIVE BUFFER</span>
                  </div>
                  <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                    {selectedSession.recentLogs.map((log, index) => (
                      <div key={index} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-accent-blue-light select-none">&gt;</span>
                        <span className="text-gray-200">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
