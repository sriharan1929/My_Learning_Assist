import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...values) { return twMerge(clsx(values)); }
export function formatDate(value) { return value ? new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "No date"; }
export function getProgress(item) {
  if (item.steps) return item.steps.length ? Math.round(item.steps.filter(step => step.done).length / item.steps.length * 100) : 0;
  if (item.items) return item.items.length ? Math.round(item.items.filter(entry => entry.done || entry.status === "Completed").length / item.items.length * 100) : 0;
  if (item.target) return Math.min(100, Math.round(item.current / item.target * 100));
  return item.status === "Completed" || item.status === "Mastered" || item.completed ? 100 : 0;
}
