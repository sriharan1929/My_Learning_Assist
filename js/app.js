// app.js — app shell: navigation, dashboard, dark mode, global search, generic modal

let currentView = "dashboard";
let formModalSaveHandler = null;

const BUILTIN_MODULES = [
    { key: "notes", label: "Notes", color: "var(--c-notes)" },
    { key: "roadmaps", label: "Roadmaps", color: "var(--c-roadmaps)" },
    { key: "checklists", label: "Checklists", color: "var(--c-checklists)" },
    { key: "topics", label: "Topics to Learn", color: "var(--c-topics)" },
    { key: "remember", label: "Questions to Remember", color: "var(--c-remember)" },
    { key: "diary", label: "Diary", color: "var(--c-diary)" },
    { key: "tasks", label: "Tasks", color: "var(--c-tasks)" },
    { key: "goals", label: "Progress", color: "var(--c-goals)" }
];

// ===================== BOOT =====================

async function loadApplication() {

    document.getElementById("login-container").style.display = "none";
    document.getElementById("app-container").style.display = "flex";

    await loadStore();

    applyDarkModePreference();

    renderAll();

    if ("Notification" in window) {
        Notification.requestPermission();
    }

    checkDueTasks();
}

function renderAll() {
    updateDashboardStats();
    renderTimeline();
    renderUpcomingTasks();
    renderRecentNotes();
    renderModuleSnapshot();

    renderNotes();
    renderRoadmaps();
    renderChecklists();
    renderTopics();
    renderRemember();
    renderDiary();
    renderTasks();
    renderGoals();
    renderModules();
}

// ===================== NAVIGATION =====================

function switchView(viewName) {

    currentView = viewName;

    document.querySelectorAll(".nav-item").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.view === viewName);
    });

    document.querySelectorAll(".view").forEach(section => {
        section.classList.toggle("active", section.id === "view-" + viewName);
    });

    // reset detail views when leaving a section
    if (viewName !== "roadmaps") closeRoadmapDetail();
    if (viewName !== "checklists") closeChecklistDetail();
    if (viewName !== "custom") closeModuleDetail();
}

// ===================== DARK MODE =====================

function applyDarkModePreference() {
    const darkMode = localStorage.getItem("darkMode");

    if (darkMode === "true") {
        document.body.classList.add("dark");
        updateDarkToggleLabel();
    }
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");

    localStorage.setItem("darkMode", document.body.classList.contains("dark"));

    updateDarkToggleLabel();
}

function updateDarkToggleLabel() {
    const btn = document.getElementById("darkToggle");
    if (!btn) return;

    btn.innerHTML = document.body.classList.contains("dark")
        ? "☀️ Light mode"
        : "🌙 Dark mode";
}

// ===================== GENERIC FORM MODAL =====================

function openFormModal(title, bodyHtml, onSave) {

    document.getElementById("formModalTitle").innerText = title;
    document.getElementById("formModalBody").innerHTML = bodyHtml;
    formModalSaveHandler = onSave;

    document.getElementById("formModal").style.display = "block";
}

function closeFormModal() {
    document.getElementById("formModal").style.display = "none";
    formModalSaveHandler = null;
}

function submitFormModal() {
    if (typeof formModalSaveHandler === "function") {
        formModalSaveHandler();
    }
}

// ===================== DASHBOARD =====================

function getCustomModuleProgress(module) {
    if (!module.items || module.items.length === 0) return 0;

    const completed = module.items.filter(x => x.status === "Completed").length;

    return Math.round((completed / module.items.length) * 100);
}

function updateDashboardStats() {

    let totalItems = 0;
    let completedItems = 0;

    // built-in collections
    totalItems += appData.notes.length;
    totalItems += appData.diary.length;
    totalItems += appData.remember.length;

    // roadmaps -> steps
    appData.roadmaps.forEach(r => {
        const steps = r.steps || [];
        totalItems += steps.length;
        completedItems += steps.filter(s => s.done).length;
    });

    // checklists -> items
    appData.checklists.forEach(c => {
        const items = c.items || [];
        totalItems += items.length;
        completedItems += items.filter(i => i.done).length;
    });

    // topics
    totalItems += appData.topics.length;
    completedItems += appData.topics.filter(t => t.status === "Mastered").length;

    // tasks
    totalItems += appData.tasks.length;
    completedItems += appData.tasks.filter(t => t.status === "Completed").length;

    // goals
    totalItems += appData.goals.length;
    completedItems += appData.goals.filter(g => Number(g.current) >= Number(g.target)).length;

    // custom modules
    let moduleCount = BUILTIN_MODULES.length + appData.customModules.length;

    appData.customModules.forEach(module => {
        if (!module.items) module.items = [];
        totalItems += module.items.length;
        completedItems += module.items.filter(i => i.status === "Completed").length;
    });

    document.getElementById("moduleCount").innerText = moduleCount;
    document.getElementById("itemCount").innerText = totalItems;
    document.getElementById("completedCount").innerText = completedItems;

    const progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
    document.getElementById("overallProgress").innerText = progress + "%";
}

function renderTimeline() {

    const container = document.getElementById("activityTimeline");
    if (!container) return;

    container.innerHTML = "";

    if (appData.activities.length === 0) {
        container.innerHTML = `<div class="card">No activity yet — start adding things!</div>`;
        return;
    }

    appData.activities.slice().reverse().slice(0, 25).forEach(activity => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<p>${escapeHtml(activity.action)}</p><small>${escapeHtml(activity.date)}</small>`;
        container.appendChild(div);
    });
}

function renderUpcomingTasks() {

    const container = document.getElementById("upcomingTasks");
    if (!container) return;

    let items = [];

    appData.tasks.forEach(task => {
        if (task.dueDate && task.status !== "Completed") {
            items.push({ source: "Task", title: task.title, dueDate: task.dueDate, priority: task.priority });
        }
    });

    appData.customModules.forEach(module => {
        (module.items || []).forEach(item => {
            if (item.dueDate && item.status !== "Completed") {
                items.push({ source: module.name, title: item.title, dueDate: item.dueDate, priority: item.priority });
            }
        });
    });

    items.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    container.innerHTML = "";

    if (items.length === 0) {
        container.innerHTML = `<p style="color:var(--ink-soft)">Nothing due — you're all caught up.</p>`;
        return;
    }

    items.slice(0, 8).forEach(item => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <h3>${escapeHtml(item.title)}</h3>
            <p>From: ${escapeHtml(item.source)}</p>
            <p>Due: ${escapeHtml(item.dueDate)} ${item.priority ? '· <span class="badge badge-' + (item.priority || '').toLowerCase() + '">' + item.priority + '</span>' : ''}</p>
        `;
        container.appendChild(div);
    });
}

function renderRecentNotes() {

    const container = document.getElementById("recentNotes");
    if (!container) return;

    container.innerHTML = "";

    if (appData.notes.length === 0) {
        container.innerHTML = `<p style="color:var(--ink-soft)">No notes yet.</p>`;
        return;
    }

    appData.notes.slice().reverse().slice(0, 5).forEach(note => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<h3>${escapeHtml(note.title)}</h3><p>${escapeHtml(truncate(note.content, 120))}</p>`;
        container.appendChild(div);
    });
}

function renderModuleSnapshot() {

    const container = document.getElementById("moduleSnapshot");
    if (!container) return;

    container.innerHTML = "";

    const rows = [
        { label: "Notes", value: appData.notes.length, progress: appData.notes.length ? 100 : 0 },
        { label: "Roadmaps", value: appData.roadmaps.length, progress: avgProgress(appData.roadmaps.map(r => roadmapProgress(r))) },
        { label: "Checklists", value: appData.checklists.length, progress: avgProgress(appData.checklists.map(c => checklistProgress(c))) },
        { label: "Topics to Learn", value: appData.topics.length, progress: appData.topics.length ? Math.round(appData.topics.filter(t => t.status === "Mastered").length / appData.topics.length * 100) : 0 },
        { label: "Questions to Remember", value: appData.remember.length, progress: appData.remember.length ? 100 : 0 },
        { label: "Diary Entries", value: appData.diary.length, progress: appData.diary.length ? 100 : 0 },
        { label: "Tasks", value: appData.tasks.length, progress: appData.tasks.length ? Math.round(appData.tasks.filter(t => t.status === "Completed").length / appData.tasks.length * 100) : 0 },
        { label: "Progress Goals", value: appData.goals.length, progress: avgProgress(appData.goals.map(g => goalProgress(g))) },
        { label: "Custom Modules", value: appData.customModules.length, progress: avgProgress(appData.customModules.map(m => getCustomModuleProgress(m))) }
    ];

    rows.forEach(row => {
        const div = document.createElement("div");
        div.className = "snap-row";
        div.innerHTML = `
            <span class="snap-label">${row.label} (${row.value})</span>
            <div class="progress-bar"><div class="progress-fill" style="width:${row.progress}%"></div></div>
            <span class="snap-val">${row.progress}%</span>
        `;
        container.appendChild(div);
    });
}

function avgProgress(arr) {
    if (arr.length === 0) return 0;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

// ===================== DUE TASK NOTIFICATIONS =====================

function checkDueTasks() {

    if (!("Notification" in window) || Notification.permission !== "granted") {
        return;
    }

    const today = new Date().toISOString().split("T")[0];

    appData.tasks.forEach(task => {
        if (task.dueDate === today && task.status !== "Completed") {
            new Notification("Task Due Today", { body: task.title });
        }
    });

    appData.customModules.forEach(module => {
        (module.items || []).forEach(item => {
            if (item.dueDate === today && item.status !== "Completed") {
                new Notification("Item Due Today", { body: item.title + " (" + module.name + ")" });
            }
        });
    });
}

// ===================== GLOBAL SEARCH =====================

function globalSearch() {

    const query = document.getElementById("globalSearch").value.trim().toLowerCase();
    const results = document.getElementById("searchResults");

    if (!query) {
        results.classList.remove("show");
        results.innerHTML = "";
        return;
    }

    let matches = [];

    appData.notes.forEach(n => {
        if (matchesQuery(query, n.title, n.content, n.tags)) {
            matches.push({ type: "Note", title: n.title, view: "notes" });
        }
    });

    appData.roadmaps.forEach(r => {
        if (matchesQuery(query, r.title, r.description, (r.steps || []).map(s => s.text).join(" "))) {
            matches.push({ type: "Roadmap", title: r.title, view: "roadmaps" });
        }
    });

    appData.checklists.forEach(c => {
        if (matchesQuery(query, c.title, (c.items || []).map(i => i.text).join(" "))) {
            matches.push({ type: "Checklist", title: c.title, view: "checklists" });
        }
    });

    appData.topics.forEach(t => {
        if (matchesQuery(query, t.title, t.description, t.resources)) {
            matches.push({ type: "Topic", title: t.title, view: "topics" });
        }
    });

    appData.remember.forEach(r => {
        if (matchesQuery(query, r.question, r.answer, r.tags)) {
            matches.push({ type: "Remember", title: r.question, view: "remember" });
        }
    });

    appData.diary.forEach(d => {
        if (matchesQuery(query, d.title, d.content)) {
            matches.push({ type: "Diary", title: d.title || d.date, view: "diary" });
        }
    });

    appData.tasks.forEach(t => {
        if (matchesQuery(query, t.title, t.description, t.tags)) {
            matches.push({ type: "Task", title: t.title, view: "tasks" });
        }
    });

    appData.goals.forEach(g => {
        if (matchesQuery(query, g.title)) {
            matches.push({ type: "Goal", title: g.title, view: "goals" });
        }
    });

    appData.customModules.forEach(m => {
        if (matchesQuery(query, m.name)) {
            matches.push({ type: "Module", title: m.name, view: "custom" });
        }
        (m.items || []).forEach(item => {
            if (matchesQuery(query, item.title, item.description, item.tags)) {
                matches.push({ type: m.name, title: item.title, view: "custom" });
            }
        });
    });

    results.innerHTML = "";

    if (matches.length === 0) {
        results.innerHTML = `<div class="search-empty">No matches for "${escapeHtml(query)}"</div>`;
    } else {
        matches.slice(0, 20).forEach(m => {
            const div = document.createElement("div");
            div.className = "search-result-item";
            div.innerHTML = `<div class="sr-type">${escapeHtml(m.type)}</div><div class="sr-title">${escapeHtml(m.title || "(untitled)")}</div>`;
            div.onclick = () => {
                switchView(m.view);
                results.classList.remove("show");
                document.getElementById("globalSearch").value = "";
            };
            results.appendChild(div);
        });
    }

    results.classList.add("show");
}

function matchesQuery(query, ...fields) {
    return fields.some(f => (f || "").toString().toLowerCase().includes(query));
}

document.addEventListener("click", e => {
    const wrap = document.querySelector(".search-wrap");
    if (wrap && !wrap.contains(e.target)) {
        document.getElementById("searchResults").classList.remove("show");
    }
});

// ===================== SHARED HELPERS =====================

function escapeHtml(str) {
    if (str === undefined || str === null) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function truncate(str, n) {
    if (!str) return "";
    return str.length > n ? str.slice(0, n) + "…" : str;
}

function priorityBadge(priority) {
    if (!priority) return "";
    return `<span class="badge badge-${priority.toLowerCase()}">${escapeHtml(priority)}</span>`;
}

function statusBadge(status) {
    if (!status) return "";
    const cls = status.toLowerCase().replace(/\s+/g, "");
    const map = { pending: "pending", inprogress: "progress", completed: "completed", blocked: "blocked", notstarted: "pending", learning: "progress", mastered: "completed" };
    return `<span class="badge badge-${map[cls] || 'pending'}">${escapeHtml(status)}</span>`;
}
