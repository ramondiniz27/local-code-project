import { useState } from "react";
import { Brain, ChevronDown, ChevronRight } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

interface AIMessageProps {
  content: string;
}

interface Segment {
  type: "text" | "code";
  value: string;
}

interface ParsedContent {
  thinking: string | null;
  isThinkingActive: boolean;
  response: string;
}

function parseThinkingAndResponse(content: string): ParsedContent {
  const thinkOpenIndex = content.indexOf("<think>");
  if (thinkOpenIndex === -1) {
    return {
      thinking: null,
      isThinkingActive: false,
      response: content,
    };
  }

  const thinkCloseIndex = content.indexOf("</think>");
  if (thinkCloseIndex !== -1) {
    const thinkingText = content.slice(thinkOpenIndex + 7, thinkCloseIndex).trim();
    const cleanResponse = (
      content.slice(0, thinkOpenIndex) + content.slice(thinkCloseIndex + 8)
    ).trim();
    return {
      thinking: thinkingText,
      isThinkingActive: false,
      response: cleanResponse,
    };
  } else {
    const thinkingText = content.slice(thinkOpenIndex + 7).trim();
    const cleanResponse = content.slice(0, thinkOpenIndex).trim();
    return {
      thinking: thinkingText,
      isThinkingActive: true,
      response: cleanResponse,
    };
  }
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
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const { thinking, isThinkingActive, response } = parseThinkingAndResponse(content);
  const segments = parseSegments(response);

  const showThinkingContent = isThinkingExpanded || isThinkingActive;

  return (
    <div className="flex w-full gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-blue">
        <span className="text-sm font-semibold text-text-light">A</span>
      </div>
      <div className="max-w-[560px] rounded-radius-md bg-bg-message-ai px-4 py-3">
        <div className="flex flex-col gap-3">
          {/* Thinking Block Accordion */}
          {thinking !== null && (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                className="flex items-center gap-1.5 rounded-md bg-black/5 px-2.5 py-1 text-xs font-medium text-text-muted hover:bg-black/10 hover:text-text-primary dark:bg-white/5 dark:hover:bg-white/10 transition-colors w-fit cursor-pointer"
              >
                <Brain className="h-3.5 w-3.5 text-accent-blue" />
                <span>{isThinkingActive ? "Pensando..." : "Pensamento"}</span>
                {isThinkingActive ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-blue animate-pulse" />
                ) : isThinkingExpanded ? (
                  <ChevronDown className="h-3 w-3 text-text-muted" />
                ) : (
                  <ChevronRight className="h-3 w-3 text-text-muted" />
                )}
              </button>

              {showThinkingContent && (
                <div className="rounded-md border-l-2 border-accent-blue/50 bg-black/5 dark:bg-white/5 p-3 text-xs text-text-secondary font-mono leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {thinking}
                </div>
              )}
            </div>
          )}

          {/* Main Response Area */}
          {response.length === 0 ? (
            thinking !== null && isThinkingActive ? (
              <span className="text-xs text-text-muted italic">Gerando resposta...</span>
            ) : content.length === 0 ? (
              <span className="text-sm text-text-muted">...</span>
            ) : null
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
