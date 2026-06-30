import { resourceNames } from "@learning-os/shared";
import { asyncHandler } from "../utils/async-handler.js";
import { sendData } from "../utils/response.js";

const progress = item => {
  if (item.steps) return item.steps.length ? item.steps.filter(x => x.done).length / item.steps.length : 0;
  if (item.items) return item.items.length ? item.items.filter(x => x.done || x.status === "Completed").length / item.items.length : 0;
  if (item.target) return Math.min(1, item.current / item.target);
  return ["Completed", "Mastered"].includes(item.status) || item.completed ? 1 : 0;
};

export function dashboard(repository) {
  return asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const names = [...resourceNames, "activities"];
    const results = await Promise.all(names.map(name => repository.all(name, userId)));
    const all = Object.fromEntries(names.map((name, i) => [name, results[i]]));
    const trackable = ["roadmaps", "checklists", "topics", "tasks", "goals", "customModules"];
    const values = trackable.flatMap(name => all[name]);
    const today = new Date().toISOString().slice(0, 10);

    const getTaskDate = t => {
      const d = t.updatedAt || t.createdAt;
      if (!d) return null;
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
    };

    const getSessionDate = s => {
      const d = s.plannedDate || s.updatedAt || s.createdAt;
      if (!d) return null;
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
    };

    // Calculate current streak for dashboard stats
    const taskDates = all.tasks.filter(t => t.status === "Completed").map(getTaskDate).filter(Boolean);
    const sessionDates = all.studySessions.filter(s => s.status === "Completed").map(getSessionDate).filter(Boolean);
    const completedSet = new Set([...taskDates, ...sessionDates]);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    let currentStreak = 0;
    if (completedSet.has(today) || completedSet.has(yesterdayStr)) {
      const checkDate = completedSet.has(today) ? new Date() : yesterday;
      while (true) {
        const checkStr = checkDate.toISOString().slice(0, 10);
        if (completedSet.has(checkStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    sendData(res, {
      stats: {
        modules: resourceNames.length,
        items: resourceNames.flatMap(name => all[name]).length,
        completed: values.filter(item => progress(item) >= 1).length,
        progress: values.length ? Math.round(values.reduce((sum, item) => sum + progress(item), 0) / values.length * 100) : 0,
        currentStreak
      },
      today: [...all.tasks, ...all.studySessions].filter(item => item.dueDate === today || item.plannedDate === today),
      upcoming: all.tasks.filter(item => item.dueDate && item.status !== "Completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 5),
      recentNotes: all.notes.slice(0, 4), activeGoals: all.goals.filter(goal => goal.current < goal.target).slice(0, 4),
      focusMinutes: all.studySessions.filter(item => item.status === "Completed").reduce((sum, item) => sum + item.duration, 0),
      activities: all.activities.slice(-8).reverse()
    });
  });
}

export function search(repository) {
  return asyncHandler(async (req, res) => {
    const query = String(req.query.q || "").toLowerCase();
    if (!query) return sendData(res, []);
    const resultsList = await Promise.all(resourceNames.map(name => repository.all(name, req.user.sub)));
    const results = resourceNames.flatMap((name, i) => resultsList[i].filter(item => JSON.stringify(item).toLowerCase().includes(query)).map(item => ({ id: item.id || item._id?.toString(), type: name, title: item.title || item.name || item.question, path: `/${name === "studySessions" ? "study-sessions" : name === "customModules" ? "custom-modules" : name}` })));
    sendData(res, results.slice(0, 20));
  });
}

export function analytics(repository) {
  return asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const [tasks, studySessions] = await Promise.all([
      repository.all("tasks", userId),
      repository.all("studySessions", userId)
    ]);

    const getTaskDate = t => {
      const d = t.updatedAt || t.createdAt;
      if (!d) return null;
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
    };

    const getSessionDate = s => {
      const d = s.plannedDate || s.updatedAt || s.createdAt;
      if (!d) return null;
      const parsed = new Date(d);
      return isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
    };

    const taskDates = tasks.filter(t => t.status === "Completed").map(getTaskDate).filter(Boolean);
    const sessionDates = studySessions.filter(s => s.status === "Completed").map(getSessionDate).filter(Boolean);

    const completedSet = new Set([...taskDates, ...sessionDates]);
    const completedDates = Array.from(completedSet).sort();

    // Calculate current streak
    let currentStreak = 0;
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);

    if (completedSet.has(todayStr) || completedSet.has(yesterdayStr)) {
      const checkDate = completedSet.has(todayStr) ? new Date() : yesterday;
      while (true) {
        const checkStr = checkDate.toISOString().slice(0, 10);
        if (completedSet.has(checkStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    if (completedDates.length > 0) {
      let prevTime = null;
      for (const dStr of completedDates) {
        const currTime = new Date(dStr).getTime();
        if (prevTime === null) {
          tempStreak = 1;
        } else {
          const diffDays = Math.round((currTime - prevTime) / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            tempStreak++;
          } else if (diffDays > 1) {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        prevTime = currTime;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // Calculate study time by topic
    const topicDurations = {};
    studySessions
      .filter(s => s.status === "Completed")
      .forEach(s => {
        const topic = s.topic || "General";
        topicDurations[topic] = (topicDurations[topic] || 0) + (s.duration || 0);
      });
    const studyTimeByTopic = Object.entries(topicDurations).map(([name, mins]) => ({
      name,
      hours: Math.round((mins / 60) * 10) / 10
    }));

    // Calculate study time by date for last 14 days
    const studyTimeByDate = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      const dayMins = studySessions
        .filter(s => {
          if (s.status !== "Completed") return false;
          const sDate = getSessionDate(s);
          return sDate === dStr;
        })
        .reduce((sum, s) => sum + (s.duration || 0), 0);
      
      studyTimeByDate.push({
        date: dStr,
        hours: Math.round((dayMins / 60) * 10) / 10
      });
    }

    // Streaks history (last 30 days)
    const streakHistory = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().slice(0, 10);
      streakHistory.push({
        date: dStr,
        completed: completedSet.has(dStr)
      });
    }

    sendData(res, {
      currentStreak,
      longestStreak,
      completedDates: Array.from(completedSet),
      studyTimeByTopic,
      studyTimeByDate,
      streakHistory
    });
  });
}
