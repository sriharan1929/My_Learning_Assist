# My Learning OS

**A calm, intelligent digital sanctuary for intentional learners.**

My Learning OS is a full-stack MERN application that brings together notes, roadmaps, checklists, study sessions, goals, and more into one warm, focused workspace. Designed with Scandinavian minimalism and Japandi aesthetics, it replaces scattered tools with a single peaceful environment where learning feels alive.

---

## What It Does

My Learning OS is a personal learning management system that helps you organize, track, and reflect on everything you learn. Instead of juggling browser tabs, sticky notes, and spreadsheets, you get one unified workspace with:

- **Notes** — Capture ideas, summaries, and insights with tags and pinning.
- **Roadmaps** — Break learning goals into sequential steps. Check off milestones as you progress through a topic.
- **Checklists** — Create actionable item lists with inline completion tracking.
- **Topics** — Organize subjects on a Kanban-style board across *Not Started*, *Learning*, and *Mastered* columns.
- **Tasks** — Track assignments and to-dos with priorities, statuses, and due dates.
- **Goals** — Set measurable targets with progress tracking (e.g., "Read 12 books this year — 4/12").
- **Diary** — Reflect on your learning journey with mood tracking and daily entries.
- **Resources** — Bookmark articles, videos, courses, and tools with quick-open links.
- **Study Sessions** — Log focused study time by topic and duration.
- **Custom Modules** — Create your own resource types with flexible items, statuses, and priority levels.
- **Focus Timer** — A Pomodoro-style deep work timer with preset durations (15/25/45/60 min) that automatically records completed sessions to your study history.
- **Dashboard** — A unified overview showing active goals, today's schedule, completion metrics, and recent activity at a glance.
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

## Architecture

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

**Key technologies:**
- **Frontend:** React 19, Vite, React Router 7, TanStack Query, React Hook Form, Zod, Lucide Icons
- **Backend:** Express, JWT authentication, Zod validation, Helmet, CORS, Rate Limiting
- **Data layer:** Repository pattern with swappable `MemoryRepository` (default) and `MongoRepository` (production)
- **Testing:** Vitest, Supertest, React Testing Library

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
git clone https://github.com/your-username/TMS_Learning-main.git
cd TMS_Learning-main
npm install
copy server\.env.example server\.env
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and sign in with:
- **Email:** `demo@learningos.dev`
- **Password:** `learn123`

The API runs on `http://localhost:4000` and uses in-memory demo data by default. Data resets when the server restarts.

---

## Available Commands

| Command          | Description                                  |
|------------------|----------------------------------------------|
| `npm run dev`    | Start React client and Express API together  |
| `npm run build`  | Create the frontend production bundle        |
| `npm test`       | Run server and client test suites            |
| `npm run lint`   | Lint both workspaces                         |

---

## Demo Authentication

The application ships with a single demo user for immediate exploration. No registration required:

| Field    | Value                 |
|----------|-----------------------|
| Email    | `demo@learningos.dev` |
| Password | `learn123`            |

Authentication uses JWT tokens stored in `localStorage`. All API routes except `/auth/login` are protected.

---

## Database Configuration

By default, the server uses an **in-memory repository** — all data lives in JavaScript arrays and resets on restart. This is ideal for demos and development.

To switch to persistent MongoDB storage, add `MONGODB_URI` to your `server/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/learning-os
```

> **Note:** The MongoDB connection handler and `MongoRepository.all()` method are prepared but require final wiring. See `rebuild_status_report.md` for details.

---

## Future Ideas

- Calendar planning and scheduling views
- Habit tracking with daily streaks
- Visual analytics with charts (Recharts)
- Dark sanctuary mode (warm chocolate tones)
- Rich text / Markdown editor for notes
- File and media attachments
- Multi-user registration and collaboration
- Achievement badges and milestones
- Production MongoDB deployment

---

## License

This project is for personal and educational use.
