import { X, GitCompare, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCoworkStore } from "@/store/coworkStore";

export function DiffViewerModal() {
  const { isDiffModalOpen, setDiffModalOpen, changedFiles } = useCoworkStore();

  if (!isDiffModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-6">
      <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-2xl border border-border-light bg-bg-input shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-light px-6 py-4">
          <div className="flex items-center gap-2.5">
            <GitCompare className="h-5 w-5 text-accent-blue" />
            <h2 className="text-sm font-semibold text-text-primary">
              Revisão de Alterações ({changedFiles.length} arquivos)
            </h2>
          </div>
          <Button
            onClick={() => setDiffModalOpen(false)}
            variant="ghost"
            size="icon-sm"
            className="h-8 w-8 text-text-secondary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content Body */}
        <div className="flex flex-1 min-h-0">
          {/* File Selector Sidebar */}
          <div className="w-64 border-r border-border-light bg-bg-main/50 p-3 flex flex-col gap-1.5 overflow-y-auto">
            {changedFiles.map((file, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-mono cursor-pointer transition-colors ${
                  idx === 0 ? "bg-accent-blue/10 text-accent-blue font-semibold" : "text-text-primary hover:bg-black/5"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{file.name}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="text-[#10b981]">+{file.additions}</span>
                  <span className="text-[#ef4444]">-{file.deletions}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Diff Viewer Area */}
          <div className="flex-1 bg-[#1a1a2e] p-4 text-white font-mono text-xs overflow-y-auto">
            <div className="text-gray-400 mb-2 pb-2 border-b border-gray-700">
              diff --git a/src/middleware/jwt.py b/src/middleware/jwt.py
            </div>
            <div className="space-y-0.5">
              <div className="text-gray-500">@@ -15,7 +15,12 @@ def verify_jwt_token(token: str):</div>
              <div className="text-gray-300"> try:</div>
              <div className="text-rose-400 bg-rose-950/30">- payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])</div>
              <div className="text-[#10b981] bg-emerald-950/30">+ payload = jwt.decode(token, PUBLIC_KEY, algorithms=["RS256"])</div>
              <div className="text-[#10b981] bg-emerald-950/30">+ if is_token_revoked(payload.get("jti")):</div>
              <div className="text-[#10b981] bg-emerald-950/30">+ raise AuthenticationError("Token revogado")</div>
              <div className="text-gray-300"> return payload</div>
              <div className="text-gray-300"> except jwt.PyJWTError as e:</div>
              <div className="text-rose-400 bg-rose-950/30">- raise InvalidTokenError()</div>
              <div className="text-[#10b981] bg-emerald-950/30">+ raise AuthenticationError(str(e))</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
