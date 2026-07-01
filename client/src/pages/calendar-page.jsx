import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ClipboardList, Target, TimerReset } from "lucide-react";
import { getList } from "../services/api.js";
import { PageHeader } from "../components/common/page-header.jsx";
import { LoadingState } from "../components/common/states.jsx";
import { DataCard } from "../components/common/data-card.jsx";

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState({ tasks: [], goals: [], sessions: [] });
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [tasksRes, goalsRes, sessionsRes] = await Promise.all([
          getList("tasks", { limit: 1000 }),
          getList("goals", { limit: 1000 }),
          getList("study-sessions", { limit: 1000 })
        ]);
        setEvents({
          tasks: tasksRes.items || [],
          goals: goalsRes.items || [],
          sessions: sessionsRes.items || []
        });
      } catch (err) {
        console.error("Failed to load calendar events:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingState />;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of the month index (0 = Sun, 1 = Mon, etc.)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in the month
  const totalDays = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  // Build the list of days for grid rendering
  const daysGrid = [];
  
  // Padding from previous month
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    daysGrid.push({
      dayNum: prevMonthDays - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthDays - i)
    });
  }

  // Days of current month
  for (let i = 1; i <= totalDays; i++) {
    daysGrid.push({
      dayNum: i,
      isCurrentMonth: true,
      date: new Date(year, month, i)
    });
  }

  // Next month padding to fill out 42 grid items (6 weeks)
  const remaining = 42 - daysGrid.length;
  for (let i = 1; i <= remaining; i++) {
    daysGrid.push({
      dayNum: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i)
    });
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayEvents(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayEvents(null);
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().slice(0, 10);
    
    const dayTasks = events.tasks.filter(t => t.dueDate === dateStr);
    const dayGoals = events.goals.filter(g => g.deadline === dateStr);
    const daySessions = events.sessions.filter(s => s.plannedDate === dateStr);

    return {
      tasks: dayTasks,
      goals: dayGoals,
      sessions: daySessions,
      total: dayTasks.length + dayGoals.length + daySessions.length
    };
  };

  const handleDayClick = (day) => {
    const dayEvents = getEventsForDate(day.date);
    if (dayEvents.total > 0) {
      setSelectedDayEvents({
        date: day.date,
        ...dayEvents
      });
    } else {
      setSelectedDayEvents(null);
    }
  };

  return (
    <>
      <PageHeader 
        eyebrow="Schedule & Milestones" 
        title="Calendar" 
        description="Track your task deadlines, roadmap progress goals, and upcoming focus study sessions."
      />

      <div className="split-content">
        <DataCard>
          {/* Calendar Header Nav */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ margin: 0, fontFamily: "Fraunces", fontSize: "1.5rem" }}>
              {monthNames[month]} {year}
            </h2>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handlePrevMonth} className="button button-secondary button-icon">
                <ChevronLeft size={18} />
              </button>
              <button onClick={handleNextMonth} className="button button-secondary button-icon">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px", textAlign: "center", fontWeight: "700", marginBottom: "8px", color: "var(--walnut-brown)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {dayNames.map(name => <div key={name}>{name}</div>)}
          </div>

          {/* Calendar Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "8px" }}>
            {daysGrid.map((day, idx) => {
              const dayEvents = getEventsForDate(day.date);
              const isToday = new Date().toDateString() === day.date.toDateString();

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  style={{
                    minHeight: "85px",
                    padding: "8px",
                    borderRadius: "12px",
                    border: isToday ? "2px solid var(--clay-brown)" : "1px solid var(--border)",
                    background: day.isCurrentMonth ? "var(--surface)" : "var(--surface-soft)",
                    opacity: day.isCurrentMonth ? 1 : 0.5,
                    cursor: dayEvents.total > 0 ? "pointer" : "default",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.15s, border-color 0.15s",
                  }}
                  className="calendar-day-box"
                  onMouseEnter={(e) => {
                    if (dayEvents.total > 0) {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.borderColor = "var(--clay-brown)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (dayEvents.total > 0) {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.borderColor = isToday ? "var(--clay-brown)" : "var(--border)";
                    }
                  }}
                >
                  <span style={{ 
                    fontSize: "0.85rem", 
                    fontWeight: isToday ? "800" : "500",
                    color: isToday ? "var(--deep-forest-brown)" : "var(--muted)"
                  }}>
                    {day.dayNum}
                  </span>

                  <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginTop: "4px" }}>
                    {dayEvents.tasks.slice(0, 2).map((t, i) => (
                      <div key={i} className="calendar-event-text" style={{ fontSize: "0.68rem", padding: "2px 6px", borderRadius: "4px", background: "rgba(117, 89, 73, 0.1)", color: "var(--deep-forest-brown)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        t: {t.title}
                      </div>
                    ))}
                    {dayEvents.goals.slice(0, 1).map((g, i) => (
                      <div key={i} className="calendar-event-text" style={{ fontSize: "0.68rem", padding: "2px 6px", borderRadius: "4px", background: "rgba(161, 119, 93, 0.15)", color: "var(--deep-forest-brown)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        g: {g.title}
                      </div>
                    ))}
                    {dayEvents.sessions.slice(0, 1).map((s, i) => (
                      <div key={i} className="calendar-event-text" style={{ fontSize: "0.68rem", padding: "2px 6px", borderRadius: "4px", background: "rgba(164, 155, 114, 0.18)", color: "var(--olive-green)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        f: {s.title}
                      </div>
                    ))}
                    {dayEvents.total > 3 && (
                      <span className="calendar-event-text" style={{ fontSize: "0.6rem", color: "var(--muted)", textAlign: "right" }}>
                        +{dayEvents.total - 3} more
                      </span>
                    )}

                    {/* Mobile/Tablet Dots Indicator View */}
                    {dayEvents.total > 0 && (
                      <div className="calendar-event-dots-container">
                        {dayEvents.tasks.map((_, i) => (
                          <span key={i} className="calendar-event-dot task" title="Task" />
                        ))}
                        {dayEvents.goals.map((_, i) => (
                          <span key={i} className="calendar-event-dot goal" title="Goal" />
                        ))}
                        {dayEvents.sessions.map((_, i) => (
                          <span key={i} className="calendar-event-dot session" title="Focus Session" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </DataCard>

        {/* Selected Day Event Drawer / Detail Area */}
        <div>
          <DataCard>
            <h3 style={{ borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "14px", fontFamily: "Fraunces" }}>
              Selected Agenda
            </h3>
            {selectedDayEvents ? (
              <div>
                <p style={{ fontWeight: "700", color: "var(--clay-brown)", fontSize: "0.9rem", marginBottom: "16px" }}>
                  {selectedDayEvents.date.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                {selectedDayEvents.tasks.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 0 10px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--walnut-brown)" }}>
                      <ClipboardList size={14} /> Tasks Due
                    </h4>
                    <div style={{ display: "grid", gap: "8px" }}>
                      {selectedDayEvents.tasks.map(t => (
                        <div key={t.id} style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface-soft)", fontSize: "0.85rem" }}>
                          <strong>{t.title}</strong>
                          <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>{t.description || "No description provided."}</p>
                          <span className={`badge badge-${t.priority === "High" ? "danger" : t.priority === "Medium" ? "warning" : "neutral"}`} style={{ marginTop: "8px" }}>
                            {t.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDayEvents.goals.length > 0 && (
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 0 10px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--walnut-brown)" }}>
                      <Target size={14} /> Milestones / Target Deadlines
                    </h4>
                    <div style={{ display: "grid", gap: "8px" }}>
                      {selectedDayEvents.goals.map(g => (
                        <div key={g.id} style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface-soft)", fontSize: "0.85rem" }}>
                          <strong>{g.title}</strong>
                          <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>Target: {g.current} / {g.target} {g.unit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedDayEvents.sessions.length > 0 && (
                  <div style={{ marginBottom: "10px" }}>
                    <h4 style={{ display: "flex", alignItems: "center", gap: "6px", margin: "0 0 10px", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--walnut-brown)" }}>
                      <TimerReset size={14} /> Scheduled Focus Blocks
                    </h4>
                    <div style={{ display: "grid", gap: "8px" }}>
                      {selectedDayEvents.sessions.map(s => (
                        <div key={s.id} style={{ padding: "10px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface-soft)", fontSize: "0.85rem" }}>
                          <strong>{s.title}</strong>
                          <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>Topic: {s.topic || "General"} • {s.duration} mins</p>
                          <span className={`badge badge-${s.status === "Completed" ? "success" : s.status === "Skipped" ? "danger" : "primary"}`} style={{ marginTop: "8px" }}>
                            {s.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: "1.6" }}>
                Select a day with events on the grid to view details of deadlines, goals, and focus sessions.
              </p>
            )}
          </DataCard>
        </div>
      </div>
    </>
  );
}
