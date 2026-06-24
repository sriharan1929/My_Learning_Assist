// goals.js — Progress module (goal tracking with current/target values)

function goalProgress(goal) {
    const target = Number(goal.target) || 0;
    const current = Number(goal.current) || 0;
    if (target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
}

function renderGoals() {

    const container = document.getElementById("goalsList");
    if (!container) return;

    container.innerHTML = "";

    if (appData.goals.length === 0) {
        container.innerHTML = `<div class="card">No goals yet. Track progress toward something measurable — pages read, problems solved, hours studied...</div>`;
        return;
    }

    appData.goals.slice().reverse().forEach(goal => {
        const progress = goalProgress(goal);
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <h3>${escapeHtml(goal.title)}</h3>
            <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
            <p>${goal.current} / ${goal.target} ${escapeHtml(goal.unit || "")} (${progress}%)</p>
            ${goal.deadline ? `<p>Target date: ${escapeHtml(goal.deadline)}</p>` : ""}
            <div class="card-actions">
                <button onclick="adjustGoal(${goal.id}, -1)">−</button>
                <button onclick="adjustGoal(${goal.id}, 1)">+</button>
                <button onclick="openGoalModal(${goal.id})">Edit</button>
                <button onclick="deleteGoal(${goal.id})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openGoalModal(id) {

    const goal = id ? appData.goals.find(g => g.id === id) : null;

    const body = `
        <label>Title</label>
        <input id="f-goal-title" value="${escapeHtml(goal ? goal.title : "")}" placeholder="e.g. Solve DSA problems">
        <label>Current</label>
        <input type="number" id="f-goal-current" value="${goal ? goal.current : 0}">
        <label>Target</label>
        <input type="number" id="f-goal-target" value="${goal ? goal.target : 100}">
        <label>Unit</label>
        <input id="f-goal-unit" value="${escapeHtml(goal ? goal.unit : "")}" placeholder="e.g. problems, pages, hours">
        <label>Target Date (optional)</label>
        <input type="date" id="f-goal-deadline" value="${goal && goal.deadline ? goal.deadline : ""}">
    `;

    openFormModal(goal ? "Edit Goal" : "New Goal", body, () => saveGoal(id));
}

async function saveGoal(id) {

    const title = document.getElementById("f-goal-title").value.trim();
    if (!title) { alert("Title is required."); return; }

    const current = Number(document.getElementById("f-goal-current").value) || 0;
    const target = Number(document.getElementById("f-goal-target").value) || 0;
    const unit = document.getElementById("f-goal-unit").value;
    const deadline = document.getElementById("f-goal-deadline").value;

    if (id) {
        const goal = appData.goals.find(g => g.id === id);
        goal.title = title;
        goal.current = current;
        goal.target = target;
        goal.unit = unit;
        goal.deadline = deadline;
        logActivity(`Updated Goal: ${title}`);
    } else {
        appData.goals.push({
            id: newId(),
            title,
            current,
            target,
            unit,
            deadline,
            createdDate: nowString()
        });
        logActivity(`Added Goal: ${title}`);
    }

    await persist();
    closeFormModal();
    renderGoals();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}

async function adjustGoal(id, delta) {

    const goal = appData.goals.find(g => g.id === id);
    goal.current = Math.max(0, (Number(goal.current) || 0) + delta);

    if (goalProgress(goal) === 100 && delta > 0) {
        logActivity(`Reached Goal: ${goal.title} 🎉`);
    }

    await persist();
    renderGoals();
    updateDashboardStats();
    renderModuleSnapshot();
}

async function deleteGoal(id) {

    if (!confirm("Delete this goal?")) return;

    const goal = appData.goals.find(g => g.id === id);
    appData.goals = appData.goals.filter(g => g.id !== id);

    logActivity(`Deleted Goal: ${goal ? goal.title : ""}`);

    await persist();
    renderGoals();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}
