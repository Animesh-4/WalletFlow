# WalletFlow --- Local Development & Developer Setup

## Part 13 --- Developer Onboarding

This document defines the local development workflow for WalletFlow
based on the supplied repository structure, package scripts,
configuration, and documented runtime architecture.

The development environment consists of:

``` text
Frontend
React
    │
    ▼
Backend
Node.js / Express
    │
    ├── PostgreSQL / Neon
    ├── Socket.IO
    ├── optional Redis
    └── optional email integration
```

The repository contains separate application areas for:

``` text
frontend/
backend/
```

and each application has its own package configuration.

------------------------------------------------------------------------

# 1. Developer Setup Overview

A new developer should bring the application up in this order:

``` text
1. Install prerequisites
2. Clone repository
3. Install backend dependencies
4. Install frontend dependencies
5. Configure backend environment
6. Configure frontend environment
7. Configure PostgreSQL / Neon
8. Synchronize database schema
9. Seed development data if required
10. Start backend
11. Start frontend
12. Verify authentication
13. Verify budget/transaction flows
14. Run tests
```

This order minimizes debugging across multiple uninitialized layers.

------------------------------------------------------------------------

# 2. Repository Structure

The repository is divided into major areas:

``` text
frontend/
backend/
```

The backend contains:

``` text
src/
├── config/
├── controllers/
├── db/
├── middleware/
├── models/
├── routes/
├── services/
├── socket/
├── tests/
└── utils/
```

The frontend contains the React application and its:

``` text
components/
context/
hooks/
pages/
services/
```

architecture.

------------------------------------------------------------------------

# 3. Backend Prerequisites

The backend is a Node.js application.

Before running it locally, install:

``` text
Node.js
npm
PostgreSQL/Neon database access
```

Additional infrastructure is only needed for features being exercised:

``` text
Redis
Email provider/account
```

The supplied repository does not establish an exact minimum Node.js
version in the source examined for this documentation.

Therefore the project's package/CI configuration should be checked
before standardizing a version requirement.

------------------------------------------------------------------------

# 4. Frontend Prerequisites

The frontend is a React application.

Required local tooling includes:

``` text
Node.js
npm
```

The frontend communicates with the backend through:

``` text
REACT_APP_API_URL
```

and the Socket.IO client.

------------------------------------------------------------------------

# 5. Install Backend Dependencies

From the backend directory:

``` bash
npm install
```

This installs the dependencies declared in the backend package
configuration.

The backend package includes runtime dependencies for:

``` text
Express
PostgreSQL/Neon
Drizzle
JWT
bcrypt
Socket.IO
Redis adapter
email
validation
```

and development tooling for testing/linting.

------------------------------------------------------------------------

# 6. Install Frontend Dependencies

From the frontend directory:

``` bash
npm install
```

The frontend package provides the React application and client-side
dependencies.

The exact package set should be taken from the repository's current
`package.json`.

------------------------------------------------------------------------

# 7. Backend Environment

Create the backend environment configuration according to the
repository's expected environment variables.

A local configuration should contain the values required for:

``` text
Application runtime
Database
JWT
Frontend origin
```

Optional configuration is needed for:

``` text
Redis
Email
```

when those integrations are used locally.

------------------------------------------------------------------------

# 8. Example Backend Local Environment

A typical local configuration is:

``` env
NODE_ENV=development
PORT=5000

DATABASE_URL=<development-postgresql-url>

JWT_SECRET=<development-secret>
JWT_EXPIRES_IN=<development-expiration>

FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

REDIS_URL=<optional>
EMAIL_USER=<optional>
EMAIL_PASS=<optional>
EMAIL=<optional>
```

Use actual values appropriate to the developer's local infrastructure.

Do not commit real credentials.

------------------------------------------------------------------------

# 9. Frontend Environment

The frontend requires the API URL configuration.

Typical local configuration:

``` env
REACT_APP_API_URL=http://localhost:5000/api
```

The frontend Axios client uses this value as its API base URL.

If the variable is absent, the current frontend client has a localhost
fallback. fileciteturn6file5L608-L632

------------------------------------------------------------------------

# 10. Frontend and Backend URLs

A normal local setup is:

``` text
Frontend
http://localhost:3000

Backend
http://localhost:5000

API
http://localhost:5000/api
```

The exact frontend development port depends on the frontend toolchain
configuration.

The backend default documented in the repository architecture is:

``` text
5000
```

------------------------------------------------------------------------

# 11. CORS Alignment

The backend uses:

``` text
FRONTEND_URL
```

to configure the allowed frontend origin.

For local development, the values should align:

``` env
FRONTEND_URL=http://localhost:3000
```

and:

``` env
REACT_APP_API_URL=http://localhost:5000/api
```

If the frontend runs on a different origin, update `FRONTEND_URL`
accordingly.

------------------------------------------------------------------------

# 12. Database Setup

WalletFlow requires a PostgreSQL-compatible database.

The repository uses:

``` text
Neon serverless PostgreSQL
Drizzle ORM
```

The backend reads:

``` env
DATABASE_URL=...
```

and initializes the database during startup.

If the database cannot be initialized, the backend does not continue as
a normally functioning application. fileciteturn5file7L987-L1022

------------------------------------------------------------------------

# 13. Database Schema Synchronization

The backend package exposes:

``` bash
npm run db:push
```

which runs the configured Drizzle Kit schema push command.

After configuring:

``` text
DATABASE_URL
```

run the schema synchronization command before starting features that
depend on database tables.

------------------------------------------------------------------------

# 14. Database Seeding

The backend package also exposes:

``` bash
npm run db:seed
```

The seed entry point is:

``` text
src/db/seed.js
```

The current seed initializes default category data.

------------------------------------------------------------------------

# 15. Development Seed Safety

The seed process has a production safeguard.

In production:

``` text
NODE_ENV=production
```

requires:

``` text
FORCE_SEED_PRODUCTION=true
```

before the seed process proceeds.

For normal local development, this production override should not be
required.

------------------------------------------------------------------------

# 16. Recommended Database Initialization

A clean development database setup is:

``` text
Configure DATABASE_URL
        │
        ▼
npm run db:push
        │
        ▼
npm run db:seed
```

Then start the backend.

This ensures the schema and default categories are present before using
the UI.

------------------------------------------------------------------------

# 17. Start Backend

From the backend directory, use the package's development command.

The exact command should be taken from the current backend
`package.json`.

The resulting process should expose the configured backend port,
normally:

``` text
5000
```

------------------------------------------------------------------------

# 18. Start Frontend

From the frontend directory, use the package's development command
defined by its `package.json`.

The React development server should then expose the application in the
browser.

A common local arrangement is:

``` text
http://localhost:3000
```

The exact port should be confirmed from the current frontend scripts.

------------------------------------------------------------------------

# 19. Verify Backend First

Before opening the frontend, verify that the backend starts
successfully.

Check for:

``` text
Environment configuration loaded
Database initialized
HTTP server listening
Socket.IO initialized
```

If the backend fails during startup, fix the backend before
investigating frontend errors.

------------------------------------------------------------------------

# 20. Verify Frontend Second

After the backend is running:

``` text
Start frontend
Open browser
Load application
```

The frontend should be able to reach:

``` text
REACT_APP_API_URL
```

and establish its normal application state.

------------------------------------------------------------------------

# 21. First Authentication Check

The first functional verification should be:

``` text
Register
   │
   ▼
Login
   │
   ▼
JWT returned
   │
   ▼
Token stored
   │
   ▼
Profile request
   │
   ▼
Authenticated UI
```

The frontend authentication context stores the token and validates it
through the profile endpoint when the application starts.
fileciteturn6file3L383-L404

------------------------------------------------------------------------

# 22. Authentication Debugging

If login fails:

``` text
Check browser network request
        │
        ▼
POST /api/auth/login
        │
        ▼
Check backend controller
        │
        ▼
Check authService
        │
        ▼
Check database user
```

If login succeeds but the user immediately appears logged out:

``` text
Check token storage
Check /auth/profile
Check JWT_SECRET
Check JWT expiration
Check Axios Authorization header
```

------------------------------------------------------------------------

# 23. Verify Authenticated API Calls

After login, inspect a protected request.

The request should contain:

``` http
Authorization: Bearer <token>
```

The shared Axios client adds this automatically when a token is present.
fileciteturn6file5L620-L632

------------------------------------------------------------------------

# 24. Verify Budget Flow

After authentication:

``` text
Create/open budget
      │
      ▼
Budget list
      │
      ▼
Budget details
      │
      ▼
Transactions
      │
      ▼
Collaboration
```

This exercises multiple backend layers:

``` text
Auth
Budget
BudgetUser
Transaction
Socket
```

------------------------------------------------------------------------

# 25. Verify Budget Roles

Use at least two test users to validate:

``` text
owner
editor
viewer
```

The current service behavior establishes:

``` text
Owner
  ├── modify budget
  └── delete budget

Editor
  └── increase total budget

Viewer
  └── cannot modify budget
```

The backend must be used as the authoritative verification point.

------------------------------------------------------------------------

# 26. Verify Transactions

After a budget is available:

``` text
Create transaction
View transactions
Update transaction
Delete transaction
```

This exercises:

``` text
transaction route
transaction controller
transaction service
transaction model
database
```

and should be followed by a real-time check if transaction events are
enabled for the tested workflow.

------------------------------------------------------------------------

# 27. Verify Real-Time Connection

After authentication, verify that the frontend can establish its
Socket.IO connection.

Then verify:

``` text
Join budget room
      │
      ▼
Budget room event
      │
      ▼
Live update
```

For collaboration testing, use two browser sessions/users.

------------------------------------------------------------------------

# 28. Two-User Collaboration Test

Recommended local test:

``` text
Browser A
  └── User A

Browser B
  └── User B
```

Add both users to the same budget.

Then:

``` text
User A changes budget/transaction
        │
        ▼
User B observes real-time update
```

This is a useful integration check across:

``` text
REST
Database
Socket.IO
React state
```

------------------------------------------------------------------------

# 29. Redis Development

Redis is optional for single-process local development.

You normally do not need Redis merely to run:

``` text
Frontend
Backend
PostgreSQL
```

If testing distributed Socket.IO behavior, configure:

``` env
REDIS_URL=...
```

and run the backend instances against the same Redis infrastructure.

------------------------------------------------------------------------

# 30. Distributed Socket Testing

A meaningful Redis test requires more than simply setting `REDIS_URL`.

The test should involve:

``` text
Backend instance A
        │
        ▼
Redis
        ▲
        │
Backend instance B
```

with clients connected to different backend instances.

Then verify that relevant Socket.IO events propagate correctly across
instances.

------------------------------------------------------------------------

# 31. Email Development

Email configuration is feature-specific.

If testing:

``` text
Forgot password
Invitation email
```

configure the email settings expected by the backend email service.

If email is not configured, avoid treating email-delivery failures as
database or authentication failures.

------------------------------------------------------------------------

# 32. Password Reset Local Test

A local password-reset test should verify:

``` text
Forgot password request
       │
       ▼
Reset token generation
       │
       ▼
Email/reset link
       │
       ▼
Reset password
       │
       ▼
Login with new password
```

The reset token is hashed before persistence and has a one-hour expiry
in the current implementation. fileciteturn6file0L95-L125

------------------------------------------------------------------------

# 33. Invitation Local Test

A collaboration invitation test should verify:

``` text
User A invites User B
       │
       ▼
Invitation created
       │
       ▼
Invitation link
       │
       ▼
User B logs in
       │
       ▼
Accept invitation
       │
       ▼
Budget membership
```

The frontend supports a pending invitation token through the
authentication flow.

------------------------------------------------------------------------

# 34. Running Backend Tests

The backend package provides a Jest test command:

``` bash
npm test
```

The configured test execution uses:

``` text
jest --runInBand --testTimeout=30000
```

This runs tests serially with a 30-second timeout.

------------------------------------------------------------------------

# 35. Existing Test Areas

The supplied backend test structure includes:

``` text
auth.test.js
budget.test.js
transaction.test.js
```

These cover important baseline domain/API behavior.

They should be run after backend changes.

------------------------------------------------------------------------

# 36. Recommended Test Sequence

After a backend change:

``` text
1. Run targeted test
2. Run complete backend test suite
3. Start backend
4. Exercise affected endpoint
5. Exercise frontend flow
6. Check real-time behavior if relevant
```

This catches both isolated logic errors and integration regressions.

------------------------------------------------------------------------

# 37. Frontend Development Verification

When changing frontend code:

``` text
1. Start frontend
2. Check browser console
3. Check network requests
4. Verify API responses
5. Verify React state
6. Verify Socket.IO listeners if applicable
7. Test loading/error states
```

Do not assume a successful HTTP request means the React state was
updated correctly.

------------------------------------------------------------------------

# 38. Browser Developer Tools

For API debugging, inspect:

``` text
Network
```

and verify:

``` text
Request URL
HTTP method
Authorization header
Request body
Response status
Response body
```

For Socket.IO debugging, inspect:

``` text
WebSocket / Socket.IO activity
```

and frontend console logging where available.

------------------------------------------------------------------------

# 39. Backend Logging

When debugging backend behavior, identify the layer first:

``` text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Model
  ↓
Database
```

Avoid adding arbitrary logging everywhere.

Prefer temporary logs around the suspected boundary and remove debugging
output once the issue is resolved.

------------------------------------------------------------------------

# 40. Common Startup Problem --- Database

### Symptom

Backend fails during startup.

### Check

``` text
DATABASE_URL
database availability
Neon connectivity
```

The database initialization is a startup dependency.

------------------------------------------------------------------------

# 41. Common Startup Problem --- JWT

### Symptom

Authentication fails immediately.

### Check

``` text
JWT_SECRET
JWT_EXPIRES_IN
```

For production, also verify that the known default secret is not being
used.

------------------------------------------------------------------------

# 42. Common Startup Problem --- CORS

### Symptom

Browser reports a CORS error.

### Check

``` text
FRONTEND_URL
frontend origin
backend URL
```

The backend CORS configuration is based on the configured frontend URL.
fileciteturn5file2L337-L354

------------------------------------------------------------------------

# 43. Common Startup Problem --- API URL

### Symptom

Frontend loads but API calls fail.

### Check

``` text
REACT_APP_API_URL
```

Verify that it points to:

``` text
http://localhost:5000/api
```

or the actual configured backend API address.

Remember that frontend environment values are build-time configuration.

------------------------------------------------------------------------

# 44. Common Problem --- 401 After Login

If the login request succeeds but subsequent requests return:

``` text
401
```

check:

``` text
localStorage token
Authorization header
JWT validity
API base URL
```

The Axios client is expected to attach:

``` text
Authorization: Bearer <token>
```

automatically.

------------------------------------------------------------------------

# 45. Common Problem --- 403 on Budget Operation

A `403` budget response can be an expected authorization result.

Check:

``` text
User membership
Budget role
Requested operation
```

Examples:

``` text
viewer → budget modification
non-owner → budget deletion
non-member → budget access
```

These are intentionally restricted by the backend service.

------------------------------------------------------------------------

# 46. Common Problem --- Socket Not Updating

Check in this order:

``` text
Socket connected?
       ↓
JWT accepted?
       ↓
Correct budget room joined?
       ↓
Event emitted?
       ↓
Correct event name?
       ↓
Frontend listener active?
       ↓
React state updated?
```

Do not immediately change database logic when the failure may be
entirely in event delivery.

------------------------------------------------------------------------

# 47. Common Problem --- Seed Failure

If:

``` bash
npm run db:seed
```

fails:

``` text
Check DATABASE_URL
Check database connectivity
Check NODE_ENV
Check production seed protection
```

If the environment is production, the seed process requires:

``` text
FORCE_SEED_PRODUCTION=true
```

------------------------------------------------------------------------

# 48. Common Problem --- Wrong Database

If expected tables/data are missing:

``` text
Check DATABASE_URL
```

before running more commands.

Make sure:

``` text
db:push
db:seed
backend runtime
```

are all targeting the intended database.

------------------------------------------------------------------------

# 49. Clean Local Rebuild Strategy

When the local environment becomes inconsistent:

``` text
1. Stop frontend
2. Stop backend
3. Verify environment files
4. Verify DATABASE_URL
5. Reinstall dependencies if necessary
6. Synchronize schema
7. Reseed development data if appropriate
8. Restart backend
9. Restart frontend
```

Do not destroy a shared database merely to solve a local application
issue.

------------------------------------------------------------------------

# 50. New Developer First-Day Checklist

``` text
[ ] Repository cloned
[ ] Node/npm installed
[ ] Backend dependencies installed
[ ] Frontend dependencies installed
[ ] Backend environment configured
[ ] Frontend environment configured
[ ] Database accessible
[ ] Schema synchronized
[ ] Development seed completed
[ ] Backend starts
[ ] Frontend starts
[ ] Registration works
[ ] Login works
[ ] Protected API request works
[ ] Budget can be opened
[ ] Transaction can be created
[ ] Socket connection works
```

------------------------------------------------------------------------

# 51. Feature Development Workflow

For a new feature:

``` text
Understand domain
      │
      ▼
Inspect schema/model
      │
      ▼
Inspect backend service
      │
      ▼
Add/update controller/route
      │
      ▼
Add tests
      │
      ▼
Update frontend API service
      │
      ▼
Update React state/context
      │
      ▼
Update UI
      │
      ▼
Add real-time behavior if required
      │
      ▼
Test end-to-end
```

------------------------------------------------------------------------

# 52. Backend-First Development

For domain-heavy features, prefer:

``` text
Schema
  ↓
Model
  ↓
Service
  ↓
Controller
  ↓
Route
  ↓
Frontend API
  ↓
UI
```

This keeps the backend contract explicit before building UI assumptions.

------------------------------------------------------------------------

# 53. Real-Time Feature Development

For a feature requiring live updates:

``` text
Durable REST operation
       │
       ▼
Database mutation
       │
       ▼
Socket event
       │
       ▼
Room/user delivery
       │
       ▼
Frontend listener
       │
       ▼
React state
```

Do not use Socket.IO as a substitute for persistence.

------------------------------------------------------------------------

# 54. Pull Request Validation

Before opening a pull request:

``` text
[ ] Backend tests pass
[ ] Frontend builds/tests pass where configured
[ ] Environment changes documented
[ ] API changes documented
[ ] Database changes reviewed
[ ] Authorization reviewed
[ ] Socket events reviewed
[ ] Existing UI flows tested
[ ] No secrets committed
[ ] Debug logging removed
```

------------------------------------------------------------------------

# 55. Developer Documentation Rule

When changing architecture, update the relevant documentation part.

Examples:

``` text
New API endpoint
→ API documentation

New database table
→ Data model documentation

New environment variable
→ Configuration documentation

New socket event
→ Real-time documentation

New authentication rule
→ Authentication documentation
```

This keeps implementation and operational knowledge synchronized.

------------------------------------------------------------------------

# 56. Local Development Architecture

A complete local environment can be visualized as:

``` text
Browser
  │
  ├──────── HTTP ────────► Backend :5000
  │                          │
  │                          ├── Express
  │                          ├── Socket.IO
  │                          │
  │                          └── Drizzle
  │                                │
  │                                ▼
  │                           PostgreSQL/Neon
  │
  └──── Socket.IO ─────────► Backend :5000

Optional:
Backend ─────────► Redis
Backend ─────────► Email provider
```

------------------------------------------------------------------------

# 57. Developer Environment Principle

The local environment should reproduce the production architecture where
practical, but it does not need every production integration to develop
ordinary features.

For example:

``` text
Core development:
Frontend + Backend + PostgreSQL

Optional:
Redis
Email
```

Use the minimum infrastructure required for the feature under
development.

------------------------------------------------------------------------

# 58. Developer Setup Summary

The recommended local workflow is:

``` text
Clone
  │
  ▼
Install dependencies
  │
  ▼
Configure environments
  │
  ▼
Configure database
  │
  ▼
npm run db:push
  │
  ▼
npm run db:seed
  │
  ▼
Start backend
  │
  ▼
Start frontend
  │
  ▼
Register/login
  │
  ▼
Test protected API
  │
  ▼
Test budget/transactions
  │
  ▼
Test Socket.IO when needed
```

The central principle is:

> **Initialize infrastructure first, verify the backend independently,
> then bring up the frontend and validate the complete request/response
> and real-time paths.**

------------------------------------------------------------------------

# 59. Next Part

**Part 14 --- Testing Strategy & Quality Engineering**

The next document will describe the project's testing architecture and
production-quality verification:

-   Existing Jest setup
-   Authentication tests
-   Budget tests
-   Transaction tests
-   Test organization
-   Unit vs integration boundaries
-   API testing
-   Database testing considerations
-   Authentication test cases
-   Authorization test cases
-   Socket testing strategy
-   Frontend testing strategy
-   Regression testing
-   Test data management
-   Mocking boundaries
-   CI-quality expectations
-   Coverage gaps
-   Definition of done
-   Production readiness verification
