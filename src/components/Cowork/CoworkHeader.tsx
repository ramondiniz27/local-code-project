import { Users, Plus, SlidersHorizontal, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CoworkHeaderProps {
  onNewSession?: () => void;
  activeAgentsCount: number;
}

export function CoworkHeader({ onNewSession, activeAgentsCount }: CoworkHeaderProps) {
  return (
    <header className="flex h-16 w-full shrink-0 items-center justify-between border-b border-border-light bg-bg-input px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-blue/10 text-accent-blue">
          <Users className="h-5 w-5 text-accent-blue" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-text-primary">Cowork Workspace</h1>
            <Badge variant="secondary" className="bg-accent-blue/10 text-accent-blue hover:bg-accent-blue/15 text-xs border-0 font-medium">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {activeAgentsCount} Agentes Ativos
            </Badge>
          </div>
          <p className="text-xs text-text-secondary">
            Colaboração autônoma de agentes de IA em tempo real
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-xs text-text-secondary border-border-light hover:bg-black/5"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtros
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 text-xs text-text-secondary border-border-light hover:bg-black/5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Atualizar State
        </Button>
        <Button
          onClick={onNewSession}
          size="sm"
          className="h-9 gap-1.5 bg-accent-blue hover:bg-accent-blue/90 text-white text-xs font-semibold shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Nova Sessão Cowork
        </Button>
      </div>
    </header>
  );
}
