// topics.js — Topics to Learn module (learning backlog board)

const TOPIC_STATUSES = ["Not Started", "Learning", "Mastered"];

function renderTopics() {

    TOPIC_STATUSES.forEach(status => {
        const container = document.getElementById("topics-" + status.replace(/\s+/g, "-"));
        if (container) container.innerHTML = "";
    });

    if (appData.topics.length === 0) {
        const firstCol = document.getElementById("topics-Not-Started");
        if (firstCol) firstCol.innerHTML = `<p style="color:var(--ink-soft);font-size:.85rem">No topics yet.</p>`;
        return;
    }

    appData.topics.slice().reverse().forEach(topic => {
        const container = document.getElementById("topics-" + topic.status.replace(/\s+/g, "-"));
        if (!container) return;

        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <h3>${escapeHtml(topic.title)}</h3>
            ${topic.priority ? priorityBadge(topic.priority) : ""}
            <p>${escapeHtml(truncate(topic.description, 110))}</p>
            ${topic.resources ? `<p>Resources: ${escapeHtml(truncate(topic.resources, 80))}</p>` : ""}
            <label style="margin-top:10px">Move to</label>
            <select onchange="moveTopicStatus(${topic.id}, this.value)">
                ${TOPIC_STATUSES.map(s => `<option value="${s}" ${s === topic.status ? "selected" : ""}>${s}</option>`).join("")}
            </select>
            <div class="card-actions">
                <button onclick="openTopicModal(${topic.id})">Edit</button>
                <button onclick="deleteTopic(${topic.id})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openTopicModal(id) {

    const topic = id ? appData.topics.find(t => t.id === id) : null;

    const body = `
        <label>Title</label>
        <input id="f-topic-title" value="${escapeHtml(topic ? topic.title : "")}" placeholder="e.g. GraphQL Basics">
        <label>Description / Notes</label>
        <textarea id="f-topic-description" placeholder="What do you want to learn?">${escapeHtml(topic ? topic.description : "")}</textarea>
        <label>Resources (links, books, courses)</label>
        <input id="f-topic-resources" value="${escapeHtml(topic ? topic.resources : "")}" placeholder="e.g. official docs, YouTube playlist">
        <label>Status</label>
        <select id="f-topic-status">
            ${TOPIC_STATUSES.map(s => `<option value="${s}" ${topic && topic.status === s ? "selected" : ""}>${s}</option>`).join("")}
        </select>
        <label>Priority</label>
        <select id="f-topic-priority">
            <option ${topic && topic.priority === "Low" ? "selected" : ""}>Low</option>
            <option ${!topic || topic.priority === "Medium" ? "selected" : ""}>Medium</option>
            <option ${topic && topic.priority === "High" ? "selected" : ""}>High</option>
        </select>
    `;

    openFormModal(topic ? "Edit Topic" : "New Topic", body, () => saveTopic(id));
}

async function saveTopic(id) {

    const title = document.getElementById("f-topic-title").value.trim();
    if (!title) { alert("Title is required."); return; }

    const description = document.getElementById("f-topic-description").value;
    const resources = document.getElementById("f-topic-resources").value;
    const status = document.getElementById("f-topic-status").value;
    const priority = document.getElementById("f-topic-priority").value;

    if (id) {
        const topic = appData.topics.find(t => t.id === id);
        topic.title = title;
        topic.description = description;
        topic.resources = resources;
        topic.status = status;
        topic.priority = priority;
        logActivity(`Updated Topic: ${title}`);
    } else {
        appData.topics.push({
            id: newId(),
            title,
            description,
            resources,
            status,
            priority,
            createdDate: nowString()
        });
        logActivity(`Added Topic: ${title}`);
    }

    await persist();
    closeFormModal();
    renderTopics();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}

async function moveTopicStatus(id, status) {

    const topic = appData.topics.find(t => t.id === id);
    topic.status = status;

    logActivity(`Moved Topic "${topic.title}" to ${status}`);

    await persist();
    renderTopics();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}

async function deleteTopic(id) {

    if (!confirm("Delete this topic?")) return;

    const topic = appData.topics.find(t => t.id === id);
    appData.topics = appData.topics.filter(t => t.id !== id);

    logActivity(`Deleted Topic: ${topic ? topic.title : ""}`);

    await persist();
    renderTopics();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}
