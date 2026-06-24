import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../components/ui/button.jsx";
import { DataCard } from "../components/common/data-card.jsx";
import { PageHeader } from "../components/common/page-header.jsx";
import { createItem } from "../services/api.js";

export function FocusPage() {
  const queryClient = useQueryClient();
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(1500);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("Ready when you are.");
  useEffect(() => { if (!running) return; if (seconds <= 0) { setRunning(false); setMessage("Focus session complete — beautifully done."); createItem("study-sessions", { title: "Focus timer session", topic: "Deep work", plannedDate: new Date().toISOString().slice(0,10), duration: minutes, notes: "Completed with the focus timer.", status: "Completed" }).then(() => { queryClient.invalidateQueries({ queryKey: ["study-sessions"] }); queryClient.invalidateQueries({ queryKey: ["dashboard"] }); }); return; } const timer = setInterval(() => setSeconds(value => value - 1), 1000); return () => clearInterval(timer); }, [running, seconds, minutes, queryClient]);
  const choose = value => { setMinutes(value); setSeconds(value * 60); setRunning(false); setMessage("Ready when you are."); };
  const clock = `${String(Math.floor(seconds / 60)).padStart(2,"0")}:${String(seconds % 60).padStart(2,"0")}`;
  return <><PageHeader eyebrow="Deep work" title="Focus Timer" description="Give one useful thing your full attention. Completed sessions are added to your study history." /><div className="split-content"><DataCard><div className="timer"><div className="preset-row">{[15,25,45,60].map(value => <Button key={value} variant={minutes === value ? "primary" : "secondary"} size="small" onClick={() => choose(value)}>{value} min</Button>)}</div><div className="timer-clock" aria-live="polite">{clock}</div><p className="card-copy">{message}</p><div className="timer-actions"><Button onClick={() => setRunning(value => !value)}>{running ? <><Pause />Pause</> : <><Play />Start focus</>}</Button><Button variant="ghost" onClick={() => choose(minutes)}><RotateCcw />Reset</Button></div></div></DataCard><DataCard><p className="eyebrow">A small ritual</p><h2>Before you begin</h2><div className="list"><div className="list-row"><strong>1. Name one outcome</strong></div><div className="list-row"><strong>2. Remove one distraction</strong></div><div className="list-row"><strong>3. Stop when the timer ends</strong></div></div><p className="card-copy">A clean finish makes it easier to begin again tomorrow.</p></DataCard></div></>;
}
