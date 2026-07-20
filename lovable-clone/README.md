# SpringLovable (lovable-clone)

AI-powered full-stack application builder using **Spring Boot**, **Spring AI**, and **React**.

This repo contains:
- `lovable-backend/lovable-backend` — Spring Boot 4 + Spring AI API
- `lovable-frontend` — React + Vite + Tailwind workspace UI
- `docker-compose.yml` — PostgreSQL with pgvector

---

## Prerequisites

| Tool | Version |
|---|---|
| JDK | 21+ (project targets Java 25) |
| Maven | 3.9+ (wrapper included) |
| Node.js | 20+ |
| Docker Desktop | Latest |
| OpenAI API key | Required for AI chat |
| Daytona API key | Optional — enables live cloud sandbox previews |

---

## 1. Start PostgreSQL

From the repo root:

```bash
cd lovable-clone
docker compose up -d
```

This starts PostgreSQL on `localhost:5432` with:
- Database: `lovable`
- Username: `postgres`
- Password: `postgres`

---

## 2. Configure backend environment

Create environment variables (PowerShell example):

```powershell
$env:OPENAI_API_KEY="sk-your-openai-key"
$env:DATABASE_URL="jdbc:postgresql://localhost:5432/lovable"
$env:DATABASE_USERNAME="postgres"
$env:DATABASE_PASSWORD="postgres"
$env:CORS_ALLOWED_ORIGINS="http://localhost:5173"
$env:JWT_SECRET="your-super-secret-key-at-least-32-characters-long"
```

Daytona live previews (optional, recommended):

```powershell
$env:DAYTONA_ENABLED="true"
$env:DAYTONA_API_KEY="your-daytona-api-key"
$env:DAYTONA_TARGET="us"
# Optional: use a prebuilt snapshot with Node/Vite for faster sandbox startup
# $env:DAYTONA_SNAPSHOT="your-snapshot-name-or-id"
```

Optional:

```powershell
$env:OPENAI_CHAT_MODEL="gpt-4o-mini"
$env:JWT_ACCESS_EXPIRATION_MINUTES="15"
$env:JWT_REFRESH_EXPIRATION_DAYS="7"
$env:PORT="8080"
```

---

## 3. Run the backend

```bash
cd lovable-backend/lovable-backend
./mvnw spring-boot:run
```

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend runs at: **http://localhost:8080**

Health check:

```bash
curl http://localhost:8080/api/health
```

---

## 4. Run the frontend

In a new terminal:

```bash
cd lovable-frontend
npm install
npm run dev
```

Frontend runs at: **http://localhost:5173**

The Vite dev server proxies `/api/*` to `http://localhost:8080`.

---

## 5. Use the app

1. Open **http://localhost:5173**
2. **Register** a new account (email + password) or **Sign in**
3. Create a project from the dashboard
4. Open the workspace
5. Chat with AI — responses stream in real time
6. The backend extracts generated files and deploys them to a **Daytona sandbox** (if configured) or **Sandpack** fallback
7. Open the **Demo** tab to see the live preview iframe

---

## API overview

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login, returns JWT tokens |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Revoke refresh token |
| GET | `/api/users/me` | Current user |
| GET | `/api/dashboard` | Dashboard data |
| GET/POST/PUT/DELETE | `/api/projects` | Project CRUD |
| GET/POST | `/api/projects/{id}/messages` | Conversation history |
| POST | `/api/projects/{id}/chat` | SSE AI streaming chat |
| GET/POST | `/api/projects/{id}/messages/{msgId}/fragment` | Generated preview fragment |
| GET/PUT | `/api/usage/{key}` | Usage tracking |

### Auth

Protected routes require:

```http
Authorization: Bearer <access_token>
```

The frontend stores `accessToken` and `refreshToken` in `localStorage` and refreshes automatically on 401.

---

## Database schema

Mirrors the Prisma sample you provided:

- `users` — email, password_hash (BCrypt), name, image
- `refresh_tokens` — JWT refresh token hashes
- `projects` — owned by user
- `messages` — USER / ASSISTANT with RESULT / ERROR
- `fragments` — sandbox preview metadata + JSON files
- `usage_records` — usage points tracking

Flyway migration: `lovable-backend/lovable-backend/src/main/resources/db/migration/V1__init_schema.sql`

---

## Project structure

```text
lovable-clone/
├── docker-compose.yml
├── README.md
├── lovable-backend/lovable-backend/
│   ├── pom.xml
│   └── src/main/java/me/surajkumarjha/lovable_backend/
│       ├── config/
│       ├── controller/
│       ├── dto/
│       ├── entity/
│       ├── repository/
│       ├── security/
│       └── service/
└── lovable-frontend/
    ├── src/
    │   ├── components/
    │   ├── contexts/
    │   ├── hooks/
    │   ├── lib/
    │   └── pages/
    └── vite.config.ts
```

---

## Production build

### Backend

```bash
cd lovable-backend/lovable-backend
./mvnw clean package
java -jar target/lovable-backend-0.0.1-SNAPSHOT.jar
```

### Frontend

```bash
cd lovable-frontend
npm run build
npm run preview
```

Set `VITE_API_BASE_URL` to your deployed backend URL when not using the Vite proxy.

---

## Troubleshooting

### Backend won't compile: `release version 25 not supported`

Install JDK 21+ (or JDK 25), or change `<java.version>25</java.version>` in `pom.xml` to match your installed JDK.

### AI chat fails

Verify `OPENAI_API_KEY` is set and valid.

### 401 Unauthorized on API calls

Ensure you registered/logged in via the frontend. Tokens are sent as `Authorization: Bearer ...`. Try logging out and back in.

### Migrating from Clerk auth

If you have an old database with `clerk_id`, run the app and Flyway `V2__jwt_auth.sql` will migrate the schema. Existing users must **register again** with email/password.

### Database connection errors

Confirm Docker Postgres is running:

```bash
docker compose ps
```

---

## Next steps (Phase 2+)

- AI tool calling for file CRUD
- Project planner before code generation
- pgvector project memory / RAG
- Export project as ZIP
- GitHub integration
