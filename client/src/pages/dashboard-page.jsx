import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, CheckCircle2, Clock3, Layers3, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { DataCard, SectionGrid } from "../components/common/data-card.jsx";
import { PageHeader } from "../components/common/page-header.jsx";
import { ProgressBar } from "../components/common/status.jsx";
import { ErrorState, LoadingState } from "../components/common/states.jsx";
import { Button } from "../components/ui/button.jsx";
import { api } from "../services/api.js";

export function DashboardPage() {
  const query = useQuery({ queryKey: ["dashboard"], queryFn: async () => (await api.get("/dashboard")).data });
  if (query.isLoading) return <LoadingState />;
  if (query.isError) return <ErrorState onRetry={query.refetch} />;
  const data = query.data;
  return <><PageHeader eyebrow="Your learning command center" title="Good to see you." description="A clear view of what matters today and how your learning is moving." action={<Button as="a"><Link to="/focus">Start a focus session <ArrowUpRight size={16} /></Link></Button>} />
    <SectionGrid columns="four"><Stat label="Overall progress" value={`${data.stats.progress}%`} icon={Target} /><Stat label="Learning items" value={data.stats.items} icon={Layers3} /><Stat label="Completed" value={data.stats.completed} icon={CheckCircle2} /><Stat label="Focus time" value={`${data.focusMinutes}m`} icon={Clock3} accent /></SectionGrid>
    <div className="dashboard-grid"><DataCard><SectionTitle title="Today’s plan" link="/study-sessions" />{data.today.length ? <List items={data.today} /> : <p className="card-copy">Your day is open. Plan a study session or choose one meaningful task.</p>}</DataCard><DataCard><SectionTitle title="Active goals" link="/goals" />{data.activeGoals.map(goal => <div key={goal.id}><div className="list-row"><strong>{goal.title}</strong><span>{goal.current}/{goal.target}</span></div><ProgressBar value={Math.round(goal.current / goal.target * 100)} /></div>)}</DataCard><DataCard><SectionTitle title="Upcoming tasks" link="/tasks" /><List items={data.upcoming} /></DataCard><DataCard><SectionTitle title="Recent notes" link="/notes" /><List items={data.recentNotes} /></DataCard><DataCard><SectionTitle title="Recent activity" />{data.activities.map(item => <div className="list-row" key={item.id}><div><strong>{item.action}</strong><p>{new Date(item.createdAt).toLocaleString()}</p></div></div>)}</DataCard></div>
  </>;
}
function Stat({ label, value, icon: Icon, accent }) { return <DataCard accent={accent}><div className="stat-card"><p>{label}</p><div className="card-head"><span className="stat-value">{value}</span><Icon /></div></div></DataCard>; }
function SectionTitle({ title, link }) { return <div className="section-title"><h2>{title}</h2>{link && <Link to={link}>View all</Link>}</div>; }
function List({ items = [] }) { return items.length ? <div className="list">{items.map(item => <div className="list-row" key={item.id}><div><strong>{item.title || item.name}</strong><p>{item.description || item.topic || item.content}</p></div>{item.duration && <span>{item.duration} min</span>}</div>)}</div> : <p className="card-copy">Nothing waiting here.</p>; }
