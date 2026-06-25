# LMS Education Platform

A full-stack Learning Management System: video lessons, auto-graded quizzes, progress tracking, auto-generated PDF certificates, and live classes over WebRTC.

**Stack:** React (Vite + Tailwind) · Node.js / Express · MongoDB (Mongoose) · Socket.io (WebRTC signaling) · JWT auth · PDFKit

---

## Features

| Area | What it does |
|---|---|
| **Auth** | Register/login as a student or instructor, JWT-based sessions, role-based access control |
| **Course management** | Instructors create courses, upload lesson videos, set price/category/level, publish/unpublish |
| **Video streaming** | Lesson videos stream from the backend with HTTP range support (seek/scrub works like YouTube) |
| **Quizzes** | Per-lesson quizzes and a final course exam, multiple choice, auto-graded instantly, configurable passing score |
| **Progress tracking** | Per-lesson completion + watch time, rolled up into an overall course progress % |
| **Certificates** | A PDF certificate is generated automatically the moment a student finishes every lesson (and passes the final exam, if one exists) |
| **Live classes** | Real-time instructor↔student video sessions negotiated over WebRTC, signaled through a Socket.io server, with text chat |

---

## Project structure

```
lms-platform/
├── backend/                 # Express API + Socket.io signaling
│   ├── config/db.js
│   ├── models/               # User, Course, Quiz, Enrollment, Certificate
│   ├── controllers/
│   ├── routes/
│   ├── middleware/            # auth (JWT), multer upload, error handler
│   ├── socket/webrtcSignaling.js
│   ├── utils/                 # JWT helper, PDF certificate generator, seed script
│   ├── uploads/                # uploaded lesson videos & thumbnails (gitignored)
│   ├── certificates/           # generated certificate PDFs (gitignored)
│   └── server.js
└── frontend/                 # React app (Vite)
    └── src/
        ├── api/axios.js        # API client with auth interceptor
        ├── context/AuthContext.jsx
        ├── components/
        └── pages/
```

---

## Prerequisites

- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

---

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` if needed (defaults work for a local MongoDB instance):

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/lms_platform
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Seed the database with a sample instructor, student, and course (optional but recommended for first run):

```bash
npm run seed
```

This creates:
- **Instructor:** `instructor@lms.test` / `password123`
- **Student:** `student@lms.test` / `password123`
- One published course with 3 lessons, a lesson quiz, and a final exam (no video files attached — upload your own through the "Manage Course" screen as the instructor).

Start the API server:

```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start
```

The API runs at `http://localhost:5000`. Health check: `GET /api/health`.

---

## 2. Frontend setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` and proxies `/api`, `/uploads`, and `/socket.io` to the backend on port 5000 (see `vite.config.js`).

Log in with the seeded accounts above, or register your own.

---

## How the key features work

**Video streaming** — `GET /api/videos/stream/:filename` reads the file in chunks and honors `Range` headers, so the browser's native `<video>` element can seek instantly instead of downloading the whole file. Since `<video>` can't send a custom `Authorization` header, the JWT is passed as a `?token=` query parameter on this route only (`protectFlexible` middleware accepts either form).

**Quizzes & auto-grading** — Instructors build quizzes with a simple form (question text, 2+ options, mark the correct one). When a student submits, the backend re-checks every answer server-side and returns a score — the correct answers are never sent to the client until after submission.

**Progress & certificates** — Every enrollment tracks per-lesson completion. After any lesson is marked complete (or a final exam is passed), the backend checks whether *all* lessons are done and the final exam (if any) is passed. If so, it generates a certificate PDF with PDFKit and saves a `Certificate` record — this is idempotent, so it won't double-issue.

**Live classes (WebRTC)** — `backend/socket/webrtcSignaling.js` is a thin Socket.io relay: it never touches video/audio data, only SDP offers/answers and ICE candidates, so peers can negotiate a direct connection. The frontend (`LiveClass.jsx`) does the actual `RTCPeerConnection` work. This demo uses only a public STUN server (no TURN), so it works well on open networks; for production use behind strict corporate NATs/firewalls you'd add a TURN server (e.g. coturn) to `ICE_SERVERS`.

---

## API overview

| Method & Path | Description |
|---|---|
| `POST /api/auth/register` / `login` | Create account / sign in |
| `GET /api/auth/me` | Current user |
| `GET /api/courses` | List published courses (search/category/level filters) |
| `POST /api/courses` | Create course (instructor) |
| `POST /api/courses/:id/lessons` | Add a lesson with video upload (instructor) |
| `POST /api/courses/:id/enroll` | Enroll in a course (student) |
| `GET /api/courses/enrollments/my` | My enrollments |
| `GET/PUT /api/progress/:courseId` | Get/update lesson progress |
| `POST /api/quizzes` | Create a quiz (instructor) |
| `POST /api/quizzes/:id/submit` | Submit answers, get auto-graded result |
| `GET /api/certificates/my` | My certificates |
| `GET /api/certificates/:id/download` | Download a certificate PDF |
| `GET /api/videos/stream/:filename` | Stream a lesson video (range-aware) |
| `GET /api/instructors` | Public directory of instructors with their published course/student counts |
| `POST /api/contact` | Submit a Contact Us message (public) |
| `GET /api/contact` | View submitted messages (admin only) |

---

## Notes for production deployment

- Replace `JWT_SECRET` with a strong, unique value and never commit `.env`.
- Move file storage (`uploads/`, `certificates/`) to object storage (S3, GCS, etc.) instead of local disk.
- Put a CDN or a dedicated media server in front of video delivery for real scale.
- Add a TURN server for reliable WebRTC connectivity across all networks.
- Add HTTPS (required by browsers for `getUserMedia` on any non-localhost origin).
