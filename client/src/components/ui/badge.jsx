import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils.js";

const badgeVariants = cva("badge", { variants: { tone: { neutral: "badge-neutral", primary: "badge-primary", success: "badge-success", warning: "badge-warning", danger: "badge-danger" } }, defaultVariants: { tone: "neutral" } });
export function Badge({ tone, className, ...props }) { return <span className={cn(badgeVariants({ tone }), className)} {...props} />; }
