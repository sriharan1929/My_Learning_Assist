// store.js — central in-memory state + persistence helpers shared by every module

let appData = null;

async function loadStore() {
    appData = await getData();

    // safety: make sure every collection exists
    const required = [
        "customModules", "notes", "roadmaps", "checklists",
        "topics", "remember", "diary", "tasks", "goals", "activities"
    ];

    required.forEach(key => {
        if (!Array.isArray(appData[key])) appData[key] = [];
    });

    return appData;
}

async function persist() {
    const status = document.getElementById("syncStatus");

    if (status) status.innerText = "Saving...";

    const ok = await saveData(appData);

    if (status) {
        status.innerText = ok ? "Saved" : "Save failed";

        setTimeout(() => {
            if (status) status.innerText = DEV_MODE ? "Saved locally" : "Synced to cloud";
        }, 1200);
    }

    return ok;
}

function newId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function logActivity(action) {
    appData.activities.push({
        action,
        date: new Date().toLocaleString()
    });

    // keep the log from growing forever
    if (appData.activities.length > 200) {
        appData.activities = appData.activities.slice(-200);
    }
}

function nowString() {
    return new Date().toLocaleString();
}
