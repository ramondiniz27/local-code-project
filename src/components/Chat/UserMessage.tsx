interface UserMessageProps {
  text: string;
}

export function UserMessage({ text }: UserMessageProps) {
  return (
    <div className="flex w-full justify-end">
      <div className="max-w-[480px] rounded-radius-md bg-bg-message-user px-4 py-3">
        <p className="text-sm leading-relaxed text-text-light">{text}</p>
      </div>
    </div>
  );
}
