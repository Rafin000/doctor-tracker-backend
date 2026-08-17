# Doctor Tracker — Backend API

Secure REST API for the Doctor Tracker admin portal: authentication, doctor & patient management, and dashboard analytics. Built with **NestJS (on Express)** and **MongoDB**.

> **Elevator pitch:** A clean, layered REST API that lets an authenticated admin manage doctors and their patients with fast search / filter / pagination, and powers an analytics dashboard with server-side MongoDB aggregations.

---

## Live API

| | URL |
|---|---|
| Base URL | `https://<your-render-app>.onrender.com/api` |
| Health check | `GET /api/health` |

---

## Tech stack

- **NestJS 10** on the **Express** HTTP adapter, **TypeScript**
- **MongoDB** via **Mongoose** (`@nestjs/mongoose`)
- **JWT** auth (`jsonwebtoken`, HS512) + **bcryptjs**
- **class-validator / class-transformer** for DTO validation
- **helmet** for secure headers

---

## Setup guide

### Prerequisites
- Node.js 18+ and Yarn
- A MongoDB connection string — **MongoDB Atlas** free tier (M0) works, or local/Docker Mongo

### 1. Install
```bash
git clone https://github.com/Rafin000/doctor-tracker-backend.git
cd doctor-tracker-backend
yarn install
```

### 2. Configure environment
```bash
cp .env.example .env
```
`.env.example`:
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas connection string (free M0 tier works fine)
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster0.mongodb.net/doctor_tracker?retryWrites=true&w=majority

# JWT
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

# CORS: deployed frontend origin(s), comma-separated
CLIENT_ORIGIN=http://localhost:3000

# Seed admin (used by `yarn seed`)
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@doctortracker.com
ADMIN_PASSWORD=Admin@1234
```
Config is validated at boot (`validateEnv`): the server refuses to start in production with a missing/weak `JWT_SECRET` or missing `MONGO_URI`.

### 3. Seed an admin + demo data
```bash
yarn seed
```
Creates the admin login and (on an empty DB) 8 sample doctors and 45 patients so the dashboard has data.

### 4. Run
```bash
yarn start:dev     # watch mode
# or
yarn build && yarn start:prod
```
API is served under the `/api` prefix (e.g. `http://localhost:5000/api/health`).

---

## System architecture

Layered NestJS, one responsibility per layer:

```
Request
  │
  ▼
AuthGuard (global)  ──▶ @Public() routes skip it; else verify JWT, load user → request.verifiedUser
  │
  ▼
ValidationPipe + ParseObjectIdPipe   (validate body/query DTOs and :id params)
  │
  ▼
Controller        (HTTP only — no business logic)
  │
  ▼
Service           (business logic, builds filters, orchestrates)
  │
  ▼
Repository        (extends a generic BaseRepository<T> — all Mongoose access)
  │
  ▼
MongoDB (Mongoose models + indexes)

Responses ◀── ResponseInterceptor wraps every result as { success, statusCode, message, data, meta }
Errors    ◀── ExceptionFilter maps HTTP/Mongo errors to { success:false, statusCode, message, errorMessages }
```

**Module layout** (`src/`):
```
config/                # single typed env object + validateEnv()
shared/                # SuccessResponse, pagination DTO, query utils, ObjectId pipe
base/                  # BaseRepository<T> (generic CRUD + pagination), Transformer contracts
guards/ decorators/ filters/ interceptors/
modules/
  helpers/             # JWTHelper, PasswordHelper
  database/            # Mongoose connection
  user/  auth/         # admin model + login / me
  doctor/  patient/    # schemas, DTOs, transformers, repositories, services, controllers
  dashboard/           # aggregation-based analytics
  seed/                # admin + demo-data seeder
```

---

## API reference

All routes are under `/api`. All except `health` and `auth/login` require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Liveness check (public) |
| `POST` | `/auth/login` | Login, returns `{ accessToken, user }` (public) |
| `GET` | `/auth/me` | Current admin profile |
| `GET` | `/doctors` | List doctors — `page, limit, search, specialization, hospital, startDate, endDate, sortBy, sortOrder` |
| `POST` | `/doctors` | Create doctor |
| `GET` | `/doctors/:id` | Get one doctor |
| `PATCH` | `/doctors/:id` | Update doctor |
| `DELETE` | `/doctors/:id` | Delete doctor (cascades: removes their patients) |
| `GET` | `/doctors/:id/patients` | List a doctor's patients (paginated/searchable) |
| `POST` | `/doctors/:id/patients` | Add a patient under a doctor |
| `DELETE` | `/doctors/:id/patients/:patientId` | Remove a patient from a doctor |
| `GET` | `/patients` | List all patients — `page, limit, search, condition, gender, doctorId, startDate, endDate` |
| `GET` | `/patients/:id` | Get one patient |
| `PATCH` | `/patients/:id` | Update patient |
| `DELETE` | `/patients/:id` | Delete patient |
| `GET` | `/dashboard/overview?days=30` | Totals + patients/doctor + time series + condition & gender breakdowns |

---

## Technical decisions

### 1. NestJS (on Express) with a generic `BaseRepository`, tuned for query performance
NestJS runs on the Express HTTP adapter, so this satisfies the "Node.js + Express" requirement while giving a clean, testable, layered architecture (guards, DI, pipes, interceptors) out of the box.

The performance-sensitive part is the list/search/filter/pagination that every table hits. Rather than duplicating `find/skip/limit/count` per feature, a generic **`BaseRepository<T>`** implements it once and runs the **filtered query and the count in parallel** (`Promise.all`) with `.lean()` for plain objects. Indexes are matched to the actual query shapes:
- Doctors: indexes on `specialization`, `hospital`, `createdAt` (the filters and default sort).
- Patients: a compound `{ doctor: 1, createdAt: -1 }` index powers "a doctor's patients," plus `condition` and `createdAt`.

### 2. Server-side aggregation for the dashboard
Dashboard metrics (patients per doctor, patients over time, condition/gender breakdowns) are computed with **MongoDB aggregation pipelines**, not by pulling documents into Node and counting. All pipelines run in **parallel**, so the endpoint stays fast and the payload stays tiny regardless of dataset size. A consistent response envelope (`ResponseInterceptor`) and Mongo-aware error mapping (`ExceptionFilter`) keep the whole API predictable for the client.

---

## Deployment (Render free tier)
1. Push this repo to GitHub.
2. Render → **New Web Service** → connect the repo.
3. Build command: `yarn install --frozen-lockfile && yarn build` — Start command: `yarn start:prod`.
4. Add environment variables from `.env.example` (set a strong `JWT_SECRET`, your Atlas `MONGO_URI`, and `CLIENT_ORIGIN` = your deployed frontend URL).
5. After the first deploy, run the seeder once (Render Shell): `yarn seed`.

## Scripts
```bash
yarn start:dev    # watch mode
yarn build        # compile to dist/
yarn start:prod   # run compiled build
yarn seed         # seed admin + demo data
```
