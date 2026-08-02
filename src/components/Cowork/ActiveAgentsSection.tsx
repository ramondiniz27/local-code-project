import { Bot, Cpu, CheckCircle2 } from "lucide-react";
import type { CoworkAgent } from "./coworkTypes";
import { Badge } from "@/components/ui/badge";

interface ActiveAgentsSectionProps {
  agents: CoworkAgent[];
}

export function ActiveAgentsSection({ agents }: ActiveAgentsSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-accent-blue" />
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Agentes Colaboradores ({agents.length})
          </h2>
        </div>
        <span className="text-xs text-text-secondary font-medium">
          Multi-Agent Runtime: <strong className="text-text-primary">Tauri Local Threadpool</strong>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {agents.map((agent) => {
          const statusConfig = {
            active: {
              label: "Executando",
              bg: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
              dot: "bg-emerald-500 animate-ping",
            },
            verifying: {
              label: "Verificando Gate",
              bg: "bg-amber-500/10 text-amber-600 border-amber-500/20",
              dot: "bg-amber-500 animate-pulse",
            },
            idle: {
              label: "Aguardando",
              bg: "bg-gray-500/10 text-gray-600 border-gray-500/20",
              dot: "bg-gray-400",
            },
            paused: {
              label: "Pausado",
              bg: "bg-rose-500/10 text-rose-600 border-rose-500/20",
              dot: "bg-rose-500",
            },
          }[agent.status];

          return (
            <div
              key={agent.id}
              className="group relative flex flex-col justify-between rounded-xl border border-border-light bg-bg-input p-4 shadow-xs transition-all duration-200 hover:border-accent-blue/40 hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${agent.avatarColor} text-white font-bold text-sm shadow-xs`}
                    >
                      {agent.avatarInitials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-text-primary group-hover:text-accent-blue transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-text-secondary leading-tight line-clamp-1">
                        {agent.role}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                  <Badge variant="outline" className={`text-[10px] gap-1 py-0.5 px-2 font-medium border ${statusConfig.bg}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}></span>
                    {statusConfig.label}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px] py-0.5 px-2 bg-black/5 text-text-secondary border-0">
                    {agent.model}
                  </Badge>
                </div>

                <div className="rounded-lg bg-bg-main/60 p-2.5 mb-3 border border-black/5">
                  <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block mb-1">
                    Tarefa Atual:
                  </span>
                  <p className="text-xs text-text-primary line-clamp-2 leading-relaxed font-medium">
                    {agent.currentTask}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border-light/60 text-[11px] text-text-secondary">
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span><strong>{agent.tasksCompleted}</strong> tarefas</span>
                </div>
                <div className="flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5 text-accent-blue" />
                  <span>CPU: <strong>{agent.cpuUsage}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
