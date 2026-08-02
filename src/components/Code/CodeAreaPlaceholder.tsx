import { Code2, Terminal, FolderCode } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CodeAreaPlaceholder() {
  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center bg-bg-main p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-blue/10 text-accent-blue shadow-md mb-4">
        <Code2 className="h-8 w-8 text-accent-blue" />
      </div>
      <h2 className="text-lg font-bold text-text-primary mb-1">
        Workspace de Código & Editor
      </h2>
      <p className="max-w-md text-xs text-text-secondary leading-relaxed mb-6">
        Geração direta de projetos localcode, inspeção de AST e navegação na árvore de diretórios do repositório local.
      </p>
      <div className="flex items-center gap-3">
        <Button size="sm" className="bg-accent-blue hover:bg-accent-blue/90 text-white gap-2">
          <FolderCode className="h-4 w-4" />
          Abrir Pasta do Projeto
        </Button>
        <Button size="sm" variant="outline" className="border-border-light text-text-secondary gap-2">
          <Terminal className="h-4 w-4" />
          Abrir Terminal Integ.
        </Button>
      </div>
    </div>
  );
}
