# WalletFlow --- Backend Architecture

## Part 7 --- Backend Architecture

This document describes the WalletFlow backend as implemented in the
supplied repository.

The backend is a Node.js/Express application with:

-   Environment-driven configuration
-   PostgreSQL/Neon persistence through Drizzle ORM
-   Domain-oriented REST routes
-   Controllers
-   Domain services
-   Database models
-   Authentication middleware
-   Validation middleware
-   Centralized error handling
-   Socket.IO real-time communication
-   Optional Redis Socket.IO adapter
-   Automated backend tests

The repository structure explicitly separates these concerns into
`config`, `controllers`, `db`, `middleware`, `models`, `routes`,
`services`, `socket`, `tests`, and `utils`.
fileciteturn5file7L911-L981

------------------------------------------------------------------------

# 1. Backend Architecture Overview

The backend can be modeled as:

``` text
                     HTTP Client
                          │
                          ▼
                     Express App
                          │
                ┌─────────┴─────────┐
                │                   │
             Middleware          Routes
                │                   │
                └─────────┬─────────┘
                          ▼
                     Controllers
                          │
                          ▼
                       Services
                          │
                    ┌─────┴─────┐
                    ▼           ▼
                  Models      Other
                    │        services
                    ▼
                 Drizzle
                    │
                    ▼
             PostgreSQL / Neon
```

The real-time path is separate:

``` text
Socket.IO Client
       │
       ▼
Socket.IO Server
       │
       ▼
Authentication
       │
       ▼
Socket Event Handlers
       │
       ├── Budget events
       └── User events
```

------------------------------------------------------------------------

# 2. Backend Process Entry Point

The backend process begins at:

``` text
server.js
```

This is different from:

``` text
src/app.js
```

The distinction is important.

### `server.js`

Owns the process/runtime lifecycle.

### `src/app.js`

Owns Express application composition.

Conceptually:

``` text
server.js
    │
    ├── configuration
    ├── create Express app
    ├── create HTTP server
    ├── initialize Socket.IO
    ├── initialize socket handlers
    └── listen
             │
             ▼
          Runtime
```

------------------------------------------------------------------------

# 3. Express Application Boundary

The Express application is defined in:

``` text
src/app.js
```

Its responsibilities include:

-   Creating the Express application
-   Configuring CORS
-   Configuring JSON parsing
-   Mounting API routes
-   Registering centralized error handling

The application imports the domain routes:

``` text
authRoutes
budgetRoutes
transactionRoutes
userRoutes
reportRoutes
invitationRoutes
notificationRoutes
categoryRoutes
```

and mounts them below `/api`. fileciteturn5file8L1052-L1086

------------------------------------------------------------------------

# 4. API Namespace

The backend API has the following primary route groups:

``` text
/api/auth
/api/budgets
/api/transactions
/api/users
/api/reports
/api/invitations
/api/notifications
/api/categories
```

This gives the REST interface a domain-oriented structure.

The API namespace should remain stable because the frontend API services
depend on these paths.

------------------------------------------------------------------------

# 5. Request Lifecycle

A typical request follows:

``` text
HTTP Request
     │
     ▼
Express
     │
     ▼
CORS / JSON parsing
     │
     ▼
Route matching
     │
     ▼
Authentication / validation
     │
     ▼
Controller
     │
     ▼
Service
     │
     ▼
Model
     │
     ▼
Drizzle
     │
     ▼
PostgreSQL
     │
     ▼
Response
```

Error paths branch into centralized error handling.

------------------------------------------------------------------------

# 6. Middleware Architecture

The backend contains:

``` text
middleware/
├── auth.js
├── cors.js
├── errorHandler.js
└── validation.js
```

These modules form cross-cutting HTTP infrastructure.

They should not contain domain-specific financial business rules.

------------------------------------------------------------------------

# 7. Authentication Middleware

The authentication middleware is:

``` text
src/middleware/auth.js
```

Its basic lifecycle is:

``` text
Request
   │
   ▼
Authorization header
   │
   ▼
Extract Bearer token
   │
   ▼
Verify JWT
   │
   ▼
req.user
   │
   ▼
Controller
```

The implementation reads the Authorization header, requires a Bearer
token, verifies it, and assigns the decoded token payload to `req.user`.
fileciteturn5file2L299-L334

------------------------------------------------------------------------

# 8. Authentication Failure Semantics

The current middleware distinguishes:

### Missing credentials

``` text
401 Unauthorized
```

### Invalid/expired credentials

``` text
403 Forbidden
```

These status behaviors are part of the current implementation and should
be preserved when modifying authentication middleware unless the API
contract is intentionally changed. fileciteturn5file2L299-L334

------------------------------------------------------------------------

# 9. CORS Middleware

The backend uses a dedicated CORS configuration.

The allowed frontend origin comes from:

``` text
config.FRONTEND_URL
```

The configured methods include:

``` text
GET
HEAD
PUT
PATCH
POST
DELETE
```

Credentials are enabled.

This makes the frontend origin a deployment-level configuration value
rather than a hard-coded production domain.
fileciteturn5file2L337-L354

------------------------------------------------------------------------

# 10. Validation Middleware

The backend contains:

``` text
src/middleware/validation.js
```

This provides request validation at the HTTP boundary.

The architectural rule is:

``` text
External input
     │
     ▼
Validation
     │
     ▼
Controller
```

Validation should remain separate from persistence so malformed requests
can be rejected before they reach domain/database operations.

The exact validation schema inventory should be derived from the current
middleware and route usage when documenting endpoint-level contracts.

------------------------------------------------------------------------

# 11. Error Handling

The backend uses:

``` text
src/middleware/errorHandler.js
```

as the centralized Express error boundary.

Controllers can pass errors using:

``` javascript
next(error)
```

rather than implementing unrelated error-response logic in every
endpoint.

Conceptually:

``` text
Controller
    │
    ├── success → response
    │
    └── failure
          │
          ▼
       next(error)
          │
          ▼
    errorHandler
          │
          ▼
      HTTP error
```

------------------------------------------------------------------------

# 12. Route Architecture

Routes are located under:

``` text
src/routes/
```

with:

``` text
auth.js
budget.js
category.js
invitation.js
notification.js
report.js
transaction.js
user.js
```

Routes should primarily answer:

> Which endpoint exists, which middleware applies, and which controller
> handles it?

They should not become the primary home for complex domain logic.

------------------------------------------------------------------------

# 13. Controller Architecture

Controllers are located under:

``` text
src/controllers/
```

with one major controller per domain.

``` text
authController.js
budgetController.js
categoryController.js
invitationController.js
notificationController.js
reportController.js
transactionController.js
userController.js
```

Controllers form the HTTP-to-domain boundary.

------------------------------------------------------------------------

# 14. Controller Responsibilities

A controller generally performs:

``` text
1. Read request data
2. Obtain authenticated identity
3. Call domain service/model operation
4. Set HTTP response
5. Pass errors onward
```

For example, notification operations use the authenticated user ID to
retrieve or mutate notification data. fileciteturn5file9L1216-L1249

------------------------------------------------------------------------

# 15. Service Architecture

Domain services are under:

``` text
src/services/
```

``` text
authService.js
budgetService.js
emailService.js
invitationService.js
notificationService.js
reportService.js
transactionService.js
userService.js
```

Services are the main business-logic boundary.

------------------------------------------------------------------------

# 16. Why the Service Layer Matters

A controller should understand HTTP.

A model should understand persistence.

A service can understand the business operation connecting them.

For example:

``` text
HTTP request
     │
     ▼
Controller
     │
     ▼
"Create transaction"
     │
     ▼
Transaction service
     │
     ├── Validate business conditions
     ├── Apply domain rules
     ├── Persist data
     └── Trigger other domain behavior if implemented
     │
     ▼
Transaction model
```

This separation keeps business workflows from becoming tightly coupled
to Express.

------------------------------------------------------------------------

# 17. Authentication Service

Authentication business logic is concentrated in:

``` text
src/services/authService.js
```

It works with:

``` text
User model
JWT configuration
password hashing/comparison
```

The conceptual flow is:

``` text
Credentials
    │
    ▼
Auth Controller
    │
    ▼
Auth Service
    │
    ├── Find user
    ├── Verify password
    └── Generate JWT
    │
    ▼
HTTP response
```

------------------------------------------------------------------------

# 18. Budget Service

Budget business logic is concentrated in:

``` text
src/services/budgetService.js
```

It is the primary place to inspect when changing:

-   Budget creation rules
-   Budget updates
-   Budget deletion
-   Membership behavior
-   Budget-level business logic
-   Budget history behavior

The controller should remain the HTTP boundary while the service owns
domain workflow.

------------------------------------------------------------------------

# 19. Transaction Service

Transaction logic is concentrated in:

``` text
src/services/transactionService.js
```

Start here for:

-   Transaction creation rules
-   Transaction updates
-   Transaction retrieval behavior
-   Transaction-level business logic

Database-specific operations remain in:

``` text
models/Transaction.js
```

------------------------------------------------------------------------

# 20. Report Service

Reporting logic is concentrated in:

``` text
src/services/reportService.js
```

This is the appropriate place to inspect when report calculations or
aggregation behavior needs to change.

The frontend report service consumes the resulting API.

------------------------------------------------------------------------

# 21. Invitation Service

Invitation workflows are concentrated in:

``` text
src/services/invitationService.js
```

An invitation operation can span:

``` text
Invitation
Budget
User
Membership
Notification
Email
```

Therefore, invitation logic is a good example of why a service layer is
valuable.

------------------------------------------------------------------------

# 22. Notification Service

Notification logic is concentrated in:

``` text
src/services/notificationService.js
```

The notification controller remains responsible for HTTP behavior while
the service can own domain operations.

------------------------------------------------------------------------

# 23. Email Service

Email integration is separated into:

``` text
src/services/emailService.js
```

This prevents email-provider details from being embedded directly into
controllers.

The configuration layer supplies optional email settings.

The current environment configuration recognizes:

``` text
EMAIL_USER
EMAIL_PASS
EMAIL
```

------------------------------------------------------------------------

# 24. User Service

User-specific business operations are located in:

``` text
src/services/userService.js
```

The associated persistence boundary is:

``` text
models/User.js
```

and the HTTP boundary is:

``` text
controllers/userController.js
routes/user.js
```

------------------------------------------------------------------------

# 25. Model Architecture

The model layer contains:

``` text
models/
├── Budget.js
├── BudgetHistory.js
├── BudgetUser.js
├── Category.js
├── Invitation.js
├── Notification.js
├── Transaction.js
└── User.js
```

Models should primarily represent persistence operations.

------------------------------------------------------------------------

# 26. Model vs Service

The distinction is:

### Model

``` text
How do I retrieve/store this data?
```

### Service

``` text
What business operation should happen?
```

For example:

``` text
Service
  │
  ├── Decide what should happen
  │
  ▼
Model
  │
  └── Execute database operation
```

This distinction is important when adding functionality.

------------------------------------------------------------------------

# 27. Database Configuration

The database boundary is:

``` text
src/config/database.js
```

The implementation:

-   Configures Neon WebSocket behavior
-   Creates a Neon `Pool`
-   Initializes Drizzle
-   Supplies the database schema
-   Fails startup if initialization fails

The database URL is sourced from:

``` text
DATABASE_URL
```

fileciteturn5file7L987-L1022

------------------------------------------------------------------------

# 28. Drizzle ORM

Drizzle is the ORM/data-access framework.

The backend uses:

``` text
drizzle-orm
drizzle-kit
```

The configured dialect is:

``` text
postgresql
```

The schema source is:

``` text
src/db/schema.js
```

The Drizzle configuration establishes these paths and settings.
fileciteturn5file8L1089-L1102

------------------------------------------------------------------------

# 29. Database Schema Boundary

The database schema lives in:

``` text
src/db/schema.js
```

It defines the database-level contract for:

``` text
users
categories
budgets
transactions
budget_users
invitations
budget_history
notifications
```

and associated enums/relationships.

Schema changes should be considered alongside:

``` text
models
services
controllers
frontend API expectations
```

------------------------------------------------------------------------

# 30. Database Initialization

The backend database initialization path is:

``` text
Environment
   │
   ▼
DATABASE_URL
   │
   ▼
Neon Pool
   │
   ▼
Drizzle
   │
   ▼
Models
```

The database initialization is a hard startup dependency.

If initialization fails, the backend terminates rather than starting
with an unusable persistence layer.

------------------------------------------------------------------------

# 31. Database Schema Synchronization

The backend package provides:

``` bash
npm run db:push
```

which executes:

``` text
drizzle-kit push
```

This is the repository-provided mechanism for synchronizing the schema
with the configured database.

------------------------------------------------------------------------

# 32. Database Seeding

The seed entry point is:

``` text
src/db/seed.js
```

The package exposes:

``` bash
npm run db:seed
```

The current seed initializes default category data.

The seed also has production safety behavior and requires an explicit
override before production seeding.

------------------------------------------------------------------------

# 33. Production Seed Protection

The seed logic protects production by requiring:

``` text
FORCE_SEED_PRODUCTION=true
```

when:

``` text
NODE_ENV=production
```

This should be considered a safety boundary.

Production seeding should never be part of an ordinary deployment
command unless the operation has been explicitly reviewed.

------------------------------------------------------------------------

# 34. Socket.IO Server Architecture

The backend attaches Socket.IO to the same HTTP server used by Express.

Conceptually:

``` text
Node HTTP Server
       │
       ├── Express
       │
       └── Socket.IO
```

This means REST and real-time traffic share the same backend
process/server infrastructure.

------------------------------------------------------------------------

# 35. Socket Configuration

Socket configuration lives under:

``` text
src/config/socket.js
```

and socket runtime behavior lives under:

``` text
src/socket/
```

The main socket files are:

``` text
socketHandler.js
socketManager.js
budgetEvents.js
userEvents.js
```

------------------------------------------------------------------------

# 36. Socket Authentication

Socket authentication occurs during the connection lifecycle.

The backend extracts a JWT from the Socket.IO handshake and verifies it.

The implementation supports the token from:

``` text
socket.handshake.auth.token
```

or:

``` text
socket.handshake.query.token
```

After successful verification:

``` text
socket.user = decoded token
```

and the socket joins a private user room.

The supplied implementation explicitly performs these operations.
fileciteturn4file9L1093-L1147

------------------------------------------------------------------------

# 37. Socket Handler

The central connection handler is:

``` text
src/socket/socketHandler.js
```

Its responsibilities include:

-   Accepting connections
-   Authenticating the socket
-   Attaching user identity
-   Joining user-specific room
-   Registering event handlers
-   Handling disconnects

It therefore represents the Socket.IO equivalent of the HTTP
authentication/request boundary.

------------------------------------------------------------------------

# 38. Budget Socket Events

Budget-specific events are implemented in:

``` text
src/socket/budgetEvents.js
```

The current event layer supports operations around:

``` text
joinBudget
leaveBudget
```

and contains the mechanisms for budget-room communication.

This is the real-time counterpart to the budget REST API.

------------------------------------------------------------------------

# 39. User Socket Events

User-specific real-time behavior is implemented in:

``` text
src/socket/userEvents.js
```

The current implementation tracks connected/live users using in-process
state.

This is useful for local/single-process runtime behavior but has
architectural consequences for multi-instance deployments.

------------------------------------------------------------------------

# 40. Socket Manager

The backend contains:

``` text
src/socket/socketManager.js
```

This provides access to the initialized Socket.IO instance.

The lifecycle is:

``` text
server startup
     │
     ▼
create io
     │
     ▼
socketManager.init(io)
     │
     ▼
services needing real-time output
     │
     ▼
socketManager.getIO()
```

The manager guards against access before initialization.

------------------------------------------------------------------------

# 41. Redis Adapter

The backend supports optional Redis integration for Socket.IO.

When:

``` text
REDIS_URL
```

is configured, the server can initialize Redis publisher/subscriber
clients and attach the Socket.IO Redis adapter.

The architecture becomes:

``` text
Instance A
    │
    ▼
 Redis
    ▲
    │
Instance B
```

This is the backend's current path toward cross-process Socket.IO event
coordination.

------------------------------------------------------------------------

# 42. Redis Is Optional

The application does not require Redis for basic startup.

The architecture therefore supports:

``` text
Without Redis
    │
    ▼
Single-process Socket.IO
```

and:

``` text
With Redis
    │
    ▼
Cross-instance Socket.IO coordination
```

This should not be interpreted as proof that the complete application
has been load-tested under multi-instance production traffic.

------------------------------------------------------------------------

# 43. Live Presence Limitation

The current live-user implementation uses an in-memory `Map`.

Therefore:

``` text
Process A
  └── liveUsers A

Process B
  └── liveUsers B
```

would have separate presence state.

The source itself identifies shared persistence such as Redis as a
consideration for production. fileciteturn4file9L1181-L1189

This is separate from the Socket.IO Redis adapter.

------------------------------------------------------------------------

# 44. Configuration Architecture

The backend centralizes environment configuration in:

``` text
src/config/env.js
```

Recognized configuration includes:

``` text
NODE_ENV
PORT
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
FRONTEND_URL
BACKEND_URL
REDIS_URL
EMAIL_USER
EMAIL_PASS
EMAIL
```

The exact required/optional behavior depends on environment.

------------------------------------------------------------------------

# 45. Production Configuration Validation

When:

``` text
NODE_ENV=production
```

the backend validates production requirements.

The source requires a production JWT secret and rejects the known
development fallback secret.

This is an explicit production safety check.

------------------------------------------------------------------------

# 46. Server Startup Lifecycle

The backend runtime can be summarized as:

``` text
Process starts
    │
    ▼
Load environment
    │
    ▼
Validate configuration
    │
    ▼
Initialize database
    │
    ▼
Create Express app
    │
    ▼
Create HTTP server
    │
    ▼
Create Socket.IO
    │
    ▼
Optional Redis adapter
    │
    ▼
Initialize socket manager
    │
    ▼
Register socket handlers
    │
    ▼
Listen on PORT
```

Database initialization is a hard dependency; Redis is optional.

------------------------------------------------------------------------

# 47. Graceful Shutdown

The backend includes process shutdown handling.

The server responds to:

``` text
SIGINT
```

by closing:

``` text
HTTP server
```

before exiting.

This is a useful foundation for controlled process termination.

The supplied source does not establish a complete shutdown sequence for
every external resource, so this document does not claim full
coordinated shutdown of database, Redis, or email resources.

------------------------------------------------------------------------

# 48. Backend Error Boundary

The backend has two important error boundaries.

## Domain errors

Produced by:

``` text
Services
Models
Controllers
```

and propagated upward.

## HTTP error formatting

Handled by:

``` text
middleware/errorHandler.js
```

The architectural pattern is:

``` text
Domain failure
     │
     ▼
next(error)
     │
     ▼
Central error handler
     │
     ▼
HTTP response
```

------------------------------------------------------------------------

# 49. Backend Authorization Boundary

Authentication establishes:

``` text
req.user
```

Authorization must then determine whether the authenticated user can
access the requested resource.

For collaborative budgets, this involves:

``` text
User
  │
  ▼
Budget membership
  │
  ▼
Role
```

The exact permission matrix is implementation-dependent and should be
derived from the current budget service/controller/model logic.

------------------------------------------------------------------------

# 50. Ownership-Aware Data Access

The backend sometimes enforces ownership at the model operation
boundary.

Notifications are a clear example.

The controller supplies:

``` text
notificationId
userId
```

to the model operation for marking a notification read.

This creates:

``` text
Authenticated identity
       │
       ▼
Ownership-aware query
       │
       ▼
Database
```

This pattern is important because simply authenticating a user is not
enough; resource access must also be scoped appropriately.

------------------------------------------------------------------------

# 51. Backend Testing Architecture

Tests are located under:

``` text
src/tests/
```

Current test files include:

``` text
auth.test.js
budget.test.js
transaction.test.js
```

The package script executes:

``` bash
jest --runInBand --testTimeout=30000
```

This means tests run serially with a 30-second timeout.

------------------------------------------------------------------------

# 52. Authentication Test Coverage

The supplied authentication tests cover scenarios including:

``` text
Successful registration
Duplicate-email rejection
Successful login
Incorrect-password rejection
```

This provides baseline coverage around the authentication service/API
behavior.

It should not be interpreted as complete authentication security
coverage.

------------------------------------------------------------------------

# 53. Budget Test Coverage

The supplied budget tests include authenticated budget creation
behavior.

This is important because it exercises the relationship between:

``` text
Authentication
   │
   ▼
Budget endpoint
   │
   ▼
Budget operation
```

------------------------------------------------------------------------

# 54. Transaction Test Coverage

The repository contains:

``` text
transaction.test.js
```

for transaction-domain behavior.

The full test inventory should be consulted before claiming exact
coverage beyond the supplied test contents.

------------------------------------------------------------------------

# 55. Backend Dependency Direction

The preferred backend dependency direction is:

``` text
Route
  ↓
Controller
  ↓
Service
  ↓
Model
  ↓
Database
```

Cross-cutting dependencies:

``` text
Config
Middleware
Utils
Socket infrastructure
```

should not become a substitute for the domain layers.

------------------------------------------------------------------------

# 56. What Belongs in Each Layer

## Route

``` text
Endpoint definition
Middleware composition
Controller binding
```

## Controller

``` text
HTTP input/output
Request context
Status codes
Response shaping
Error propagation
```

## Service

``` text
Business workflow
Domain rules
Cross-model operations
External integrations
```

## Model

``` text
Persistence
Queries
Database mutations
```

## Schema

``` text
Tables
Columns
Relations
Enums
Constraints
```

## Middleware

``` text
Cross-cutting request concerns
```

## Socket

``` text
Connection
Authentication
Rooms
Events
Presence
```

------------------------------------------------------------------------

# 57. Backend Change Workflow

When implementing a backend feature:

### Step 1

Identify the domain.

``` text
Budget
Transaction
User
Notification
...
```

### Step 2

Find the route.

``` text
routes/<domain>.js
```

### Step 3

Find the controller.

``` text
controllers/<domain>Controller.js
```

### Step 4

Find the service.

``` text
services/<domain>Service.js
```

### Step 5

Find the model.

``` text
models/<domain>.js
```

### Step 6

Check the schema.

``` text
db/schema.js
```

### Step 7

Check real-time behavior if applicable.

``` text
socket/
```

### Step 8

Update tests.

``` text
tests/
```

This is the safest path for maintaining the existing architecture.

------------------------------------------------------------------------

# 58. Backend Debugging Workflow

When an endpoint fails:

``` text
1. Is the server running?
        │
        ▼
2. Is the route mounted?
        │
        ▼
3. Is middleware rejecting the request?
        │
        ▼
4. Is controller receiving expected input?
        │
        ▼
5. Is service logic succeeding?
        │
        ▼
6. Is model/database operation succeeding?
        │
        ▼
7. Is errorHandler formatting the failure?
```

If the API succeeds but real-time behavior fails:

``` text
Check:
Socket connection
      ↓
JWT authentication
      ↓
Socket handler
      ↓
Room membership
      ↓
Event registration
      ↓
Event emission
      ↓
Frontend listener
```

------------------------------------------------------------------------

# 59. Backend Production-Oriented Strengths

The current backend has several production-oriented foundations:

-   Centralized environment configuration
-   Production JWT validation
-   PostgreSQL persistence
-   Drizzle ORM
-   Centralized error handling
-   Authentication middleware
-   Input validation boundary
-   Graceful SIGINT handling
-   Optional Redis Socket.IO adapter
-   Automated backend tests
-   Production seed protection

These are foundations rather than evidence of complete production
readiness.

------------------------------------------------------------------------

# 60. Backend Architecture Gaps / Verification Items

The supplied source does not establish:

-   Formal health/readiness endpoints
-   Full distributed tracing
-   Metrics instrumentation
-   Structured centralized log aggregation
-   Formal rate limiting
-   Complete API schema/OpenAPI generation
-   Full multi-instance presence architecture
-   Comprehensive integration/end-to-end test suite
-   Formal database migration policy beyond the provided Drizzle
    commands
-   Load/performance testing results
-   Disaster recovery implementation

These should be treated as operational areas for subsequent
documentation or engineering work rather than silently assumed to exist.

------------------------------------------------------------------------

# 61. Backend Architecture Summary

The WalletFlow backend can be summarized as:

``` text
                       Node.js Process
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
                 Express             Socket.IO
                    │                   │
              ┌─────┴─────┐             │
              ▼           ▼             ▼
           Routes      Middleware    Socket Handler
              │           │             │
              ▼           ▼             ├── Budget Events
         Controllers    Auth/Validation  └── User Events
              │
              ▼
           Services
              │
              ├───────────────┐
              ▼               ▼
           Models          Integrations
              │
              ▼
           Drizzle
              │
              ▼
       PostgreSQL / Neon

       Optional Socket.IO
              │
              ▼
            Redis
```

The central architectural rule is:

> **Routes expose HTTP contracts, controllers translate HTTP into domain
> operations, services implement business workflows, models own
> persistence, and the socket layer owns real-time communication.**

------------------------------------------------------------------------

# 62. Next Part

**Part 8 --- Authentication & Authorization**

The next document will be security-focused and trace the complete
identity lifecycle:

-   Registration
-   Login
-   Password hashing
-   JWT creation
-   JWT verification
-   Frontend token persistence
-   Axios authentication
-   Session expiration
-   Protected REST requests
-   Socket.IO authentication
-   User identity propagation
-   Budget membership
-   Owner/editor/viewer roles
-   Resource ownership
-   Invitation acceptance
-   Authorization boundaries
-   Security-sensitive failure cases
-   Production authentication configuration
