# WalletFlow --- Quick Start & Development Environment

## Part 2 --- Getting the Application Running

This document describes the development setup supported by the supplied WalletFlow frontend and backend repository snapshots.

It intentionally documents the commands and configuration represented by the source rather than inventing additional infrastructure requirements.

---

## 1. Scope

This part covers:

- Repository layout
- Prerequisites that can be established from the project
- Backend installation
- Frontend installation
- Environment configuration
- Database connection
- Database schema synchronization
- Database seeding
- Backend startup
- Frontend startup
- Verification
- Development workflow
- Common configuration failures
- Production-related cautions

The project is split into two applications:

```text
project-root/
├── frontend/
└── backend/
```

The exact parent-directory names may differ depending on how the repositories are checked out.

---

## 2. Application Requirements

### 2.1 Runtime

The repository uses JavaScript/Node.js tooling for both applications.

The backend is executed with Node.js:

```bash
node server.js
```

The frontend is built and started through Create React App / `react-scripts`:

```bash
npm start
npm run build
npm test
```

The supplied package manifests do **not** declare a specific Node.js version through an `engines` field.

Therefore:

> This documentation does not prescribe a Node.js version that is not explicitly specified by the repository.

For a reproducible development environment, use a Node.js version compatible with the installed React/Create React App and backend dependency set, and pin the chosen version at the project/CI level if your team requires strict reproducibility.

---

## 3. Backend Prerequisites

The backend requires a PostgreSQL-compatible database connection.

The implementation uses:

- `@neondatabase/serverless`
- `drizzle-orm`
- `ws`

The database configuration creates a Neon serverless `Pool` using `DATABASE_URL` and wraps it with Drizzle ORM.

The application refuses to start if `DATABASE_URL` is not configured.

---

## 4. Frontend Prerequisites

The frontend requires:

- Node.js
- npm
- A browser with JavaScript enabled
- A running backend API for authenticated/application data
- A reachable Socket.IO backend for real-time functionality

The frontend's example environment configuration uses:

```text
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

These are the current repository defaults shown in the frontend source.

---

# 5. Initial Installation

## 5.1 Install Backend Dependencies

Change into the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

The backend package provides the following development/runtime commands:

```bash
npm start
npm run dev
npm run db:push
npm run db:seed
npm test
```

The package manifest defines:

Command Purpose

---

`npm start` Starts `node server.js` ,`npm run dev` Starts `nodemon server.js`, `npm run db:push` Runs `drizzle-kit push`, `npm run db:seed` Runs the database seed script `npm test` Runs Jest tests serially

---

## 5.2 Install Frontend Dependencies

Change into the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

The frontend package provides:

```bash
npm start
npm run build
npm test
npm run eject
```

The package manifest defines these as:

Command Purpose

---

`npm start` Starts the React development server `npm run build` Creates a production build `npm test` Runs the frontend test runner `npm run eject` Ejects Create React App configuration

The `eject` operation is normally irreversible and should not be performed as part of ordinary development.

---

# 6. Backend Environment Configuration

The backend loads environment variables through `dotenv`.

Environment configuration is centralized in:

```text
backend/src/config/env.js
```

The configuration is loaded early during backend startup.

---

## 6.1 Required Backend Variable

### `DATABASE_URL`

This is the only environment variable that the source explicitly validates as required in all environments.

Example shape:

```env
DATABASE_URL=<postgresql-connection-string>
```

The actual value must point to the PostgreSQL database used by the application.

Do not copy a production database URL into local development unless that is explicitly intended.

---

## 6.2 Development Defaults

The backend configuration provides defaults for several settings.

Current source behavior includes:

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
JWT_EXPIRES_IN=24h
```

The backend also derives:

```text
BACKEND_URL=http://localhost:<PORT>
```

when `BACKEND_URL` is not explicitly supplied.

---

## 6.3 Optional Backend Variables

The source recognizes the following optional configuration:

```env
BACKEND_URL=
REDIS_URL=
EMAIL_USER=
EMAIL_PASS=
EMAIL=
```

### `BACKEND_URL`

Used by the production keep-alive mechanism.

If absent, the backend derives a localhost URL from `PORT`.

### `REDIS_URL`

Used to enable the Socket.IO Redis adapter.

If this variable is absent, the application continues without the Redis adapter.

The source explicitly treats the string `"null"` as equivalent to an unset Redis URL.

### Email variables

The backend recognizes:

```env
EMAIL_USER=
EMAIL_PASS=
EMAIL=
```

The email configuration is optional in development.

When email credentials are unavailable, the development configuration reports that email is not configured and the email service can operate in development logging behavior.

---

# 7. JWT Configuration

The backend uses:

```env
JWT_SECRET=
JWT_EXPIRES_IN=24h
```

`JWT_EXPIRES_IN` defaults to:

```text
24h
```

The JWT secret has a development fallback in the current source.

However, production behavior is stricter.

When:

```env
NODE_ENV=production
```

the backend requires `JWT_SECRET`.

It also rejects the known default development secret.

Therefore, production configuration must contain a unique secret.

---

## 7.1 Important Security Rule

Do not use the repository's development fallback JWT secret in production.

The backend explicitly validates this condition and refuses production startup if the default value is used.

---

# 8. Production Backend Environment

For production, the source explicitly requires:

```env
NODE_ENV=production
DATABASE_URL=<production-database-url>
JWT_SECRET=<strong-production-secret>
FRONTEND_URL=<production-frontend-origin>
```

The following may also be configured:

```env
PORT=<hosting-platform-port>
BACKEND_URL=<public-backend-url>
REDIS_URL=<redis-url>
JWT_EXPIRES_IN=<token-duration>
EMAIL_USER=<email-account>
EMAIL_PASS=<email-password>
EMAIL=<sender/configured-email>
```

The exact values depend on the deployment environment.

---

# 9. Frontend Environment Configuration

The frontend contains:

```text
.env.example
```

with:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 9.1 `REACT_APP_API_URL`

This is the base URL used by the Axios API client.

The frontend creates the Axios instance with:

```text
REACT_APP_API_URL
```

and falls back to:

```text
http://localhost:5000/api
```

when the variable is unavailable.

Therefore, local development can use:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 9.2 `REACT_APP_SOCKET_URL`

This is the Socket.IO server URL.

The frontend falls back to:

```text
http://localhost:5000
```

when the variable is unavailable.

For local development:

```env
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

# 10. Recommended Local Environment Files

The source provides `.env.example` files as templates.

A local backend environment can therefore be structured as:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=<your-local-or-development-postgresql-url>
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

JWT_SECRET=<development-secret>
JWT_EXPIRES_IN=24h

# Optional
REDIS_URL=
EMAIL_USER=
EMAIL_PASS=
EMAIL=
```

The frontend can use:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Important

Do not commit real credentials into `.env` files.

The repository's source configuration demonstrates that secrets are expected to come from the environment.

---

# 11. Database Setup

The backend uses Drizzle ORM against PostgreSQL.

The Drizzle configuration points to:

```text
src/db/schema.js
```

and uses:

```text
DATABASE_URL
```

for PostgreSQL credentials.

The configured dialect is:

```text
postgresql
```

---

## 11.1 Create or Obtain a PostgreSQL Database

The source supports Neon PostgreSQL through:

```text
@neondatabase/serverless
```

A compatible PostgreSQL database must therefore be available before the backend can initialize successfully.

Once the database exists, place its connection string into:

```env
DATABASE_URL=<connection-string>
```

---

# 12. Apply the Database Schema

From the backend directory:

```bash
npm run db:push
```

This executes:

```bash
drizzle-kit push
```

The Drizzle CLI loads the database configuration and applies the schema represented by:

```text
src/db/schema.js
```

The schema includes the major tables:

```text
users
categories
budgets
transactions
budget_users
invitations
budget_history
notifications
```

It also defines the application's transaction, budget-role, transaction-status, and invitation-status enums.

---

# 13. Seed the Database

The backend provides:

```bash
npm run db:seed
```

This runs:

```bash
node src/db/seed.js
```

The seed script initializes default financial categories.

The supplied source includes categories such as:

```text
Food
Transportation
Housing
Utilities
Entertainment
Health
Shopping
Personal Care
Education
Gifts & Donations
Salary
```

The seed source should be treated as the authoritative list for the current repository version.

---

# 14. Production Seeding Safety

The seed script contains a production safety check.

When:

```env
NODE_ENV=production
```

the script does **not** proceed automatically.

It requires:

```env
FORCE_SEED_PRODUCTION=true
```

before production seeding is allowed.

The script explicitly warns that production seeding can be dangerous and may reset existing data.

Therefore:

> Do not run the production seed command against a live database unless the consequences have been explicitly reviewed.

The source-supported override is:

```bash
FORCE_SEED_PRODUCTION=true npm run db:seed
```

---

# 15. Recommended Local Database Sequence

For a fresh development database:

```bash
cd backend
npm install
```

Configure:

```env
DATABASE_URL=<development-database-url>
```

Then:

```bash
npm run db:push
npm run db:seed
```

At this point, the database schema and default categories should be available to the application.

---

# 16. Start the Backend

From:

```text
backend/
```

run:

```bash
npm run dev
```

This executes:

```bash
nodemon server.js
```

For a normal start without Nodemon:

```bash
npm start
```

This executes:

```bash
node server.js
```

---

## 16.1 Backend Startup Sequence

The backend startup process is approximately:

```text
server.js
   │
   ▼
Load environment configuration
   │
   ▼
Validate required environment
   │
   ▼
Create Express application
   │
   ▼
Create HTTP server
   │
   ▼
Create Socket.IO server
   │
   ├── Configure CORS
   │
   └── Optional Redis adapter
   │
   ▼
Initialize Socket Manager
   │
   ▼
Register Socket.IO event handlers
   │
   ▼
Listen on PORT
```

The source also starts the production keep-alive mechanism when the environment is production.

---

# 17. Start the Frontend

From:

```text
frontend/
```

run:

```bash
npm start
```

The frontend uses Create React App's development server.

The frontend's local API configuration defaults to:

```text
http://localhost:5000/api
```

and its Socket.IO configuration defaults to:

```text
http://localhost:5000
```

Therefore, the typical local setup is:

```text
Browser
   │
   ▼
Frontend :3000
   │
   ├── REST ───────► Backend :5000/api
   │
   └── Socket.IO ──► Backend :5000
                         │
                         ▼
                    PostgreSQL
```

---

# 18. Expected Local Ports

The source defaults establish:

Component Default

---

Frontend `3000`Backend `5000`REST API `5000/api`Socket.IO `5000`

The backend `PORT` is configurable.

The frontend development server's port is managed by Create React App and can be changed using the normal Create React App environment/configuration mechanisms, although no custom frontend port configuration is defined by the supplied source.

---

# 19. Verify Backend Configuration

When the backend starts in development mode, the environment configuration logs information including:

```text
NODE_ENV
PORT
DATABASE_URL status
FRONTEND_URL
JWT_SECRET status
EMAIL status
```

The source intentionally reports the database as connected/configured rather than printing the database connection string itself.

The JWT log distinguishes whether the development default or a custom value is being used.

---

# 20. Verify Database Connectivity

Database initialization occurs when the backend loads its database configuration.

If `DATABASE_URL` is absent, the database configuration throws an error.

If the database connection cannot be initialized, the backend logs the failure and exits.

Therefore, a backend startup failure immediately related to:

```text
DATABASE_URL
```

should be treated as a database configuration/connectivity problem before investigating frontend behavior.

---

# 21. Verify the REST API

The backend mounts the API under:

```text
/api
```

The principal route groups are:

```text
/api/auth
/api/budgets
/api/transactions
/api/users
/api/reports
/api/invitations
/api/notifications
/api/categories
```

A successful backend startup means the Express application and route definitions have been loaded, but authentication-protected routes still require a valid JWT.

---

# 22. Verify Authentication

The normal authentication sequence is:

```text
Register
   │
   ▼
Login
   │
   ▼
JWT returned
   │
   ▼
Frontend stores token
   │
   ▼
Axios adds Authorization header
   │
   ▼
Authenticated API request
```

The frontend's authentication context also validates an existing token on application startup by calling the profile endpoint.

If token validation fails:

```text
localStorage token removed
        │
        ▼
authentication state cleared
```

---

# 23. Verify Socket.IO

The frontend establishes a Socket.IO connection when an authentication token exists.

The connection sends the token through the Socket.IO handshake query:

```text
query: { token }
```

The backend accepts either:

```text
socket.handshake.auth.token
```

or:

```text
socket.handshake.query.token
```

and verifies the JWT.

Therefore, Socket.IO authentication depends on the same JWT identity model used by the REST application.

---

# 24. Socket Authentication Verification

A successful authenticated Socket.IO connection results in the backend assigning the decoded JWT payload to:

```text
socket.user
```

The backend then places the user in a private room:

```text
user_<userId>
```

Budget-specific rooms are joined through the budget event mechanism.

The frontend exposes helpers for:

```text
joinBudgetRoom()
leaveBudgetRoom()
onBudgetUpdate()
onTransactionUpdate()
onLiveUsersUpdate()
```

---

# 25. First-Time Developer Workflow

A practical development workflow for the supplied repository is:

### Terminal 1 --- Backend

```bash
cd backend
npm install
```

Configure `.env`.

Then:

```bash
npm run db:push
npm run db:seed
npm run dev
```

### Terminal 2 --- Frontend

```bash
cd frontend
npm install
```

Configure `.env`.

Then:

```bash
npm start
```

### Browser

Open the frontend development address.

The exact browser address depends on the Create React App development server configuration, but the source defaults and backend CORS configuration are designed around:

```text
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

---

# 26. Development Cycle

For normal application development:

```text
Edit frontend
      │
      ▼
React development server reload
      │
      ▼
Verify UI/API behavior

Edit backend
      │
      ▼
Nodemon restarts server
      │
      ▼
Verify API/database behavior

Edit schema
      │
      ▼
Run db:push
      │
      ▼
Verify affected models/services

Edit seed data
      │
      ▼
Run db:seed against a safe development database
```

When working on a database change, do not assume that changing `schema.js` automatically changes an existing database. The repository provides an explicit:

```bash
npm run db:push
```

command for schema synchronization.

---

# 27. Running Backend Tests

The backend package defines:

```bash
npm test
```

which executes:

```bash
jest --runInBand --testTimeout=30000
```

The supplied backend repository includes tests for:

```text
auth.test.js
budget.test.js
transaction.test.js
```

The authentication tests cover scenarios including:

- Successful registration
- Duplicate-email registration rejection
- Successful login
- Incorrect-password rejection

The budget tests include authenticated budget creation behavior.

---

# 28. Running Frontend Tests

The frontend package defines:

```bash
npm test
```

which delegates to:

```bash
react-scripts test
```

The frontend package includes React Testing Library dependencies.

The supplied repository snapshot does not establish a complete frontend test inventory in this documentation part.

---

# 29. Building the Frontend

For a production frontend build:

```bash
npm run build
```

The command executes:

```bash
react-scripts build
```

The build process uses the frontend environment variables available at build time.

Therefore, when deploying the frontend, make sure:

```env
REACT_APP_API_URL=<production-api-url>/api
REACT_APP_SOCKET_URL=<production-socket-url>
```

are supplied to the frontend build environment as appropriate.

---

# 30. Backend Production Start

The backend production start command is:

```bash
npm start
```

which runs:

```bash
node server.js
```

Before starting in production, configure at minimum:

```env
NODE_ENV=production
DATABASE_URL=<production-database-url>
JWT_SECRET=<strong-secret>
FRONTEND_URL=<production-frontend-origin>
```

The source's environment validation will reject missing production requirements.

---

# 31. CORS Considerations

The backend CORS middleware uses:

```text
FRONTEND_URL
```

as its allowed origin.

Therefore, if the frontend is deployed at:

```text
https://example-frontend.example.com
```

the backend must be configured with the corresponding frontend origin.

A mismatch can produce browser-side CORS failures even when the backend itself is healthy.

The backend CORS configuration also enables credentials.

---

# 32. Common Failure: Missing `DATABASE_URL`

### Symptom

Backend fails during startup with a missing environment-variable error.

### Cause

The backend requires:

```env
DATABASE_URL
```

### Resolution

Configure the backend environment:

```env
DATABASE_URL=<valid-postgresql-connection-string>
```

Then restart:

```bash
npm run dev
```

---

# 33. Common Failure: Database Connection Failure

### Symptom

The backend reports that database initialization failed and exits.

### Likely causes

- Invalid `DATABASE_URL`
- Database unavailable
- Network/connectivity problem
- Invalid database credentials
- Database configuration mismatch

### Resolution sequence

1. Verify `DATABASE_URL`.
2. Confirm the database is reachable.
3. Confirm credentials.
4. Confirm the target database exists.
5. Restart the backend.

The backend intentionally exits if its database initialization fails.

---

# 34. Common Failure: Production JWT Configuration

### Symptom

Production backend refuses to start.

### Cause

Production requires:

```env
JWT_SECRET
```

and explicitly rejects the known development fallback secret.

### Resolution

Set a strong production-specific secret:

```env
JWT_SECRET=<unique-production-secret>
```

Do not use the development fallback.

---

# 35. Common Failure: Frontend Cannot Reach API

### Symptoms

The frontend loads, but:

- Login fails
- Budgets do not load
- Transactions do not load
- API requests fail

### First checks

Verify:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

and verify the backend is actually running on port `5000`.

Then verify the browser's network requests are targeting:

```text
http://localhost:5000/api/...
```

---

# 36. Common Failure: CORS Error

### Symptom

The browser reports a CORS policy error.

### Check

Backend:

```env
FRONTEND_URL=http://localhost:3000
```

Frontend:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

The backend CORS middleware uses `FRONTEND_URL` as the allowed origin.

If the frontend is running on another origin, configure the backend accordingly.

---

# 37. Common Failure: Socket.IO Does Not Connect

### Symptoms

- Real-time updates do not appear
- Live-user information does not update
- Socket connection logs show failures

### Check frontend

```env
REACT_APP_SOCKET_URL=http://localhost:5000
```

### Check backend

The backend must be running and its Socket.IO server is attached to the same HTTP server.

### Check authentication

The frontend only creates the Socket.IO connection when a JWT exists.

The backend also verifies the JWT during the Socket.IO handshake.

Therefore, a stale or invalid token can prevent Socket.IO authentication.

---

# 38. Common Failure: Schema Mismatch

### Symptom

The backend starts but database operations fail after a schema change.

### Resolution

After intentional schema changes, synchronize the development database:

```bash
npm run db:push
```

Then restart the backend if necessary.

Do not use a production database as a development schema experimentation environment.

---

# 39. Common Failure: Missing Categories

### Symptom

Category-based UI or transaction operations do not behave as expected because the development database does not contain the default category data.

### Resolution

Run:

```bash
npm run db:seed
```

against the intended development database.

---

# 40. Common Failure: Seed Refuses Production

### Symptom

The seed command aborts when `NODE_ENV=production`.

### Cause

This is intentional safety behavior.

### Resolution

Only when explicitly intended:

```bash
FORCE_SEED_PRODUCTION=true npm run db:seed
```

The production seed path should be treated as a potentially destructive operation.

---

# 41. Clean Development Reset Considerations

The supplied source provides:

```bash
npm run db:push
npm run db:seed
```

but does not provide a dedicated database-reset command in the backend package.

Therefore, this documentation does not prescribe an invented `db:reset`command.

If a completely clean database is required, the database lifecycle must be handled using the team's chosen PostgreSQL/Neon administration process, followed by:

```bash
npm run db:push
npm run db:seed
```

---

# 42. Environment Separation

A recommended conceptual separation is:

```text
Development
├── Development PostgreSQL
├── Development JWT secret
├── localhost frontend
└── localhost backend

Production
├── Production PostgreSQL
├── Production JWT secret
├── Production frontend URL
├── Production backend URL
└── Optional Redis
```

Never reuse production credentials merely to simplify local development.

---

# 43. Local Architecture Reference

A complete local environment should look approximately like:

```mermaid
flowchart LR
    Browser["Browser"]

    Frontend["React Dev Server\n:3000"]
    Backend["Express + Socket.IO\n:5000"]
    Database["PostgreSQL / Neon"]
    Redis["Optional Redis"]

    Browser --> Frontend
    Frontend -->|REST /api| Backend
    Frontend -->|Socket.IO| Backend
    Backend --> Database
    Backend -. optional Socket.IO adapter .-> Redis
```

---

# 44. Minimal Local Setup Checklist

Use this checklist for a new developer.

## Backend

- [ ] Node.js/npm available

- [ ] Backend dependencies installed

- [ ] `.env` configured

- [ ] `DATABASE_URL` configured

- [ ] Database reachable

- [ ] `npm run db:push` completed

- [ ] `npm run db:seed` completed

- [ ] Backend starts with `npm run dev`

## Frontend

- [ ] Frontend dependencies installed

- [ ] `.env` configured

- [ ] `REACT_APP_API_URL` configured

- [ ] `REACT_APP_SOCKET_URL` configured

- [ ] Backend running

- [ ] `npm start` succeeds

## Authentication

- [ ] Registration works

- [ ] Login returns a token

- [ ] Authenticated profile loads

- [ ] Browser stores the token

- [ ] Authenticated API calls include `Authorization: Bearer ...`

## Real-time

- [ ] Socket.IO connection establishes after login

- [ ] Socket authentication succeeds

- [ ] Budget rooms can be joined

- [ ] Real-time events can be received

---

# 45. What This Part Does Not Assume

The supplied repository does not provide enough evidence to claim:

- A specific Node.js version
- A specific PostgreSQL provider being mandatory beyond the implemented Neon-compatible configuration
- A particular operating system
- Docker as a required development mechanism
- A specific CI provider
- A specific deployment platform as the only supported production platform
- A formal database migration workflow beyond the supplied Drizzle commands
- A dedicated local Redis requirement
- A dedicated local email server requirement

These should be treated as environment choices rather than hard requirements unless established elsewhere in the project documentation/source.

---

# 46. Developer Onboarding Summary

The shortest source-supported onboarding sequence is:

```bash
# Backend
cd backend
npm install

# Configure backend .env
# DATABASE_URL is required

npm run db:push
npm run db:seed
npm run dev
```

Then, in another terminal:

```bash
# Frontend
cd frontend
npm install

# Configure frontend .env
# REACT_APP_API_URL
# REACT_APP_SOCKET_URL

npm start
```

The expected local relationship is:

```text
Frontend :3000
     │
     ├── REST → Backend :5000/api
     │
     └── WS   → Backend :5000
                    │
                    ▼
             PostgreSQL / Neon
```

---

# 47. Next Part

**Part 3 --- System Architecture**

The next document should go deeper than this quick-start guide and formally document:

- Complete frontend architecture
- Complete backend architecture
- Request lifecycle
- Authentication lifecycle
- REST request flow
- Service/model boundaries
- Context and hook relationships
- Database access flow
- Socket.IO architecture
- Redis scaling path
- Error propagation
- Cross-layer responsibilities
- Architectural dependency rules
- Runtime sequence diagrams\`