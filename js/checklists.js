// checklists.js — Checklists module (repeatable / one-off task lists)

let currentChecklistId = null;

function checklistProgress(checklist) {
    const items = checklist.items || [];
    if (items.length === 0) return 0;
    return Math.round((items.filter(i => i.done).length / items.length) * 100);
}

function renderChecklists() {

    const container = document.getElementById("checklistsList");
    if (!container) return;

    container.innerHTML = "";

    if (appData.checklists.length === 0) {
        container.innerHTML = `<div class="card">No checklists yet. Create one to track repeatable steps.</div>`;
        return;
    }

    appData.checklists.slice().reverse().forEach(checklist => {
        const progress = checklistProgress(checklist);
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <h3 style="cursor:pointer" onclick="openChecklistDetail(${checklist.id})">${escapeHtml(checklist.title)}</h3>
            <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
            <p>${progress}% complete · ${(checklist.items || []).length} items</p>
            <div class="card-actions">
                <button onclick="openChecklistDetail(${checklist.id})">Open</button>
                <button onclick="openChecklistModal(${checklist.id})">Edit</button>
                <button onclick="deleteChecklist(${checklist.id})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openChecklistModal(id) {

    const checklist = id ? appData.checklists.find(c => c.id === id) : null;

    const body = `
        <label>Title</label>
        <input id="f-checklist-title" value="${escapeHtml(checklist ? checklist.title : "")}" placeholder="e.g. Pre-Exam Checklist">
    `;

    openFormModal(checklist ? "Edit Checklist" : "New Checklist", body, () => saveChecklist(id));
}

async function saveChecklist(id) {

    const title = document.getElementById("f-checklist-title").value.trim();
    if (!title) { alert("Title is required."); return; }

    if (id) {
        const checklist = appData.checklists.find(c => c.id === id);
        checklist.title = title;
        logActivity(`Updated Checklist: ${title}`);
    } else {
        appData.checklists.push({
            id: newId(),
            title,
            items: [],
            createdDate: nowString()
        });
        logActivity(`Created Checklist: ${title}`);
    }

    await persist();
    closeFormModal();
    renderChecklists();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}

async function deleteChecklist(id) {

    if (!confirm("Delete this checklist and all its items?")) return;

    const checklist = appData.checklists.find(c => c.id === id);
    appData.checklists = appData.checklists.filter(c => c.id !== id);

    logActivity(`Deleted Checklist: ${checklist ? checklist.title : ""}`);

    await persist();
    renderChecklists();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}

// ----- Detail view: manage checklist items -----

function openChecklistDetail(id) {

    currentChecklistId = id;

    document.getElementById("checklistsList-wrap").style.display = "none";
    const detail = document.getElementById("checklistDetail");
    detail.style.display = "block";

    renderChecklistDetail();
}

function closeChecklistDetail() {
    currentChecklistId = null;
    const wrap = document.getElementById("checklistsList-wrap");
    const detail = document.getElementById("checklistDetail");
    if (wrap) wrap.style.display = "block";
    if (detail) detail.style.display = "none";
}

function renderChecklistDetail() {

    const checklist = appData.checklists.find(c => c.id === currentChecklistId);
    const detail = document.getElementById("checklistDetail");

    if (!checklist) { closeChecklistDetail(); return; }

    const progress = checklistProgress(checklist);
    const items = checklist.items || [];

    let itemsHtml = items.map(item => `
        <div class="checklist-item-row ${item.done ? 'done' : ''}">
            <input type="checkbox" ${item.done ? "checked" : ""} onchange="toggleChecklistItem(${item.id})">
            <span class="step-text">${escapeHtml(item.text)}</span>
            <button onclick="deleteChecklistItem(${item.id})">Remove</button>
        </div>
    `).join("");

    if (items.length === 0) {
        itemsHtml = `<p style="color:var(--ink-soft)">No items yet — add the first one below.</p>`;
    }

    detail.innerHTML = `
        <button class="back-btn" onclick="closeChecklistDetail()">← Back to Checklists</button>
        <div class="view-head">
            <div>
                <h1>${escapeHtml(checklist.title)}</h1>
            </div>
        </div>
        <div class="card">
            <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
            <p>${progress}% complete · ${items.filter(i=>i.done).length}/${items.length} items done</p>
            ${itemsHtml}
            <div class="add-step-row">
                <input id="newChecklistItemInput" placeholder="Add an item..." onkeydown="if(event.key==='Enter') addChecklistItem()">
                <button class="btn-primary" onclick="addChecklistItem()">Add Item</button>
            </div>
        </div>
    `;
}

async function addChecklistItem() {

    const input = document.getElementById("newChecklistItemInput");
    const text = input.value.trim();
    if (!text) return;

    const checklist = appData.checklists.find(c => c.id === currentChecklistId);
    if (!checklist.items) checklist.items = [];

    checklist.items.push({ id: newId(), text, done: false });

    logActivity(`Added item to Checklist "${checklist.title}": ${text}`);

    await persist();
    renderChecklistDetail();
    renderChecklists();
    updateDashboardStats();
    renderModuleSnapshot();
}

async function toggleChecklistItem(itemId) {

    const checklist = appData.checklists.find(c => c.id === currentChecklistId);
    const item = checklist.items.find(i => i.id === itemId);
    item.done = !item.done;

    logActivity(`${item.done ? "Checked off" : "Unchecked"} "${item.text}" in "${checklist.title}"`);

    await persist();
    renderChecklistDetail();
    renderChecklists();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}

async function deleteChecklistItem(itemId) {

    const checklist = appData.checklists.find(c => c.id === currentChecklistId);
    checklist.items = checklist.items.filter(i => i.id !== itemId);

    await persist();
    renderChecklistDetail();
    renderChecklists();
    updateDashboardStats();
    renderModuleSnapshot();
}
