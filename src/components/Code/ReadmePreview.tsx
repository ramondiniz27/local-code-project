import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Loader2, AlertCircle } from "lucide-react";
import { useCodeStore } from "../../store/codeStore";
import { readFile } from "../../lib/filesystem";

export function ReadmePreview() {
  const { projectPath, fileTree } = useCodeStore();
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadReadme() {
      if (!projectPath) return;

      setLoading(true);
      setError(null);

      // Find README candidate
      const candidates = ["README.md", "readme.md", "README"];
      let readmeEntry = null;

      for (const candidate of candidates) {
        const found = fileTree.find(
          (e) =>
            e.kind === "file" &&
            e.name.toLowerCase() === candidate.toLowerCase() &&
            (e.path.match(/\//g) || []).length === 0
        );
        if (found) {
          readmeEntry = found;
          break;
        }
      }

      if (!readmeEntry) {
        setContent(null);
        setLoading(false);
        return;
      }

      try {
        const data = await readFile(readmeEntry.path, projectPath);
        setContent(data);
      } catch (err: any) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    }

    loadReadme();
  }, [projectPath, fileTree]);

  if (loading) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-2 bg-[#181828] text-white">
        <Loader2 className="h-6 w-6 text-[#60a5fa] animate-spin" />
        <span className="text-xs text-[#9ca3af]">Carregando visualização do projeto...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-2 bg-[#181828] p-4 text-center">
        <AlertCircle className="h-8 w-8 text-rose-400" />
        <h3 className="text-sm font-semibold text-white">Erro ao carregar README</h3>
        <p className="text-xs text-[#9ca3af] max-w-sm">{error}</p>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-2 bg-[#181828] p-4 text-center select-none">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#20203a] border border-[#2d2d48] mb-1">
          <FileText className="h-6 w-6 text-[#9ca3af]" />
        </div>
        <h3 className="text-sm font-semibold text-white">Sem README disponível</h3>
        <p className="text-xs text-[#6b7280] max-w-sm">
          Adicione um arquivo README.md na raiz do projeto para exibir detalhes aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col bg-[#181828] overflow-y-auto select-text">
      <div className="mx-auto w-full max-w-4xl px-8 py-10 prose prose-invert prose-sm">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1
                className="text-2xl font-bold text-white border-b border-[#2d2d48] pb-2 mt-0 mb-4"
                {...props}
              />
            ),
            h2: ({ node, ...props }) => (
              <h2
                className="text-xl font-bold text-white border-b border-[#2d2d48] pb-1 mt-6 mb-3"
                {...props}
              />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-lg font-semibold text-white mt-4 mb-2" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="text-xs leading-relaxed text-[#b8bdd0] my-3" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc pl-5 my-3 text-xs text-[#b8bdd0] space-y-1" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal pl-5 my-3 text-xs text-[#b8bdd0] space-y-1" {...props} />
            ),
            li: ({ node, ...props }) => <li className="my-0.5" {...props} />,
            code: ({ node, inline, className, children, ...props }: any) => {
              return !inline ? (
                <pre className="bg-[#141426] border border-[#24243a] p-3 rounded-lg overflow-x-auto my-4 text-[11px] font-mono text-[#d4d4e0]">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              ) : (
                <code
                  className="bg-[#24243a] px-1 py-0.5 rounded font-mono text-[11px] text-[#f5f5f7]"
                  {...props}
                >
                  {children}
                </code>
              );
            },
            table: ({ node, ...props }) => (
              <table className="w-full border-collapse my-4 text-xs text-[#b8bdd0]" {...props} />
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-[#1e1e30] border-b border-[#2d2d48]" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th
                className="px-3 py-2 text-left font-semibold text-white border border-[#2d2d48]"
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td className="px-3 py-2 border border-[#2d2d48]" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-[#3b82f6] bg-[#1e293b]/30 pl-4 py-1 my-4 italic text-[#9ca3af]"
                {...props}
              />
            ),
            a: ({ node, ...props }) => <a className="text-[#60a5fa] hover:underline" {...props} />,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
