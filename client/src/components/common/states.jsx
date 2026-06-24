import { LoaderCircle, SearchX } from "lucide-react";
import { Button } from "../ui/button.jsx";

export function LoadingState() { return <div className="state"><LoaderCircle className="spin" /><p>Loading your workspace…</p></div>; }
export function ErrorState({ onRetry }) { return <div className="state state-error"><h3>We couldn’t load this page</h3><p>Please check that the API is running and try again.</p>{onRetry && <Button onClick={onRetry}>Try again</Button>}</div>; }
export function EmptyState({ title = "Nothing here yet", description = "Create the first item when you’re ready.", action }) { return <div className="state"><SearchX /><h3>{title}</h3><p>{description}</p>{action}</div>; }
