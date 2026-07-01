import { Badge } from "../ui/badge.jsx";

export function StatusBadge({ value }) {
  const tone = ["Completed", "Mastered"].includes(value) ? "success" : value === "Blocked" ? "danger" : ["In Progress", "Learning"].includes(value) ? "primary" : "neutral";
  return <Badge tone={tone}>{value}</Badge>;
}
export function PriorityBadge({ value }) { return <Badge tone={value === "High" ? "danger" : value === "Medium" ? "warning" : "neutral"}>{value}</Badge>; }
export function ProgressBar({ value }) { return <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin="0" aria-valuemax="100"><span style={{ width: `${value}%` }} /></div>; }
