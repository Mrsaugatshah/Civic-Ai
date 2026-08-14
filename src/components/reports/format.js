export function formatRelativeTime(iso) {
  if (!iso) return null;
  const diffMs = Date.now() - new Date(iso).getTime();
  if (diffMs < 60000) return "just now";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTime(iso) {
  if (!iso) return null;
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }) +
    " · " +
    date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function formatShortDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
