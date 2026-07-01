# My Learning OS

**A calm, intelligent digital sanctuary for intentional learners.**

My Learning OS is a full-stack MERN application that brings together notes, roadmaps, checklists, study sessions, goals, and more into one warm, focused workspace. Designed with Scandinavian minimalism and Japandi aesthetics, it replaces scattered tools with a single peaceful environment where learning feels alive.

---

## Key Features

My Learning OS is a personal learning management system that helps you organize, track, and reflect on everything you learn. Instead of juggling browser tabs, sticky notes, and spreadsheets, you get one unified workspace with:

- **Focus Timer (Enhanced)** — A Pomodoro-style deep work timer with preset durations (15/25/45/60 min) that automatically records completed sessions to your study history. Features a dynamic SVG-based circular progress ring, browser-synthesized ambient soundscapes (Soft Rain, Forest Wind, Deep Brown, Zen Tick), and an endpoint-triggered Zen Chime.
- **Calendar** — A visual calendar matrix page mapping tasks, goals, and study sessions directly to their due dates, scheduled times, or completion dates for timeline-based tracking.
- **Analytics Dashboard** — Interactive Recharts visualization tracking study hours by date, topic distribution, task/goal completion metrics, and consecutive study streaks.
- **Media Attachments** — Secure file upload and attachments support for Resources, Roadmaps, and Goals, allowing users to upload and view reference documents, PDFs, and images.
- **Multi-User Registrations** — Complete user authentication flow supporting both registration of new user accounts (with bcryptjs password hashing) and secure JWT-based sign-in.
- **Notes** — Capture ideas, summaries, and insights with tags and pinning.
- **Roadmaps** — Break learning goals into sequential steps. Check off milestones as you progress through a topic.
- **Checklists** — Create actionable item lists with inline completion tracking.
- **Topics** — Organize subjects on a Kanban-style board across *Not Started*, *Learning*, and *Mastered* columns.
- **Tasks** — Track assignments and to-dos with priorities, statuses, and due dates.
- **Goals** — Set measurable targets with progress tracking (e.g., "Read 12 books this year — 4/12").
- **Diary** — Reflect on your learning journey with mood tracking and daily entries.
- **Resources** — Bookmark articles, videos, courses, and tools with quick-open links.
- **Global Search** — Search across every resource type instantly. Click a result to jump directly to that item's edit view.

---

## Design Philosophy

The interface follows an **Organic Earth-Tone Design System** inspired by Scandinavian minimalism, Japandi interiors, and warm luxury aesthetics:

| Token             | Color     | Usage                        |
|-------------------|-----------|------------------------------|
| Deep Forest Brown | `#3F2822` | Text, headings, contrast     |
| Walnut Brown      | `#755949` | Muted text, labels           |
| Clay Brown        | `#A1775D` | Primary actions, accents     |
| Terracotta Sand   | `#CBA68A` | Buttons, highlights, avatar  |
| Warm Ivory        | `#F4EEE4` | Page backgrounds             |
| Cream White       | `#EFE6D8` | Card surfaces, sidebar       |
| Sage Green        | `#A49B72` | Success states               |
| Olive Green       | `#8B8460` | Secondary accents            |

**Visual characteristics:**
- Floating cards with 24px corner radius
- Pill-shaped buttons with subtle hover lift
- Layered mountain silhouette landscape backdrop
- Elegant serif headings (Fraunces) paired with clean sans-serif body text (Inter)
- Generous whitespace and calm visual hierarchy
- No neon colors, no glassmorphism, no clutter

---

## Architecture Overview

```
my-learning-os/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── components/        # Reusable UI (buttons, inputs, cards, layout)
│       ├── features/          # Domain-specific components (resource cards, config)
│       ├── hooks/             # Custom hooks (useResource, useAuth)
│       ├── lib/               # Utilities (classnames, date formatting)
│       ├── pages/             # Route-level page components
│       ├── services/          # API client (Axios)
│       ├── styles/            # Global CSS design system
│       └── test/              # Vitest + React Testing Library tests
├── server/                    # Express REST API
│   └── src/
│       ├── config/            # Environment validation (Zod)
│       ├── controllers/       # Route handlers (resource, auth, insights)
│       ├── middleware/        # Auth, validation, error handling
│       ├── models/            # Mongoose schemas (MongoDB-ready)
│       ├── repositories/      # Data access (MemoryRepository, MongoRepository)
│       ├── routes/            # Express router definitions
│       ├── services/          # Business logic layer
│       ├── utils/             # Helpers (async handler, HTTP errors)
│       └── validation/        # Zod request validation
├── shared/                    # Shared between client and server
│   ├── constants/             # Resource names, status enums
│   └── schemas/               # Zod validation schemas
└── package.json               # npm workspaces root
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB instance (running locally or in the cloud)

### Installation

1. Clone the repository and install dependencies:
```bash
git clone https://github.com/your-username/TMS_Learning-main.git
cd TMS_Learning-main
npm install
```

2. Create the `.env` configuration for the server:
```bash
copy server\.env.example server\.env
```

3. Ensure MongoDB is running and update your `server/.env` if necessary (see Database Configuration).

### Run Locally

Start the React client and Express API concurrently:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. 

You can immediately sign in with the default demo user:
- **Email:** `demo@learningos.dev`
- **Password:** `learn123`

Or register a new account from the Sign Up page.

---

## Database Configuration

By default, the server is configured to connect to a MongoDB instance using the `MONGODB_URI` environment variable defined in `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/learning-os
```

If `MONGODB_URI` is omitted or empty, the server automatically falls back to an **in-memory data repository**. In-memory mode is ideal for local development, testing, and isolated demo environments since all data resets when the server restarts.

---

## Available Commands

| Command          | Description                                  |
|------------------|----------------------------------------------|
| `npm run dev`    | Start React client and Express API together  |
| `npm run build`  | Create the frontend production bundle        |
| `npm test`       | Run server and client test suites            |
| `npm run lint`   | Lint both workspaces                         |

---

## Developer Guide

For a detailed file-by-file breakdown of the system architecture, dependencies, project flows, and backend schemas, see the [Architecture & Developer Guide (ARCHITECTURE.md)](file:///c:/Users/Sriharan/Documents/My_Learning_Assist/ARCHITECTURE.md).

---

## License

This project is for personal and educational use.
