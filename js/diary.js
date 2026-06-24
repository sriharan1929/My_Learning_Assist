// diary.js — Diary module (dated journal entries)

const DIARY_MOODS = [
    { value: "", label: "No mood" },
    { value: "🙂", label: "🙂 Good" },
    { value: "😐", label: "😐 Neutral" },
    { value: "😞", label: "😞 Tough" },
    { value: "🔥", label: "🔥 Productive" },
    { value: "😴", label: "😴 Tired" }
];

function renderDiary() {

    const container = document.getElementById("diaryList");
    if (!container) return;

    container.innerHTML = "";

    if (appData.diary.length === 0) {
        container.innerHTML = `<div class="card">No diary entries yet. Reflect on today's learning.</div>`;
        return;
    }

    const sorted = appData.diary.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach(entry => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <h3>${entry.mood ? entry.mood + " " : ""}${escapeHtml(entry.title || entry.date)}</h3>
            <p style="font-family:var(--font-mono);font-size:.75rem">${escapeHtml(entry.date)}</p>
            <p>${escapeHtml(entry.content)}</p>
            <div class="card-actions">
                <button onclick="openDiaryModal(${entry.id})">Edit</button>
                <button onclick="deleteDiary(${entry.id})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openDiaryModal(id) {

    const entry = id ? appData.diary.find(d => d.id === id) : null;
    const today = new Date().toISOString().split("T")[0];

    const body = `
        <label>Date</label>
        <input type="date" id="f-diary-date" value="${entry ? entry.date : today}">
        <label>Title</label>
        <input id="f-diary-title" value="${escapeHtml(entry ? entry.title : "")}" placeholder="e.g. Finished Chapter 4">
        <label>Mood</label>
        <select id="f-diary-mood">
            ${DIARY_MOODS.map(m => `<option value="${m.value}" ${entry && entry.mood === m.value ? "selected" : ""}>${m.label}</option>`).join("")}
        </select>
        <label>Entry</label>
        <textarea id="f-diary-content" placeholder="What did you learn or work on today?">${escapeHtml(entry ? entry.content : "")}</textarea>
    `;

    openFormModal(entry ? "Edit Diary Entry" : "New Diary Entry", body, () => saveDiary(id));
}

async function saveDiary(id) {

    const date = document.getElementById("f-diary-date").value;
    if (!date) { alert("Date is required."); return; }

    const title = document.getElementById("f-diary-title").value;
    const mood = document.getElementById("f-diary-mood").value;
    const content = document.getElementById("f-diary-content").value;

    if (id) {
        const entry = appData.diary.find(d => d.id === id);
        entry.date = date;
        entry.title = title;
        entry.mood = mood;
        entry.content = content;
        logActivity(`Updated Diary entry: ${title || date}`);
    } else {
        appData.diary.push({
            id: newId(),
            date,
            title,
            mood,
            content,
            createdDate: nowString()
        });
        logActivity(`Added Diary entry: ${title || date}`);
    }

    await persist();
    closeFormModal();
    renderDiary();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}

async function deleteDiary(id) {

    if (!confirm("Delete this diary entry?")) return;

    const entry = appData.diary.find(d => d.id === id);
    appData.diary = appData.diary.filter(d => d.id !== id);

    logActivity(`Deleted Diary entry: ${entry ? (entry.title || entry.date) : ""}`);

    await persist();
    renderDiary();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}
