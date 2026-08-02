import { Activity, CheckCircle2, Info, AlertTriangle, XCircle } from "lucide-react";
import type { ActivityLogItem } from "./coworkTypes";
import { Badge } from "@/components/ui/badge";

interface ActivityTimelineProps {
  activities: ActivityLogItem[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-accent-blue" />
          <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider">
            Linha do Tempo de Atividades ({activities.length})
          </h2>
        </div>
        <span className="text-xs text-text-secondary font-medium">
          Feed em tempo real dos eventos de agentes
        </span>
      </div>

      <div className="rounded-xl border border-border-light bg-bg-input p-4 shadow-xs">
        <div className="flex flex-col divide-y divide-border-light/60">
          {activities.map((item) => {
            const typeConfig = {
              success: {
                icon: CheckCircle2,
                color: "text-emerald-500 bg-emerald-500/10",
                badge: "Sucesso",
              },
              info: {
                icon: Info,
                color: "text-blue-500 bg-blue-500/10",
                badge: "Info",
              },
              warning: {
                icon: AlertTriangle,
                color: "text-amber-500 bg-amber-500/10",
                badge: "Aviso",
              },
              error: {
                icon: XCircle,
                color: "text-rose-500 bg-rose-500/10",
                badge: "Erro",
              },
            }[item.type];

            const TypeIcon = typeConfig.icon;

            return (
              <div key={item.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${typeConfig.color}`}>
                    <TypeIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-text-primary">
                        {item.agentName}
                      </span>
                      <span className="text-xs text-text-secondary">•</span>
                      <span className="text-xs font-semibold text-accent-blue">
                        {item.action}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[9px] py-0.2 px-1.5 border-black/10 text-text-secondary">
                    {typeConfig.badge}
                  </Badge>
                  <span className="text-[11px] font-medium text-text-secondary">
                    {item.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
