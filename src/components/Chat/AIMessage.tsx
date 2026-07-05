import { CodeBlock } from "./CodeBlock";

interface AIMessageProps {
  text: string;
  codeBlock?: string;
  followUpText?: string;
}

export function AIMessage({ text, codeBlock, followUpText }: AIMessageProps) {
  return (
    <div className="flex w-full gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-blue">
        <span className="text-sm font-semibold text-text-light">C</span>
      </div>
      <div className="max-w-[560px] rounded-radius-md bg-bg-message-ai px-4 py-3">
        <div className="flex flex-col gap-3">
          <p className="text-sm leading-relaxed text-text-primary">{text}</p>
          {codeBlock && <CodeBlock code={codeBlock} />}
          {followUpText && (
            <p className="text-sm leading-relaxed text-text-primary">
              {followUpText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
