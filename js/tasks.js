// tasks.js — Tasks module

let currentTaskFilter = "All";

function setTaskFilter(filter) {
    currentTaskFilter = filter;

    document.querySelectorAll("#taskFilters .filter-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.filter === filter);
    });

    renderTasks();
}

function renderTasks() {

    const container = document.getElementById("tasksList");
    if (!container) return;

    container.innerHTML = "";

    let tasks = appData.tasks.slice();

    if (currentTaskFilter !== "All") {
        tasks = tasks.filter(t => t.status === currentTaskFilter);
    }

    // sort: pending/in-progress with due dates first, then by due date
    tasks.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
    });

    if (tasks.length === 0) {
        container.innerHTML = `<div class="card">No tasks${currentTaskFilter !== "All" ? " with status \"" + currentTaskFilter + "\"" : ""}.</div>`;
        return;
    }

    tasks.forEach(task => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <h3>
                <input type="checkbox" ${task.status === "Completed" ? "checked" : ""} onchange="toggleTaskComplete(${task.id})">
                ${escapeHtml(task.title)}
            </h3>
            <p>${escapeHtml(truncate(task.description, 140))}</p>
            <p>${statusBadge(task.status)} ${priorityBadge(task.priority)}</p>
            ${task.dueDate ? `<p>Due: ${escapeHtml(task.dueDate)}</p>` : ""}
            <div class="card-actions">
                <button onclick="openTaskModal(${task.id})">Edit</button>
                <button onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openTaskModal(id) {

    const task = id ? appData.tasks.find(t => t.id === id) : null;

    const body = `
        <label>Title</label>
        <input id="f-task-title" value="${escapeHtml(task ? task.title : "")}" placeholder="e.g. Finish lab assignment">
        <label>Description</label>
        <textarea id="f-task-description" placeholder="Details...">${escapeHtml(task ? task.description : "")}</textarea>
        <label>Status</label>
        <select id="f-task-status">
            <option ${!task || task.status === "Pending" ? "selected" : ""}>Pending</option>
            <option ${task && task.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option ${task && task.status === "Completed" ? "selected" : ""}>Completed</option>
            <option ${task && task.status === "Blocked" ? "selected" : ""}>Blocked</option>
        </select>
        <label>Priority</label>
        <select id="f-task-priority">
            <option ${task && task.priority === "Low" ? "selected" : ""}>Low</option>
            <option ${!task || task.priority === "Medium" ? "selected" : ""}>Medium</option>
            <option ${task && task.priority === "High" ? "selected" : ""}>High</option>
        </select>
        <label>Due Date</label>
        <input type="date" id="f-task-dueDate" value="${task && task.dueDate ? task.dueDate : ""}">
        <label>Tags</label>
        <input id="f-task-tags" value="${escapeHtml(task ? task.tags : "")}" placeholder="optional tags">
    `;

    openFormModal(task ? "Edit Task" : "New Task", body, () => saveTask(id));
}

async function saveTask(id) {

    const title = document.getElementById("f-task-title").value.trim();
    if (!title) { alert("Title is required."); return; }

    const description = document.getElementById("f-task-description").value;
    const status = document.getElementById("f-task-status").value;
    const priority = document.getElementById("f-task-priority").value;
    const dueDate = document.getElementById("f-task-dueDate").value;
    const tags = document.getElementById("f-task-tags").value;

    if (id) {
        const task = appData.tasks.find(t => t.id === id);
        task.title = title;
        task.description = description;
        task.status = status;
        task.priority = priority;
        task.dueDate = dueDate;
        task.tags = tags;
        logActivity(`Updated Task: ${title}`);
    } else {
        appData.tasks.push({
            id: newId(),
            title,
            description,
            status,
            priority,
            dueDate,
            tags,
            createdDate: nowString()
        });
        logActivity(`Added Task: ${title}`);
    }

    await persist();
    closeFormModal();
    renderTasks();
    updateDashboardStats();
    renderModuleSnapshot();
    renderUpcomingTasks();
    renderTimeline();
}

async function toggleTaskComplete(id) {

    const task = appData.tasks.find(t => t.id === id);
    task.status = task.status === "Completed" ? "Pending" : "Completed";

    logActivity(`${task.status === "Completed" ? "Completed" : "Reopened"} Task: ${task.title}`);

    await persist();
    renderTasks();
    updateDashboardStats();
    renderModuleSnapshot();
    renderUpcomingTasks();
    renderTimeline();
}

async function deleteTask(id) {

    if (!confirm("Delete this task?")) return;

    const task = appData.tasks.find(t => t.id === id);
    appData.tasks = appData.tasks.filter(t => t.id !== id);

    logActivity(`Deleted Task: ${task ? task.title : ""}`);

    await persist();
    renderTasks();
    updateDashboardStats();
    renderModuleSnapshot();
    renderUpcomingTasks();
    renderTimeline();
}
