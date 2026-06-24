// roadmaps.js — Roadmaps module (multi-step learning paths)

let currentRoadmapId = null;

function roadmapProgress(roadmap) {
    const steps = roadmap.steps || [];
    if (steps.length === 0) return 0;
    return Math.round((steps.filter(s => s.done).length / steps.length) * 100);
}

function renderRoadmaps() {

    const container = document.getElementById("roadmapsList");
    if (!container) return;

    container.innerHTML = "";

    if (appData.roadmaps.length === 0) {
        container.innerHTML = `<div class="card">No roadmaps yet. Plan your first learning path.</div>`;
        return;
    }

    appData.roadmaps.slice().reverse().forEach(roadmap => {
        const progress = roadmapProgress(roadmap);
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <h3 style="cursor:pointer" onclick="openRoadmapDetail(${roadmap.id})">${escapeHtml(roadmap.title)}</h3>
            <p>${escapeHtml(truncate(roadmap.description, 140))}</p>
            <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
            <p>${progress}% complete · ${(roadmap.steps || []).length} steps</p>
            <div class="card-actions">
                <button onclick="openRoadmapDetail(${roadmap.id})">Open</button>
                <button onclick="openRoadmapModal(${roadmap.id})">Edit</button>
                <button onclick="deleteRoadmap(${roadmap.id})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openRoadmapModal(id) {

    const roadmap = id ? appData.roadmaps.find(r => r.id === id) : null;

    const body = `
        <label>Title</label>
        <input id="f-roadmap-title" value="${escapeHtml(roadmap ? roadmap.title : "")}" placeholder="e.g. Become a Backend Developer">
        <label>Description</label>
        <textarea id="f-roadmap-description" placeholder="What is this roadmap for?">${escapeHtml(roadmap ? roadmap.description : "")}</textarea>
    `;

    openFormModal(roadmap ? "Edit Roadmap" : "New Roadmap", body, () => saveRoadmap(id));
}

async function saveRoadmap(id) {

    const title = document.getElementById("f-roadmap-title").value.trim();
    if (!title) { alert("Title is required."); return; }

    const description = document.getElementById("f-roadmap-description").value;

    if (id) {
        const roadmap = appData.roadmaps.find(r => r.id === id);
        roadmap.title = title;
        roadmap.description = description;
        logActivity(`Updated Roadmap: ${title}`);
    } else {
        appData.roadmaps.push({
            id: newId(),
            title,
            description,
            steps: [],
            createdDate: nowString()
        });
        logActivity(`Created Roadmap: ${title}`);
    }

    await persist();
    closeFormModal();
    renderRoadmaps();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}

async function deleteRoadmap(id) {

    if (!confirm("Delete this roadmap and all its steps?")) return;

    const roadmap = appData.roadmaps.find(r => r.id === id);
    appData.roadmaps = appData.roadmaps.filter(r => r.id !== id);

    logActivity(`Deleted Roadmap: ${roadmap ? roadmap.title : ""}`);

    await persist();
    renderRoadmaps();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}

// ----- Detail view: manage steps -----

function openRoadmapDetail(id) {

    currentRoadmapId = id;

    document.getElementById("roadmapsList-wrap").style.display = "none";
    const detail = document.getElementById("roadmapDetail");
    detail.style.display = "block";

    renderRoadmapDetail();
}

function closeRoadmapDetail() {
    currentRoadmapId = null;
    const wrap = document.getElementById("roadmapsList-wrap");
    const detail = document.getElementById("roadmapDetail");
    if (wrap) wrap.style.display = "block";
    if (detail) detail.style.display = "none";
}

function renderRoadmapDetail() {

    const roadmap = appData.roadmaps.find(r => r.id === currentRoadmapId);
    const detail = document.getElementById("roadmapDetail");

    if (!roadmap) { closeRoadmapDetail(); return; }

    const progress = roadmapProgress(roadmap);
    const steps = roadmap.steps || [];

    let stepsHtml = steps.map((step, idx) => `
        <div class="step-row ${step.done ? 'done' : ''}">
            <input type="checkbox" ${step.done ? "checked" : ""} onchange="toggleRoadmapStep(${step.id})">
            <span class="step-text">${idx + 1}. ${escapeHtml(step.text)}</span>
            <button onclick="deleteRoadmapStep(${step.id})">Remove</button>
        </div>
    `).join("");

    if (steps.length === 0) {
        stepsHtml = `<p style="color:var(--ink-soft)">No steps yet — add the first milestone below.</p>`;
    }

    detail.innerHTML = `
        <button class="back-btn" onclick="closeRoadmapDetail()">← Back to Roadmaps</button>
        <div class="view-head">
            <div>
                <h1>${escapeHtml(roadmap.title)}</h1>
                <p class="view-sub">${escapeHtml(roadmap.description || "")}</p>
            </div>
        </div>
        <div class="card">
            <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
            <p>${progress}% complete · ${steps.filter(s=>s.done).length}/${steps.length} steps done</p>
            ${stepsHtml}
            <div class="add-step-row">
                <input id="newStepInput" placeholder="Add a milestone / step..." onkeydown="if(event.key==='Enter') addRoadmapStep()">
                <button class="btn-primary" onclick="addRoadmapStep()">Add Step</button>
            </div>
        </div>
    `;
}

async function addRoadmapStep() {

    const input = document.getElementById("newStepInput");
    const text = input.value.trim();
    if (!text) return;

    const roadmap = appData.roadmaps.find(r => r.id === currentRoadmapId);
    if (!roadmap.steps) roadmap.steps = [];

    roadmap.steps.push({ id: newId(), text, done: false });

    logActivity(`Added step to Roadmap "${roadmap.title}": ${text}`);

    await persist();
    renderRoadmapDetail();
    renderRoadmaps();
    updateDashboardStats();
    renderModuleSnapshot();
}

async function toggleRoadmapStep(stepId) {

    const roadmap = appData.roadmaps.find(r => r.id === currentRoadmapId);
    const step = roadmap.steps.find(s => s.id === stepId);
    step.done = !step.done;

    logActivity(`${step.done ? "Completed" : "Reopened"} step "${step.text}" in Roadmap "${roadmap.title}"`);

    await persist();
    renderRoadmapDetail();
    renderRoadmaps();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}

async function deleteRoadmapStep(stepId) {

    const roadmap = appData.roadmaps.find(r => r.id === currentRoadmapId);
    roadmap.steps = roadmap.steps.filter(s => s.id !== stepId);

    await persist();
    renderRoadmapDetail();
    renderRoadmaps();
    updateDashboardStats();
    renderModuleSnapshot();
}
