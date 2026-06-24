const userId = "demo-user";
const now = new Date().toISOString();
const inDays = days => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);
const item = (id, values) => ({ id, userId, createdAt: now, updatedAt: now, ...values });

export const seed = {
  notes: [item("note-1", { title: "React component patterns", content: "Prefer small, composable components with clear responsibilities.", tags: ["react", "frontend"], pinned: true })],
  roadmaps: [item("roadmap-1", { title: "MERN Developer", description: "A practical path through the full stack.", steps: [{ id: "step-1", title: "JavaScript foundations", done: true }, { id: "step-2", title: "Build an Express API", done: false }] })],
  checklists: [item("check-1", { title: "Before shipping a project", items: [{ id: "check-item-1", text: "Run tests", done: true }, { id: "check-item-2", text: "Check mobile layout", done: false }] })],
  topics: [item("topic-1", { title: "MongoDB aggregation", description: "Learn pipelines and common stages.", status: "Learning", priority: "High", tags: ["mongodb"] })],
  remember: [item("card-1", { question: "What does useMemo do?", answer: "It memoizes a computed value between renders when dependencies stay unchanged.", tags: ["react"], confidence: 3 })],
  diary: [item("diary-1", { title: "A productive start", content: "Mapped the learning plan and finished the first milestone.", mood: "Focused", entryDate: inDays(0) })],
  tasks: [item("task-1", { title: "Finish Express validation", description: "Add request schemas and useful errors.", status: "In Progress", priority: "High", dueDate: inDays(1), tags: ["backend"] })],
  goals: [item("goal-1", { title: "Complete coding exercises", current: 18, target: 50, unit: "exercises", deadline: inDays(30) })],
  customModules: [item("module-1", { name: "Interview Preparation", items: [{ id: "module-item-1", title: "Practice arrays", description: "Solve five medium problems", status: "In Progress", priority: "High" }] })],
  resources: [item("resource-1", { title: "MDN JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", type: "Documentation", topic: "JavaScript", tags: ["reference"], completed: false })],
  studySessions: [item("session-1", { title: "Express API practice", topic: "Backend", plannedDate: inDays(0), duration: 45, notes: "Focus on middleware.", status: "Planned" })],
  activities: [item("activity-1", { action: "Created your My Learning OS workspace", resource: "system" })]
};
