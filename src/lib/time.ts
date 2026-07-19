const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatRelativeTime(ms: number): string {
  const diff = Date.now() - ms;

  if (diff < MINUTE) return "agora";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m atrás`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h atrás`;

  const days = Math.floor(diff / DAY);
  if (days === 1) return "Ontem";
  return `${days}d atrás`;
}
