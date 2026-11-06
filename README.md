# Training Enrollment Desk

An operator enrolls people into four one-day training sessions, sees the price, and manages full sessions (waitlist, offers, cancellations).

**Stack:** React + Vite + TypeScript + Tailwind (frontend), Node.js + Express + TypeScript + Sequelize + MySQL (backend).

> The brief suggested mock data and local storage with no backend. I chose a real backend with MySQL on purpose (see DECISIONS.md). The business rules are still plain functions with no Express or Sequelize imports.

## Prerequisites
- Node.js 20 or newer
- MySQL 8 running locally

## Setup

### 1. Database
```sql
CREATE DATABASE training_desk;
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env      # on Windows: copy .env.example .env
```
Edit `.env` and set `DB_PASSWORD`. Then:
```bash
npm run dev
```
You should see `MySQL connected` and `Server on http://localhost:5000`. Tables are created and the four sessions are seeded automatically on start.

### 3. Frontend
In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. Vite proxies `/api` to the backend on port 5000.

### 4. Tests
```bash
cd backend
npm test
```

## Session date (important)
The early-bird rule depends on how far away the session is. All four sessions are seeded on the date in `SESSION_DATE` (default `2026-11-30`, times in IST).

- Enrolling 7 or more days before that date gives early bird.
- To see the **company discount** instead, set `SESSION_DATE` to about 3 days from today, empty the tables, and restart:
```sql
USE training_desk;
DELETE FROM enrollments WHERE id > 0;
DELETE FROM sessions WHERE id > 0;
```

## Project layout
```
backend/src/rules      overlap, capacity, waitlist, pricing (plain functions)
backend/src/services   enroll, cancel, decline, accept (database + transactions)
backend/src/models     Sequelize models
backend/tests          rule tests named after business cases
frontend/src/pages     Enroll screen, Enrollments screen
```

## API
| Method | Path | Purpose |
|---|---|---|
| GET | /api/sessions | Sessions with seats left and waitlist size |
| GET | /api/enrollments?search=&sessionId=&status= | List and filter |
| POST | /api/enrollments | Enroll a person in one or more sessions |
| POST | /api/enrollments/:id/cancel | Cancel; frees a seat and offers it to the next person |
| POST | /api/enrollments/:id/accept | Operator confirms an offered seat |
| POST | /api/enrollments/:id/decline | Operator declines an offered seat |

## Testing status
The rules in `backend/src/rules` are unit tested. The service layer and screens were checked by hand, not with automated tests.