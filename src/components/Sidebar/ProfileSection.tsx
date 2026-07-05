import { Ellipsis } from "lucide-react";
import { profile } from "../../data/mockData";

export function ProfileSection() {
  return (
    <div className="flex items-center gap-2.5 rounded-radius-sm px-2 py-3">
      <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-accent-blue">
        <span className="text-sm font-semibold text-text-light">
          {profile.initial}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[13px] font-medium text-text-light">
          {profile.name}
        </span>
        <span className="text-[11px] text-text-muted">{profile.plan}</span>
      </div>
      <Ellipsis className="h-[18px] w-[18px] text-text-muted" />
    </div>
  );
}
