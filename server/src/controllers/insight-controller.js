import { resourceNames } from "@learning-os/shared";
import { sendData } from "../utils/response.js";

const progress = item => {
  if (item.steps) return item.steps.length ? item.steps.filter(x => x.done).length / item.steps.length : 0;
  if (item.items) return item.items.length ? item.items.filter(x => x.done || x.status === "Completed").length / item.items.length : 0;
  if (item.target) return Math.min(1, item.current / item.target);
  return ["Completed", "Mastered"].includes(item.status) || item.completed ? 1 : 0;
};

export function dashboard(repository) {
  return (req, res) => {
    const all = Object.fromEntries(resourceNames.map(name => [name, repository.all(name, req.user.sub)]));
    const trackable = ["roadmaps", "checklists", "topics", "tasks", "goals", "customModules"];
    const values = trackable.flatMap(name => all[name]);
    const today = new Date().toISOString().slice(0, 10);
    sendData(res, {
      stats: { modules: resourceNames.length, items: Object.values(all).flat().length, completed: values.filter(item => progress(item) >= 1).length, progress: values.length ? Math.round(values.reduce((sum, item) => sum + progress(item), 0) / values.length * 100) : 0 },
      today: [...all.tasks, ...all.studySessions].filter(item => item.dueDate === today || item.plannedDate === today),
      upcoming: all.tasks.filter(item => item.dueDate && item.status !== "Completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5),
      recentNotes: all.notes.slice(0, 4), activeGoals: all.goals.filter(goal => goal.current < goal.target).slice(0, 4),
      focusMinutes: all.studySessions.filter(item => item.status === "Completed").reduce((sum, item) => sum + item.duration, 0),
      activities: repository.all("activities", req.user.sub).slice(-8).reverse()
    });
  };
}

export function search(repository) {
  return (req, res) => {
    const query = String(req.query.q || "").toLowerCase();
    if (!query) return sendData(res, []);
    const results = resourceNames.flatMap(name => repository.all(name, req.user.sub).filter(item => JSON.stringify(item).toLowerCase().includes(query)).map(item => ({ id: item.id, type: name, title: item.title || item.name || item.question, path: `/${name === "studySessions" ? "study-sessions" : name === "customModules" ? "custom-modules" : name}` })));
    sendData(res, results.slice(0, 20));
  };
}
