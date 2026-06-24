// api.js — storage layer (localStorage in dev, Cloudflare Worker + GitHub API in production)

const DEV_MODE = false;

const API_URL =
"https://weathered-wood-7b8a.thisanthan2903.workers.dev";

const STORAGE_KEY = "learningOsData";

// Default shape of the application's data
function defaultData() {
    return {
        customModules: [],
        notes: [],
        roadmaps: [],
        checklists: [],
        topics: [],
        remember: [],
        diary: [],
        tasks: [],
        goals: [],
        activities: []
    };
}

async function getData() {

    if (DEV_MODE) {

        const raw = localStorage.getItem(STORAGE_KEY);

        if (!raw) return defaultData();

        try {
            return Object.assign(defaultData(), JSON.parse(raw));
        } catch (e) {
            return defaultData();
        }
    }

    try {
        const response = await fetch(API_URL);
        const json = await response.json();
        return Object.assign(defaultData(), json);
    } catch (e) {
        return defaultData();
    }
}

async function saveData(data) {

    if (DEV_MODE) {

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        return true;
    }

    try {

        await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        return true;

    } catch (e) {

        return false;
    }
}
