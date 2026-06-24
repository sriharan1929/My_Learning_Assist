// modules.js — Custom Modules (free-form items, the original generic system)

let currentModuleId = null;
let editItemId = null;

const ITEM_TYPES = ["Note", "Roadmap", "Checklist", "Remember", "Topic", "Diary", "Task", "Other"];

function renderModules() {

    const container = document.getElementById("modulesContainer");
    if (!container) return;

    container.innerHTML = "";

    if (appData.customModules.length === 0) {
        container.innerHTML = `<div class="card">No custom modules yet. Create one for anything that doesn't fit the built-in sections.</div>`;
        return;
    }

    appData.customModules.forEach(module => {
        if (!module.items) module.items = [];

        const progress = getCustomModuleProgress(module);

        const div = document.createElement("div");
        div.className = "card module";
        div.innerHTML = `
            <h3 style="cursor:pointer" onclick="openModuleDetail(${module.id})">${escapeHtml(module.name)}</h3>
            <p>Created: ${escapeHtml(module.createdDate)}</p>
            <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
            <p>${progress}% complete · ${module.items.length} items</p>
            <div class="card-actions">
                <button onclick="openModuleDetail(${module.id})">Open</button>
                <button onclick="editModule(${module.id})">Rename</button>
                <button onclick="deleteModule(${module.id})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

async function createModule() {

    const moduleName = prompt("Module Name");
    if (!moduleName) return;

    appData.customModules.push({
        id: newId(),
        name: moduleName,
        createdDate: nowString(),
        items: []
    });

    logActivity(`Created Module: ${moduleName}`);

    await persist();
    renderModules();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}

async function editModule(id) {

    const module = appData.customModules.find(x => x.id === id);
    const newName = prompt("Module Name", module.name);
    if (!newName) return;

    module.name = newName;

    logActivity(`Renamed Module to: ${newName}`);

    await persist();
    renderModules();
    if (currentModuleId === id) renderModuleDetail();
    renderTimeline();
}

async function deleteModule(id) {

    if (!confirm("Delete Module and all its items?")) return;

    const module = appData.customModules.find(x => x.id === id);
    appData.customModules = appData.customModules.filter(x => x.id !== id);

    logActivity(`Deleted Module: ${module ? module.name : ""}`);

    await persist();

    if (currentModuleId === id) closeModuleDetail();

    renderModules();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}

// ----- Detail view -----

function openModuleDetail(id) {

    currentModuleId = id;

    document.getElementById("customList-wrap").style.display = "none";
    const detail = document.getElementById("moduleDetail");
    detail.style.display = "block";

    renderModuleDetail();
}

function closeModuleDetail() {
    currentModuleId = null;

    const wrap = document.getElementById("customList-wrap");
    const detail = document.getElementById("moduleDetail");
    if (wrap) wrap.style.display = "block";
    if (detail) detail.style.display = "none";
}

function renderModuleDetail(searchTerm) {

    const module = appData.customModules.find(x => x.id === currentModuleId);
    const detail = document.getElementById("moduleDetail");

    if (!module) { closeModuleDetail(); return; }

    if (!module.items) module.items = [];

    const search = (searchTerm !== undefined ? searchTerm : (document.getElementById("moduleSearchBox")?.value || "")).toLowerCase();

    const filtered = module.items.filter(item =>
        (item.title || "").toLowerCase().includes(search) ||
        (item.description || "").toLowerCase().includes(search) ||
        (item.tags || "").toLowerCase().includes(search)
    );

    let itemsHtml = filtered.map(item => `
        <div class="card">
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
            <p>Type: ${escapeHtml(item.type)} · ${statusBadge(item.status)} ${priorityBadge(item.priority)}</p>
            <p>Due: ${escapeHtml(item.dueDate || "-")} · Tags: ${escapeHtml(item.tags || "-")}</p>
            <div class="card-actions">
                <button onclick="openModuleItemModal(${item.id})">Edit</button>
                <button onclick="deleteModuleItem(${item.id})">Delete</button>
            </div>
        </div>
    `).join("");

    if (filtered.length === 0) {
        itemsHtml = `<div class="card">No items ${search ? "match your search" : "yet"}.</div>`;
    }

    const progress = getCustomModuleProgress(module);

    detail.innerHTML = `
        <button class="back-btn" onclick="closeModuleDetail()">← Back to Custom Modules</button>
        <div class="view-head">
            <div>
                <h1>${escapeHtml(module.name)}</h1>
                <p class="view-sub">${progress}% complete · ${module.items.length} items</p>
            </div>
            <button class="btn-primary" onclick="openModuleItemModal()">+ Add Item</button>
        </div>
        <div class="progress-bar" style="margin-bottom:16px;"><div class="progress-fill" style="width:${progress}%"></div></div>
        <input id="moduleSearchBox" placeholder="Search items in this module..." style="margin-bottom:16px" oninput="renderModuleDetail(this.value)" value="${escapeHtml(search)}">
        <div class="card-grid">${itemsHtml}</div>
    `;
}

function openModuleItemModal(itemId) {

    const module = appData.customModules.find(x => x.id === currentModuleId);
    const item = itemId ? module.items.find(x => x.id === itemId) : null;

    editItemId = itemId || null;

    const body = `
        <label>Title</label>
        <input id="f-item-title" value="${escapeHtml(item ? item.title : "")}" placeholder="Item title">
        <label>Description</label>
        <textarea id="f-item-description" placeholder="Description">${escapeHtml(item ? item.description : "")}</textarea>
        <label>Type</label>
        <select id="f-item-type">
            ${ITEM_TYPES.map(t => `<option ${item && item.type === t ? "selected" : ""}>${t}</option>`).join("")}
        </select>
        <label>Status</label>
        <select id="f-item-status">
            <option ${!item || item.status === "Pending" ? "selected" : ""}>Pending</option>
            <option ${item && item.status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option ${item && item.status === "Completed" ? "selected" : ""}>Completed</option>
            <option ${item && item.status === "Blocked" ? "selected" : ""}>Blocked</option>
        </select>
        <label>Priority</label>
        <select id="f-item-priority">
            <option ${item && item.priority === "Low" ? "selected" : ""}>Low</option>
            <option ${!item || item.priority === "Medium" ? "selected" : ""}>Medium</option>
            <option ${item && item.priority === "High" ? "selected" : ""}>High</option>
        </select>
        <label>Due Date</label>
        <input type="date" id="f-item-dueDate" value="${item && item.dueDate ? item.dueDate : ""}">
        <label>Tags</label>
        <input id="f-item-tags" value="${escapeHtml(item ? item.tags : "")}" placeholder="comma separated tags">
    `;

    openFormModal(item ? "Edit Item" : "Add Item", body, saveModuleItem);
}

async function saveModuleItem() {

    const module = appData.customModules.find(x => x.id === currentModuleId);
    if (!module.items) module.items = [];

    const title = document.getElementById("f-item-title").value.trim();
    if (!title) { alert("Title is required."); return; }

    const item = {
        id: editItemId || newId(),
        title,
        description: document.getElementById("f-item-description").value,
        type: document.getElementById("f-item-type").value,
        status: document.getElementById("f-item-status").value,
        priority: document.getElementById("f-item-priority").value,
        dueDate: document.getElementById("f-item-dueDate").value,
        tags: document.getElementById("f-item-tags").value,
        createdDate: nowString()
    };

    if (editItemId) {
        const index = module.items.findIndex(x => x.id === editItemId);
        item.createdDate = module.items[index].createdDate;
        module.items[index] = item;
        logActivity(`Updated Item: ${title}`);
    } else {
        module.items.push(item);
        logActivity(`Added Item: ${title}`);
    }

    await persist();
    closeFormModal();
    renderModuleDetail();
    renderModules();
    updateDashboardStats();
    renderModuleSnapshot();
    renderUpcomingTasks();
    renderTimeline();
}

async function deleteModuleItem(itemId) {

    const module = appData.customModules.find(x => x.id === currentModuleId);
    module.items = module.items.filter(x => x.id !== itemId);

    logActivity("Deleted Item");

    await persist();
    renderModuleDetail();
    renderModules();
    updateDashboardStats();
    renderModuleSnapshot();
    renderUpcomingTasks();
    renderTimeline();
}
