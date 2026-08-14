import { MapPin, Flame, AlertTriangle, Clock, Eye, CheckCircle2 } from "lucide-react";

export const ISSUE_FILTERS = [
  { key: "all", label: "All", icon: MapPin },
  { key: "critical", label: "Critical", icon: Flame },
  { key: "high", label: "High", icon: AlertTriangle },
  { key: "in_progress", label: "In progress", icon: Clock },
  { key: "under_review", label: "Under review", icon: Eye },
  { key: "resolved", label: "Resolved", icon: CheckCircle2 },
];

export const ISSUE_SORTS = [
  { key: "priority", label: "Priority" },
  { key: "distance", label: "Nearest" },
  { key: "recent", label: "Most recent" },
];

export function matchesFilter(issue, key) {
  if (!key || key === "all") return true;
  if (key === "critical" || key === "high") return issue.severity === key;
  return issue.status === key;
}

export function sortIssues(issues, sort) {
  const list = [...issues];
  if (sort === "distance") {
    return list.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }
  if (sort === "recent") {
    return list.sort((a, b) => new Date(b.reportedAt) - new Date(a.reportedAt));
  }
  return list.sort((a, b) => b.priority - a.priority);
}
