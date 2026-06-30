import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";
import { Flame, Trophy, Clock, Calendar, CheckSquare } from "lucide-react";
import { api } from "../services/api.js";
import { PageHeader } from "../components/common/page-header.jsx";
import { LoadingState, ErrorState } from "../components/common/states.jsx";
import { DataCard, SectionGrid } from "../components/common/data-card.jsx";

export function AnalyticsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => (await api.get("/analytics")).data
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  // Calculate total focus minutes / hours from the daily chart
  const totalMins = data.studyTimeByDate.reduce((sum, item) => sum + (item.hours * 60), 0);
  const totalHours = Math.round((totalMins / 60) * 10) / 10;

  // Calculate active rate (days with at least one task or study completed out of 30)
  const activeDaysCount = data.streakHistory.filter(x => x.completed).length;
  const consistencyRate = Math.round((activeDaysCount / 30) * 100);

  // Formatter for Recharts tooltips
  const formatTime = (value) => `${value} hrs`;

  return (
    <>
      <PageHeader 
        eyebrow="Study Insights & Metrics" 
        title="Visual Analytics" 
        description="Understand your learning pace, active streaks, and topic distribution over time."
      />

      {/* KPI Stats Row */}
      <SectionGrid columns="four">
        <DataCard>
          <div className="stat-card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ padding: "12px", borderRadius: "12px", background: "rgba(184, 92, 56, 0.1)", color: "var(--deep-forest-brown)" }}>
              <Flame size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: "700", color: "var(--muted)", textTransform: "uppercase" }}>Current Streak</p>
              <span className="stat-value" style={{ fontSize: "1.8rem" }}>{data.currentStreak} days</span>
            </div>
          </div>
        </DataCard>

        <DataCard>
          <div className="stat-card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ padding: "12px", borderRadius: "12px", background: "rgba(117, 89, 73, 0.12)", color: "var(--primary-dark)" }}>
              <Trophy size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: "700", color: "var(--muted)", textTransform: "uppercase" }}>Longest Streak</p>
              <span className="stat-value" style={{ fontSize: "1.8rem" }}>{data.longestStreak} days</span>
            </div>
          </div>
        </DataCard>

        <DataCard>
          <div className="stat-card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ padding: "12px", borderRadius: "12px", background: "rgba(164, 155, 114, 0.12)", color: "var(--olive-green)" }}>
              <Clock size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: "700", color: "var(--muted)", textTransform: "uppercase" }}>Study Hours (14d)</p>
              <span className="stat-value" style={{ fontSize: "1.8rem" }}>{totalHours} hrs</span>
            </div>
          </div>
        </DataCard>

        <DataCard>
          <div className="stat-card" style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ padding: "12px", borderRadius: "12px", background: "rgba(161, 119, 93, 0.12)", color: "var(--clay-brown)" }}>
              <CheckSquare size={24} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: "700", color: "var(--muted)", textTransform: "uppercase" }}>30-Day Consistency</p>
              <span className="stat-value" style={{ fontSize: "1.8rem" }}>{consistencyRate}%</span>
            </div>
          </div>
        </DataCard>
      </SectionGrid>

      {/* Main Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginTop: "18px" }} className="dashboard-grid">
        <DataCard>
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontFamily: "Fraunces", fontSize: "1.25rem", color: "var(--deep-forest-brown)" }}>Study Consistency (Last 14 Days)</h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>Daily aggregated study session duration in hours.</p>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            {data.studyTimeByDate.length === 0 ? (
              <div style={{ height: "100%", display: "grid", placeItems: "center", color: "var(--muted)" }}>No study session data available yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.studyTimeByDate} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--terracotta-sand)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--terracotta-sand)" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} tick={{ fill: "var(--muted)", fontSize: "0.75rem" }} />
                  <YAxis tick={{ fill: "var(--muted)", fontSize: "0.75rem" }} />
                  <Tooltip formatter={formatTime} contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="hours" stroke="var(--clay-brown)" strokeWidth={2} fillOpacity={1} fill="url(#colorHours)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </DataCard>

        <DataCard>
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontFamily: "Fraunces", fontSize: "1.25rem", color: "var(--deep-forest-brown)" }}>Focus by Topic</h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>Total study hours distributed across various subjects.</p>
          </div>
          <div style={{ width: "100%", height: 260 }}>
            {data.studyTimeByTopic.length === 0 ? (
              <div style={{ height: "100%", display: "grid", placeItems: "center", color: "var(--muted)" }}>No completed study session topics recorded yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.studyTimeByTopic} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: "0.75rem" }} />
                  <YAxis tick={{ fill: "var(--muted)", fontSize: "0.75rem" }} />
                  <Tooltip formatter={formatTime} contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px" }} />
                  <Bar dataKey="hours" fill="var(--olive-green)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </DataCard>
      </div>

      {/* Habit Streak Map Card */}
      <DataCard style={{ marginTop: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: "Fraunces", fontSize: "1.25rem", color: "var(--deep-forest-brown)" }}>Habit Consistency Grid</h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>Daily checklist completions or focus hours logged in the last 30 days.</p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", fontSize: "0.78rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "var(--surface-soft)", border: "1px solid var(--border)" }}></span> Inactive</span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "12px", borderRadius: "3px", background: "var(--sage-green)" }}></span> Active</span>
          </div>
        </div>

        {/* Contribution Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: "8px" }}>
          {data.streakHistory.map((day, idx) => {
            const dateStr = new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
            return (
              <div 
                key={idx}
                title={`${dateStr}: ${day.completed ? "Active day" : "Inactive day"}`}
                style={{
                  height: "44px",
                  borderRadius: "8px",
                  background: day.completed ? "var(--sage-green)" : "var(--surface-soft)",
                  border: day.completed ? "none" : "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  transition: "transform 0.1s"
                }}
                className="habit-grid-cell"
                onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <span style={{ 
                  fontSize: "0.72rem", 
                  fontWeight: "700", 
                  color: day.completed ? "white" : "var(--muted)" 
                }}>
                  {day.date.slice(8)}
                </span>
              </div>
            );
          })}
        </div>
      </DataCard>
    </>
  );
}
