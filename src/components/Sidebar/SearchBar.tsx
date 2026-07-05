import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="flex items-center gap-2 rounded-radius-sm bg-[#252540] px-3 py-2.5">
      <Search className="h-4 w-4 text-text-muted" />
      <span className="text-sm text-text-muted">Search conversations...</span>
    </div>
  );
}
