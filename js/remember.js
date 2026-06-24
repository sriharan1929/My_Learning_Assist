// remember.js — Questions to Remember module (flashcards)

function renderRemember() {

    const container = document.getElementById("rememberList");
    if (!container) return;

    container.innerHTML = "";

    if (appData.remember.length === 0) {
        container.innerHTML = `<div class="card">No flashcards yet. Add a question you want to remember.</div>`;
        return;
    }

    appData.remember.slice().reverse().forEach(card => {
        const div = document.createElement("div");
        div.className = "flashcard";
        div.dataset.id = card.id;
        div.dataset.flipped = "false";

        div.innerHTML = `
            <div class="fc-label">Question</div>
            <div class="fc-text fc-front">${escapeHtml(card.question)}</div>
            ${card.tags ? `<p style="margin-top:8px">Tags: ${escapeHtml(card.tags)}</p>` : ""}
            <div class="fc-hint">Click to reveal answer</div>
            <div class="card-actions">
                <button onclick="event.stopPropagation(); openRememberModal(${card.id})">Edit</button>
                <button onclick="event.stopPropagation(); deleteRemember(${card.id})">Delete</button>
            </div>
        `;

        div.addEventListener("click", () => flipFlashcard(card.id));

        container.appendChild(div);
    });
}

function flipFlashcard(id) {

    const card = appData.remember.find(c => c.id === id);
    const el = document.querySelector(`.flashcard[data-id="${id}"]`);
    if (!el || !card) return;

    const flipped = el.dataset.flipped === "true";
    el.dataset.flipped = flipped ? "false" : "true";
    el.classList.toggle("flipped", !flipped);

    const front = el.querySelector(".fc-front");
    const label = el.querySelector(".fc-label");
    const hint = el.querySelector(".fc-hint");

    if (!flipped) {
        label.innerText = "Answer";
        front.innerText = card.answer || "(no answer set)";
        hint.innerText = "Click to show question";
    } else {
        label.innerText = "Question";
        front.innerText = card.question;
        hint.innerText = "Click to reveal answer";
    }
}

function openRememberModal(id) {

    const card = id ? appData.remember.find(c => c.id === id) : null;

    const body = `
        <label>Question</label>
        <textarea id="f-remember-question" placeholder="What do you want to be quizzed on?">${escapeHtml(card ? card.question : "")}</textarea>
        <label>Answer</label>
        <textarea id="f-remember-answer" placeholder="The answer">${escapeHtml(card ? card.answer : "")}</textarea>
        <label>Tags (comma separated)</label>
        <input id="f-remember-tags" value="${escapeHtml(card ? card.tags : "")}" placeholder="e.g. interview, syntax">
    `;

    openFormModal(card ? "Edit Flashcard" : "New Flashcard", body, () => saveRemember(id));
}

async function saveRemember(id) {

    const question = document.getElementById("f-remember-question").value.trim();
    if (!question) { alert("Question is required."); return; }

    const answer = document.getElementById("f-remember-answer").value;
    const tags = document.getElementById("f-remember-tags").value;

    if (id) {
        const card = appData.remember.find(c => c.id === id);
        card.question = question;
        card.answer = answer;
        card.tags = tags;
        logActivity(`Updated flashcard: ${question}`);
    } else {
        appData.remember.push({
            id: newId(),
            question,
            answer,
            tags,
            createdDate: nowString()
        });
        logActivity(`Added flashcard: ${question}`);
    }

    await persist();
    closeFormModal();
    renderRemember();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}

async function deleteRemember(id) {

    if (!confirm("Delete this flashcard?")) return;

    const card = appData.remember.find(c => c.id === id);
    appData.remember = appData.remember.filter(c => c.id !== id);

    logActivity(`Deleted flashcard: ${card ? card.question : ""}`);

    await persist();
    renderRemember();
    updateDashboardStats();
    renderModuleSnapshot();
    renderTimeline();
}
