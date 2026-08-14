# MERN Syllabus Tracker

A production-quality **MERN** learning management app for tracking progress through a **MERN stack** syllabus — modules → topics → subtopics → progress.

Built as a portfolio-ready SaaS-style dashboard: per-subtopic status tracking, custom topics/subtopics, notes & resources, learning streaks, activity heatmap, charts and responsive UI.

---

## ✨ Features

- **Master syllabus** — the official MERN curriculum is seeded into MongoDB and is read-only for users.
- **Status tracking** — every subtopic can be `Not Started`, `In Progress` or `Completed`, persisted in MongoDB (source of truth).
- **Progress everywhere** — overall, per-module and per-topic progress bars, recomputed on the backend.
- **Custom content** — add your own modules, topics and subtopics (marked ⭐ Custom), plus edit/delete only your own. Official content can't be modified.
- **Notes & resources** — private per-subtopic notes; resources attached to subtopics.
- **Continue learning** — shows the most recently active in-progress subtopic.
- **Streaks & heatmap** — 🔥 day streak and a GitHub-style activity heatmap computed from DB records.
- **Search & filters** — search across the syllabus, filter by status, custom and difficulty.
- **Dashboard** — circular progress, stats, module progress, recent completions.
- **Charts** — status pie, per-module bar chart and difficulty breakdown (Recharts).
- **Secure auth** — JWT in HTTP-only cookies, bcrypt password hashing, protected routes, ownership checks.
- **Responsive** — desktop sidebar + mobile drawer, mobile-friendly cards.

---

## 🧱 Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Framer Motion, Axios, Recharts, Lucide |
| Backend  | Node.js, Express, MongoDB, Mongoose, JWT, bcrypt |
| Dev      | JavaScript (ESM), ESLint, Postman |

---

## 📁 Project Structure

```text
mern-syllabus-tracker/
├── frontend/                  # Vite + React app
│   └── src/
│       ├── components/        # Layout, Sidebar, modals, progress UI…
│       ├── pages/             # Login, Register, Dashboard, Syllabus, Progress, Notes, Settings
│       ├── context/           # Auth, Progress, Toast providers
│       ├── services/api.js    # Axios instance + error helpers
│       ├── hooks/             # useDebouncedValue
│       ├── utils/             # status/difficulty helpers
│       ├── App.jsx
│       └── main.jsx
└── backend/
    ├── config/db.js
    ├── controllers/           # auth, module, topic, subTopic, progress
    ├── middleware/            # auth, error, validation
    ├── models/                # User, Module, Topic, SubTopic, Progress
    ├── routes/                # REST routes
    ├── seed/                  # seedSyllabus.js + syllabusData.js
    ├── utils/                 # token, syllabus tree builder, analytics
    └── server.js
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local) or MongoDB Atlas

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # edit MONGO_URI, JWT_SECRET, etc.
npm run seed                # insert the official MERN syllabus (idempotent)
npm run dev                 # http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env        # optional: point VITE_API_URL at your backend
npm run dev                 # http://localhost:5173
```

Open https://syllabus-tracker-beta.vercel.app/ → register → the seeded syllabus appears on the Syllabus page.

### Deploying

- **Frontend** → Vercel (`frontend/` as root). Vercel auto-detects Vite and the included `vercel.json` rewrites all routes to `index.html`, so React Router deep links work. Set `VITE_API_URL` in Vercel's Environment Variables (available at build time).
- **Backend** → Render Web Service (`backend/` as root): set `NODE_ENV=production`, `CLIENT_URL` (the frontend origin), `MONGO_URI`, `JWT_SECRET`; run seed once.
- **Database** → MongoDB Atlas (set `MONGO_URI`).
- For production, ensure `NODE_ENV=production`, the JWT secret is strong, and cookies are `Secure` + `SameSite=None`.
- If you'd rather deploy the frontend on Render too, use the included `frontend/server.js` (`npm start`) and the `render.yaml` Blueprint.

---

## 🔌 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (name, email, password) |
| POST | `/api/auth/login` | Login, sets HTTP-only cookie |
| POST | `/api/auth/logout` | Clears session |
| GET  | `/api/auth/me` | Current user |
| GET  | `/api/modules/tree` | Full syllabus tree with user progress |
| GET/POST | `/api/modules` | List / create custom module |
| PUT/DELETE | `/api/modules/:id` | Edit/delete custom module (owner only) |
| GET/POST | `/api/topics` | List / create custom topic |
| PUT/DELETE | `/api/topics/:id` | Edit/delete custom topic (owner only) |
| GET/POST | `/api/subtopics` | List / create custom subtopic |
| PUT/DELETE | `/api/subtopics/:id` | Edit/delete custom subtopic (owner only) |
| GET | `/api/progress` | User progress with context |
| GET | `/api/progress/stats` | Aggregated stats for dashboard/charts |
| GET | `/api/progress/activity` | Streak + heatmap data |
| PUT | `/api/progress/:subTopicId` | Set status for a subtopic |
| POST | `/api/progress/:subTopicId/notes` | Save personal notes |
| DELETE | `/api/progress` | Reset user's progress |

All `/api/*` routes except register/login are protected by JWT.

---

## 🧠 How Progress Works

- Progress lives in a dedicated `Progress` collection keyed by `userId + subTopicId`.
- The overall/module/topic percentages are **calculated on the backend** from the user's progress records — never hardcoded in React.
- Custom topics/subtopics automatically participate in progress calculations.
- The master syllabus is shared (not duplicated per user); custom content is flagged `isCustom: true` + `createdBy`.

---

## ✅ Scripts

Backend:
- `npm run dev` — nodemon dev server
- `npm run start` — production server
- `npm run seed` — seed/reset the official syllabus (idempotent)

Frontend:
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint

---

## 🛡️ Security Notes

- Passwords hashed with bcrypt.
- JWT stored in HTTP-only cookies (`SameSite=Lax`, `Secure` in production).
- Every mutation checks ownership before allowing edits/deletes.
- Input validated with express-validator; MongoDB CastError handled.
- `.env` holds secrets (`JWT_SECRET`, `MONGO_URI`); never commit `.env`.
