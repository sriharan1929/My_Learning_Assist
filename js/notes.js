// notes.js — Notes module

function renderNotes() {

    const container = document.getElementById("notesList");
    if (!container) return;

    container.innerHTML = "";

    if (appData.notes.length === 0) {
        container.innerHTML = `<div class="card">No notes yet. Click "+ New Note" to write your first one.</div>`;
        return;
    }

    appData.notes.slice().reverse().forEach(note => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
            <h3>${escapeHtml(note.title)}</h3>
            <p>${escapeHtml(truncate(note.content, 220))}</p>
            ${note.tags ? `<p>Tags: ${escapeHtml(note.tags)}</p>` : ""}
            <p style="font-size:.75rem">Updated: ${escapeHtml(note.updatedDate || note.createdDate)}</p>
            <div class="card-actions">
                <button onclick="openNoteModal(${note.id})">Edit</button>
                <button onclick="deleteNote(${note.id})">Delete</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function openNoteModal(id) {

    const note = id ? appData.notes.find(n => n.id === id) : null;

    const body = `
        <label>Title</label>
        <input id="f-note-title" value="${escapeHtml(note ? note.title : "")}" placeholder="Note title">
        <label>Content</label>
        <textarea id="f-note-content" placeholder="Write your note...">${escapeHtml(note ? note.content : "")}</textarea>
        <label>Tags (comma separated)</label>
        <input id="f-note-tags" value="${escapeHtml(note ? note.tags : "")}" placeholder="e.g. javascript, react">
    `;

    openFormModal(note ? "Edit Note" : "New Note", body, () => saveNote(id));
}

async function saveNote(id) {

    const title = document.getElementById("f-note-title").value.trim();
    if (!title) { alert("Title is required."); return; }

    const content = document.getElementById("f-note-content").value;
    const tags = document.getElementById("f-note-tags").value;

    if (id) {
        const note = appData.notes.find(n => n.id === id);
        note.title = title;
        note.content = content;
        note.tags = tags;
        note.updatedDate = nowString();
        logActivity(`Updated Note: ${title}`);
    } else {
        appData.notes.push({
            id: newId(),
            title,
            content,
            tags,
            createdDate: nowString(),
            updatedDate: nowString()
        });
        logActivity(`Added Note: ${title}`);
    }

    await persist();
    closeFormModal();
    renderNotes();
    renderRecentNotes();
    updateDashboardStats();
    renderTimeline();
}

async function deleteNote(id) {

    if (!confirm("Delete this note?")) return;

    const note = appData.notes.find(n => n.id === id);
    appData.notes = appData.notes.filter(n => n.id !== id);

    logActivity(`Deleted Note: ${note ? note.title : ""}`);

    await persist();
    renderNotes();
    renderRecentNotes();
    updateDashboardStats();
    renderTimeline();
}
