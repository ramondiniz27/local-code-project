import { CodeBlock } from "./CodeBlock";

interface AIMessageProps {
  content: string;
}

interface Segment {
  type: "text" | "code";
  value: string;
}

function parseSegments(content: string): Segment[] {
  const segments: Segment[] = [];
  const regex = /```[a-zA-Z0-9]*\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: content.slice(lastIndex, match.index) });
    }
    segments.push({ type: "code", value: match[1].trimEnd() });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    segments.push({ type: "text", value: content.slice(lastIndex) });
  }
  return segments;
}

export function AIMessage({ content }: AIMessageProps) {
  const segments = parseSegments(content);

  return (
    <div className="flex w-full gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-blue">
        <span className="text-sm font-semibold text-text-light">A</span>
      </div>
      <div className="max-w-[560px] rounded-radius-md bg-bg-message-ai px-4 py-3">
        <div className="flex flex-col gap-3">
          {content.length === 0 ? (
            <span className="text-sm text-text-muted">...</span>
          ) : (
            segments.map((segment, index) =>
              segment.type === "code" ? (
                <CodeBlock key={index} code={segment.value} />
              ) : (
                segment.value.trim() && (
                  <p
                    key={index}
                    className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary"
                  >
                    {segment.value.trim()}
                  </p>
                )
              ),
            )
          )}
        </div>
      </div>
    </div>
  );
}
