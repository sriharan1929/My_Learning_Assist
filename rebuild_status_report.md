# My Learning OS — Rebuild Status & Roadmap Report

This report summarizes the current implementation status of the MERN stack rebuild of **My Learning OS**, categorizing items into completed features, pending/deferred features, and future enhancements.

---

## 1. Completed Features ✅

### Architecture & Base Configuration
- **Monorepo setup**: Structured with npm workspaces containing `client`, `server`, and `shared`.
- **Validation**: Shared Zod schemas under `shared/schemas/index.js` validated at both layers.
- **Demo Auth**: JWT-backed single-user session endpoints (`/auth/login`, `/auth/me`) protecting all resource paths.

### Organic Earth-Tone Redesign
- **Japandi Aesthetic**: Warm ivory (`#F4EEE4`), cream white (`#EFE6D8`), clay brown (`#A1775D`), and terracotta sand (`#CBA68A`) color system.
- **Soft Layout Details**: Pill-shaped button controls, 24px rounded card edges, and clean walnut-colored dividers.
- **Mountain Landscape Artwork**: Overlapping mountain silhouette inline SVG background decoration fixed in the workspace view.
- **Login Screen Preservation**: Scoped previous CSS assets locally to `.login-page` to keep the authentication screen completely unchanged.

### Frontend Features
- **Sub-Item/Step Management**: Direct interaction inside roadmap cards (steps), checklist cards (items), and custom modules (items) to toggle done states, delete items, select status/priority dropdowns, and add new sub-items inline.
- **Global Search Navigation**: Interactive search bar with result links that navigate to pages and automatically pop open the corresponding item's edit modal.
- **Focus Timer Invalidation**: Instant query cache updates upon timer completion to refresh dashboard metrics immediately.
- **Dynamic Database Warning**: Bottom sidebar warning dynamically displays if the backend is running in-memory or on a live database.

### Core Testing Suite
- 4 backend Vitest integration tests (CRUD validation, auth, metrics).
- 5 frontend UI testing library tests (login form, progress bar rendering, steps expansion, checkbox toggling, step additions).

---

## 2. Pending Items (To Be Completed) ⏳

- **Database Connection Handler**: `server.js` currently uses `MemoryRepository` by default. Connection initiation via `mongoose.connect()` when `MONGODB_URI` is supplied needs to be written.
- **`MongoRepository.all()` Method**: The dashboard and global search search routes call `repository.all(name, userId)`. This method must be added to `MongoRepository` to prevent server errors when database storage is active.
- **Asynchronous Dashboard Controller**: `insight-controller.js` runs data gathering synchronously. It must be refactored to be `async` and resolve MongoDB queries with `Promise.all()` to support async database queries.
- **Sub-Resource Schema Validation**: The body input validation middleware (`validate(schema)`) is not hooked up on nested sub-resource controllers (`POST` and `PUT` for steps/items).

---

## 3. Recommended Enhancements & Future Additions 🚀

### Feature Expansion
- **Permanent Registrations**: Expand from the single-user hardcoded token profile to a full multi-tenant user table, password encryption (bcrypt), and account creation signup views.
- **Calendar Widget**: A calendar matrix page to map due dates, scheduled topics, and focus sessions.
- **Habit Streaks**: Add tracker tallies for continuous days completing study sessions or checklist tasks.
- **Visual Analytics**: Interactive bar and line charts (e.g., using Recharts) detailing study hours grouped by topic over week/month periods.

### UI & UX Polish
- **Dark Sanctuary Mode**: A dark mode toggle utilizing warm dark chocolate (`#251613`) and muted mud tones to match the Japandi interior theme.
- **Rich Text Editor**: Integrate a Markdown or WYSIWYG editor for Note contents instead of a plain textarea.
- **Media Attachments**: Support for uploading and attaching PDFs, images, or cheatsheets directly to Resources and Goals.
