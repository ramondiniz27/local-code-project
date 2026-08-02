import { Ellipsis } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const PROFILE_INITIAL = "U";
const PROFILE_NAME = "Usuário local";
const PROFILE_PLAN = "Ollama local";

export function ProfileSection() {
  return (
    <div className="flex items-center gap-2.5 rounded-radius-sm px-2 py-3">
      <Avatar className="h-[34px] w-[34px]">
        <AvatarFallback className="bg-accent-blue text-sm font-semibold text-text-light">
          {PROFILE_INITIAL}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[13px] font-medium text-text-light">
          {PROFILE_NAME}
        </span>
        <span className="text-[11px] text-text-muted">{PROFILE_PLAN}</span>
      </div>
      <Ellipsis className="h-[18px] w-[18px] text-text-muted" />
    </div>
  );
}

