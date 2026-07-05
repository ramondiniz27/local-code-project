interface CodeBlockProps {
  code: string;
}

export function CodeBlock({ code }: CodeBlockProps) {
  return (
    <pre className="w-full overflow-x-auto rounded-lg bg-[#1e293b] p-4">
      <code className="font-mono text-xs leading-relaxed text-[#e2e8f0] whitespace-pre">
        {code}
      </code>
    </pre>
  );
}
