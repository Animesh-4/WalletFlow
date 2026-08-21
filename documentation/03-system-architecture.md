# WalletFlow --- System Architecture

## Part 3 --- System Architecture

**Status:** Architecture documentation derived from the supplied
frontend and backend repository snapshots.

This document explains how WalletFlow is structured at runtime and how
its major layers communicate.

The organization follows a production-documentation principle used by
mature projects such as Kubernetes: explain the architecture in terms of
components, responsibilities, interfaces, communication paths, and
operational boundaries rather than treating the repository as a flat
collection of files. Kubernetes similarly separates architecture
concepts from setup and reference material.
citeturn0search2turn0search0

This document describes **what the supplied implementation actually
contains**. Where the repository does not establish a behavior, it is
explicitly identified as an architectural gap or verification item.

------------------------------------------------------------------------

# 1. Architecture at a Glance

WalletFlow is a two-application system:

``` text
                    ┌──────────────────────────┐
                    │        User Browser      │
                    │                          │
                    │     React / WalletFlow    │
                    └────────────┬─────────────┘
                                 │
                 ┌───────────────┴────────────────┐
                 │                                │
              REST API                         Socket.IO
                 │                                │
                 ▼                                ▼
        ┌──────────────────────────────────────────────┐
        │             Node.js Backend                  │
        │                                              │
        │  Express                                      │
        │    │                                          │
        │    ├── Routes                                  │
        │    ├── Middleware                              │
        │    ├── Controllers                            │
        │    ├── Services                               │
        │    └── Models                                 │
        │                                               │
        │  Socket.IO                                    │
        └──────────────┬───────────────────────────────┘
                       │
              ┌────────┴─────────┐
              │                  │
              ▼                  ▼
       PostgreSQL / Neon      Optional Redis
```

The central architectural idea is:

> **REST is the primary request/response interface; Socket.IO is the
> real-time event interface; PostgreSQL is the durable source of
> application data.**

------------------------------------------------------------------------

# 2. Major Components

  -----------------------------------------------------------------------
  Component               Responsibility          Communication
  ----------------------- ----------------------- -----------------------
  React frontend          User interface and      REST + Socket.IO
                          client-side application 
                          state                   

  React Router            Client-side navigation  In-process

  Auth Context            Authentication state    Axios
                          and token lifecycle     

  Budget Context          Budget-related client   Axios + Socket events
                          state and operations    

  Socket Context          Real-time connection    Socket.IO
                          and event subscriptions 

  Axios API layer         REST communication      HTTP

  Express                 HTTP server/application HTTP
                          framework               

  Middleware              Authentication, CORS,   In-process
                          validation, errors      

  Controllers             HTTP request            Services/models
                          orchestration           

  Services                Domain/business         Models + Socket
                          operations              Manager + email

  Models                  Database access         Drizzle

  Drizzle                 Relational data access  PostgreSQL

  Socket.IO server        Real-time authenticated WebSocket/Socket.IO
                          connections             

  Redis adapter           Optional cross-instance Redis
                          Socket.IO coordination  

  Email service           Password                Email provider/SMTP
                          reset/invitation email  configuration
                          behavior                
  -----------------------------------------------------------------------

The backend repository explicitly separates configuration, controllers,
database/schema, middleware, models, routes, services, socket handlers,
utilities, and tests. fileciteturn4file5L567-L637

------------------------------------------------------------------------

# 3. Frontend Architecture

## 3.1 Frontend Layering

The frontend can be understood as five logical layers:

``` text
┌────────────────────────────────────┐
│ Pages                              │
│ Dashboard / Budgets / Reports ...  │
└──────────────────┬─────────────────┘
                   │
┌──────────────────▼─────────────────┐
│ Components                         │
│ Budget / Transaction / Reports ...  │
└──────────────────┬─────────────────┘
                   │
┌──────────────────▼─────────────────┐
│ Contexts + Hooks                   │
│ Auth / Budget / Socket             │
└──────────────────┬─────────────────┘
                   │
┌──────────────────▼─────────────────┐
│ Service Modules                    │
│ authAPI / budgetAPI / transaction  │
│ reportAPI / userAPI / socket ...   │
└──────────────────┬─────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
      Axios               Socket.IO
```

The supplied frontend contains dedicated component, context, hook, page,
service, style, and utility directories. fileciteturn4file7L868-L957

------------------------------------------------------------------------

# 4. Frontend Entry Point

The frontend application begins at:

``` text
src/index.js
```

The application is rendered under React's strict mode.

The application provider hierarchy establishes shared application state
before the route-driven UI is rendered.

The major contexts are:

``` text
AuthContext
BudgetContext
SocketContext
```

This is significant because these contexts are not isolated UI concerns;
they represent application-level state boundaries.

------------------------------------------------------------------------

# 5. Authentication Context

The authentication context owns client-side authentication state.

Its responsibilities include:

-   Maintaining the current authenticated user
-   Maintaining authentication/loading state
-   Registering users
-   Logging users in
-   Logging users out
-   Loading the current profile
-   Handling token persistence
-   Initiating password recovery

The frontend uses browser `localStorage` for token persistence.

The Axios client then reads the token and attaches it to authenticated
requests.

The resulting relationship is:

``` text
AuthContext
     │
     ├── localStorage
     │
     └── Axios
            │
            ▼
        REST API
```

------------------------------------------------------------------------

# 6. Authentication Startup Lifecycle

When the application initializes, the frontend checks whether a stored
token exists.

The conceptual lifecycle is:

``` mermaid
sequenceDiagram
    participant Browser
    participant Auth as AuthContext
    participant Storage as localStorage
    participant API as Backend API

    Browser->>Auth: Initialize application
    Auth->>Storage: Read token

    alt Token exists
        Auth->>API: Request current profile
        alt Token valid
            API-->>Auth: User profile
            Auth-->>Browser: Authenticated state
        else Token invalid
            API-->>Auth: 401
            Auth->>Storage: Remove token
            Auth-->>Browser: Unauthenticated state
        end
    else No token
        Auth-->>Browser: Unauthenticated state
    end
```

The 401 handling is important architecturally: authentication state can
be invalidated by the API layer, not only by an explicit logout action.

------------------------------------------------------------------------

# 7. Budget Context

The budget context is the frontend's main budget-domain state boundary.

It provides budget-related data and operations to components/pages
without requiring each component to independently implement REST
communication.

The conceptual flow is:

``` text
Budget UI
    │
    ▼
BudgetContext / useBudgets
    │
    ▼
budgetAPI
    │
    ▼
Axios
    │
    ▼
/api/budgets
```

Budget-related UI components include:

``` text
BudgetForm
BudgetList
BudgetCard
BudgetDetailModal
AdjustBudgetForm
CategoryPicker
```

This keeps budget UI concerns separate from the HTTP implementation.

------------------------------------------------------------------------

# 8. Socket Context

The Socket Context encapsulates the frontend real-time connection.

The frontend service/context layer exposes operations corresponding to:

``` text
Connect
Disconnect
Join budget room
Leave budget room
Receive budget updates
Receive transaction updates
Receive live-user updates
```

The frontend only establishes the authenticated Socket.IO connection
when a token is available.

This creates a direct dependency:

``` text
Authenticated User
       │
       ▼
JWT token
       │
       ▼
Socket.IO connection
```

------------------------------------------------------------------------

# 9. Frontend API Service Boundary

The frontend contains separate API service modules:

``` text
authAPI.js
budgetAPI.js
categoryAPI.js
collaborationAPI.js
notificationAPI.js
reportAPI.js
transactionAPI.js
userAPI.js
```

The architecture is therefore deliberately organized by domain rather
than placing every API call in a single module.

Conceptually:

``` text
                api.js
                  │
        ┌─────────┼─────────┐
        │         │         │
     authAPI   budgetAPI  transactionAPI
        │         │         │
        └─────────┼─────────┘
                  │
                Axios
```

This is a useful maintenance boundary: UI components should generally
depend on the appropriate domain service/context rather than
constructing raw HTTP requests themselves.

------------------------------------------------------------------------

# 10. Backend Architecture

The backend has a more explicit layered structure:

``` text
HTTP Request
     │
     ▼
Express
     │
     ▼
Route
     │
     ▼
Middleware
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
```

The repository separates:

``` text
config/
controllers/
db/
middleware/
models/
routes/
services/
socket/
tests/
utils/
```

This structure is explicitly represented in the backend repository.
fileciteturn4file5L567-L637

------------------------------------------------------------------------

# 11. Express Application Boundary

The Express application is the central HTTP composition point.

It is responsible for wiring together:

-   JSON parsing
-   CORS
-   Routes
-   Error handling
-   HTTP server integration

The API is divided into domain route groups:

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

This means the URL structure broadly mirrors the domain model.

------------------------------------------------------------------------

# 12. Middleware Architecture

The backend contains dedicated middleware for:

``` text
auth.js
cors.js
errorHandler.js
validation.js
```

These have distinct responsibilities.

### Authentication middleware

Establishes the authenticated user from the JWT.

### CORS middleware

Controls browser-origin access based on configured frontend origin.

### Validation middleware

Provides request validation mechanisms.

### Error handler

Provides centralized error handling after route/controller execution.

The architectural order is therefore conceptually:

``` text
Request
  │
  ▼
CORS / JSON
  │
  ▼
Route
  │
  ▼
Validation
  │
  ▼
Authentication
  │
  ▼
Controller
  │
  ▼
Service
```

Not every route necessarily uses every middleware stage.

------------------------------------------------------------------------

# 13. Controller Responsibility

Controllers form the boundary between HTTP semantics and domain
operations.

A controller should generally:

1.  Read request parameters/body/query data.
2.  Obtain the authenticated user where applicable.
3.  Call the relevant domain operation.
4.  Convert the result into an HTTP response.
5.  Pass failures to centralized error handling.

For example, the notification controller:

-   Gets the authenticated user's notifications.
-   Marks individual notifications as read while constraining the
    operation by the authenticated user.
-   Marks all notifications as read for the authenticated user.

The supplied implementation demonstrates that user ownership is
sometimes enforced directly at the model operation boundary as well.
fileciteturn4file6L770-L803

------------------------------------------------------------------------

# 14. Service Layer

The backend contains services for:

``` text
authService
budgetService
emailService
invitationService
notificationService
reportService
transactionService
userService
```

The service layer is where the domain-specific workflow is concentrated.

This is particularly important for operations that involve more than one
persistence action or more than one subsystem.

For example, invitation behavior can involve:

``` text
Invitation
   │
   ├── Token
   ├── Expiration
   ├── Role
   ├── Budget
   ├── Inviter
   ├── Invitee
   ├── Membership
   └── Notification/email behavior
```

The service boundary is therefore more than a simple database wrapper.

------------------------------------------------------------------------

# 15. Model Layer

The backend contains models for:

``` text
User
Budget
BudgetHistory
BudgetUser
Category
Invitation
Notification
Transaction
```

These models use Drizzle to interact with PostgreSQL.

The model layer is responsible for database-oriented operations such as:

``` text
find
create
update
delete
lookup
relationship queries
status changes
```

The supplied notification model, for example, constrains notification
updates by both notification ID and user ID.
fileciteturn4file4L514-L552

------------------------------------------------------------------------

# 16. Database Access Architecture

The database path is:

``` text
Service
   │
   ▼
Model
   │
   ▼
Drizzle ORM
   │
   ▼
Neon PostgreSQL Pool
   │
   ▼
PostgreSQL
```

The database configuration creates a Neon `Pool` using `DATABASE_URL`
and wraps it with Drizzle.

The database initialization is intentionally fail-fast: if
initialization fails, the backend logs the failure and exits.
fileciteturn4file1L110-L145

------------------------------------------------------------------------

# 17. Database as Durable State

The major persistent entities are:

``` text
User
Budget
Transaction
Category
Budget Membership
Invitation
Budget History
Notification
```

This creates the following domain graph:

``` mermaid
flowchart TD
    User["User"]

    User --> Budget["Owned Budgets"]
    User --> Transaction["Transactions"]
    User --> Membership["Budget Memberships"]
    User --> Invitation["Invitations"]
    User --> Notification["Notifications"]

    Budget --> Transaction
    Budget --> Membership
    Budget --> Invitation
    Budget --> History["Budget History"]

    Category["Category"] --> Transaction
```

The database therefore acts as the durable source for the core financial
and collaboration state.

------------------------------------------------------------------------

# 18. REST Request Lifecycle

A typical authenticated REST request follows this path:

``` mermaid
sequenceDiagram
    participant UI as React UI
    participant Service as Frontend API Service
    participant Axios
    participant Express
    participant Auth as Auth Middleware
    participant Controller
    participant Domain as Service Layer
    participant Model
    participant DB as PostgreSQL

    UI->>Service: Domain operation
    Service->>Axios: HTTP request
    Axios->>Axios: Attach JWT
    Axios->>Express: HTTP request

    Express->>Auth: Authenticate request
    Auth->>Auth: Verify JWT
    Auth->>Controller: Authenticated request

    Controller->>Domain: Execute operation
    Domain->>Model: Read/write data
    Model->>DB: SQL through Drizzle
    DB-->>Model: Result
    Model-->>Domain: Domain data
    Domain-->>Controller: Result
    Controller-->>Axios: HTTP response
    Axios-->>Service: Parsed response
    Service-->>UI: Domain result
```

This flow should be treated as the standard architectural model.
Individual endpoints can have additional behavior.

------------------------------------------------------------------------

# 19. Error Flow

The backend includes a centralized error handler.

The intended architectural path is:

``` text
Controller
   │
   ├── success ──► HTTP response
   │
   └── error
        │
        ▼
    next(error)
        │
        ▼
 Central error handler
        │
        ▼
    HTTP error
```

This is preferable to each controller independently constructing
unrelated error responses.

The supplied controllers demonstrate use of `next(error)` when domain
operations fail. fileciteturn4file6L783-L803

------------------------------------------------------------------------

# 20. Authentication Request Architecture

REST authentication uses JWT.

``` mermaid
sequenceDiagram
    participant Client as Browser
    participant AuthAPI as Auth Route
    participant Service as Auth Service
    participant DB as PostgreSQL

    Client->>AuthAPI: Login(email, password)
    AuthAPI->>Service: Authenticate credentials
    Service->>DB: Find user
    DB-->>Service: User + password hash
    Service->>Service: bcrypt password comparison
    Service->>Service: Sign JWT
    Service-->>AuthAPI: Token + user
    AuthAPI-->>Client: Authentication response
```

After login:

``` text
JWT
 │
 ├── Axios Authorization header
 │
 └── Socket.IO authentication
```

The system therefore uses one identity mechanism across both transport
layers.

------------------------------------------------------------------------

# 21. Socket.IO Architecture

The backend attaches Socket.IO to the HTTP server.

The Socket.IO lifecycle is:

``` text
Socket connection attempt
        │
        ▼
Extract JWT
        │
        ▼
Verify JWT
        │
        ├── invalid ──► reject connection
        │
        └── valid
              │
              ▼
        socket.user = decoded JWT
              │
              ▼
        Join private user room
              │
              ▼
        Register budget/user events
```

The source explicitly verifies the token during the Socket.IO handshake
and rejects missing or invalid tokens. fileciteturn4file9L1093-L1147

------------------------------------------------------------------------

# 22. Socket User Rooms

After successful authentication, the backend places the connection into:

``` text
user_<userId>
```

This provides a private addressing mechanism for user-specific events.

Conceptually:

``` text
User 42
  │
  ▼
user_42
  │
  ├── Notification-related events
  ├── Personal updates
  └── Other user-scoped real-time events
```

The exact event inventory should be treated according to the socket
event modules rather than inferred solely from the room name.

------------------------------------------------------------------------

# 23. Budget Rooms

Budget collaboration uses Socket.IO rooms.

The budget event handler supports:

``` text
joinBudget
leaveBudget
```

A connected client can therefore associate its socket with a
budget-specific room.

Conceptually:

``` text
Budget 17
   │
   ▼
Socket.IO room "17"
   │
   ├── User A
   ├── User B
   └── User C
```

The current event implementation demonstrates joining/leaving the budget
room and contains the mechanism intended for broadcasting budget
updates. fileciteturn4file9L1074-L1090

------------------------------------------------------------------------

# 24. Real-Time Update Model

The frontend is designed to react to real-time domain events such as:

``` text
budgetUpdated
transactionUpdated
liveUsersUpdated
```

The intended conceptual flow is:

``` mermaid
sequenceDiagram
    participant A as User A
    participant API as Backend
    participant DB as PostgreSQL
    participant Socket as Socket.IO
    participant B as User B

    A->>API: Update budget
    API->>DB: Persist change
    DB-->>API: Updated budget
    API->>Socket: Broadcast budget update
    Socket-->>B: budgetUpdated
    B->>B: Update local UI state
```

The repository contains the Socket.IO manager and event modules required
for this architecture.

However, the supplied event files contain comments/examples for some
broadcast paths. Therefore, this document does **not** claim that every
desired real-time event is emitted from every corresponding REST
mutation unless that behavior is verified in the relevant
service/controller implementation.

------------------------------------------------------------------------

# 25. Socket Manager

The backend provides:

``` text
src/socket/socketManager.js
```

Its purpose is to make the initialized Socket.IO instance accessible
from other backend modules.

The lifecycle is:

``` text
server startup
     │
     ▼
create Socket.IO instance
     │
     ▼
socketManager.init(io)
     │
     ▼
other modules
     │
     ▼
socketManager.getIO()
```

The manager explicitly throws if `getIO()` is called before
initialization. fileciteturn4file9L1153-L1178

------------------------------------------------------------------------

# 26. Optional Redis Architecture

Redis is not required for the basic Socket.IO architecture.

When:

``` env
REDIS_URL=<redis-url>
```

is configured, the backend creates Redis publisher/subscriber clients
and configures the Socket.IO Redis adapter.

The architecture becomes:

``` text
             ┌───────────────┐
             │ Socket.IO A   │
             └───────┬───────┘
                     │
                     ▼
                  Redis
                     ▲
                     │
             ┌───────┴───────┐
             │ Socket.IO B   │
             └───────────────┘
```

This is important for a future multi-instance backend deployment because
Socket.IO events otherwise remain local to an individual process.

The repository therefore contains a scaling path, but the existence of
the adapter does not by itself establish that the complete application
has been load-tested or validated under multi-instance production
traffic.

------------------------------------------------------------------------

# 27. Live User Presence

The backend's current live-user implementation uses an in-memory `Map`.

The source itself comments that a more persistent/shared store such as
Redis should be considered for production.
fileciteturn4file9L1181-L1189

Therefore:

``` text
Single backend instance
        │
        ▼
In-memory liveUsers Map
```

works naturally within one process.

For multiple backend instances:

``` text
Instance A → liveUsers Map A
Instance B → liveUsers Map B
```

would not automatically represent one shared presence state.

This is an important architectural distinction between:

-   **Socket.IO message scaling**, which has an optional Redis adapter
-   **Application presence state**, which currently uses process-local
    memory

------------------------------------------------------------------------

# 28. Email Architecture

The backend contains:

``` text
emailService.js
```

Email functionality is used by workflows such as:

-   Password recovery
-   Invitation communication

The environment layer recognizes:

``` env
EMAIL_USER
EMAIL_PASS
EMAIL
```

Email configuration is optional in development according to the source
configuration.

Therefore the application distinguishes between:

``` text
Core application runtime
        │
        └── Email integration
```

rather than treating an external mail provider as the database/API
foundation.

------------------------------------------------------------------------

# 29. Domain Boundaries

WalletFlow's backend domain boundaries can be represented as:

``` text
                    ┌───────────────┐
                    │     User      │
                    └───────┬───────┘
                            │
              ┌─────────────┼──────────────┐
              │             │              │
              ▼             ▼              ▼
          Budgets       Transactions   Notifications
              │
       ┌──────┼───────────┐
       │      │           │
       ▼      ▼           ▼
   Members Invitations History
       │
       ▼
 Collaboration
```

Reports sit across the financial domain:

``` text
Transactions
     │
     ▼
Reporting Service
     │
     ├── Spending summary
     └── Monthly report
```

Categories provide classification for transaction data.

------------------------------------------------------------------------

# 30. Authorization Boundary

The architecture has two distinct authorization dimensions.

## User-level ownership

Resources such as:

-   User profile
-   Notifications
-   User-created budgets
-   User transactions

are associated with users.

## Budget-level collaboration

Budgets additionally have membership:

``` text
budget_users
```

with roles:

``` text
owner
editor
viewer
```

This creates a hierarchical authorization model:

``` text
Authenticated User
       │
       ▼
Resource ownership
       │
       └── or ──► Budget membership
                       │
                       ▼
                     Role
```

The exact permission matrix should be documented separately after the
full budget service/controller path is mapped.

------------------------------------------------------------------------

# 31. Data Ownership

The database schema creates explicit foreign-key relationships.

Examples include:

``` text
transactions.user_id → users.id
transactions.budget_id → budgets.id
transactions.category_id → categories.id

budget_users.user_id → users.id
budget_users.budget_id → budgets.id

invitations.budget_id → budgets.id
invitations.inviter_id → users.id

notifications.user_id → users.id
```

These relationships are part of the persistence-level ownership model.

------------------------------------------------------------------------

# 32. Deletion Semantics

The database schema uses cascading deletes for several relationships.

For example, notifications reference users with:

``` text
onDelete: cascade
```

The same pattern appears in several domain relationships.

This means deleting a parent record can remove associated dependent data
at the database level.

This behavior is operationally important and should be considered before
implementing destructive user/budget operations.

A full cascade matrix belongs in the database documentation part.

------------------------------------------------------------------------

# 33. Runtime Dependency Graph

A simplified backend dependency graph is:

``` text
server.js
   │
   ├── config/env
   ├── app
   ├── database
   └── Socket.IO
          │
          ├── socketHandler
          │     ├── budgetEvents
          │     └── userEvents
          │
          └── socketManager

app
 │
 ├── middleware
 │
 └── routes
       │
       ├── controllers
       │      │
       │      └── services
       │             │
       │             ├── models
       │             │      │
       │             │      └── Drizzle
       │             │
       │             ├── emailService
       │             └── socketManager
       │
       └── centralized error handling
```

This illustrates why the backend is more than an MVC-only application:
domain services, real-time infrastructure, and external email
infrastructure exist alongside the conventional HTTP/database layers.

------------------------------------------------------------------------

# 34. Request/Response vs Event-Driven Communication

WalletFlow uses two communication models.

## Request/response

Used for:

-   Authentication
-   CRUD operations
-   Reports
-   Notifications
-   Categories
-   User profile operations

Pattern:

``` text
Client → HTTP request → Server → HTTP response → Client
```

## Event-driven

Used for:

-   Live collaboration
-   Budget room events
-   Transaction/budget update notifications
-   User presence

Pattern:

``` text
Client ⇄ Socket.IO ⇄ Server
```

This separation is architecturally useful:

> REST represents durable operations and queries; Socket.IO represents
> changes that clients may need to observe immediately.

------------------------------------------------------------------------

# 35. Architectural Invariants

The following principles are supported by the current structure.

### Invariant 1 --- Database access is backend-owned

The frontend does not directly communicate with PostgreSQL.

``` text
Frontend → Backend → Database
```

### Invariant 2 --- Authentication is backend-enforced

The frontend may maintain authentication state, but the backend
validates the JWT for protected operations.

### Invariant 3 --- Socket connections are authenticated

Socket.IO connections are not anonymous by default; the server verifies
the JWT during connection setup. fileciteturn4file9L1101-L1124

### Invariant 4 --- Domain persistence is model-backed

Backend services interact with persistence through the model/Drizzle
layer.

### Invariant 5 --- Configuration is environment-driven

Critical deployment-specific values are read from environment variables
and validated centrally.

------------------------------------------------------------------------

# 36. Failure Boundaries

The architecture has several important failure boundaries.

``` text
Browser
  │
  ├── API unavailable
  │
  └── Socket unavailable
          │
          ▼
Backend
  │
  ├── Authentication failure
  ├── Validation failure
  ├── Business-rule failure
  ├── Database failure
  ├── Email failure
  └── Redis failure
          │
          ▼
External systems
```

The database is a hard startup dependency.

Redis is an optional infrastructure dependency.

Email is an optional integration in development.

This distinction matters operationally.

------------------------------------------------------------------------

# 37. Startup Dependency Classification

  Dependency                       Required for backend startup? Role
  ------------------------------ ------------------------------- --------------------
  Node.js                                                    Yes Runtime
  `DATABASE_URL`                                             Yes Database
  PostgreSQL/Neon availability                               Yes Persistence
  JWT configuration                           Yes for production Authentication
  `FRONTEND_URL`                              Yes for production CORS
  Redis                                                       No Socket.IO scaling
  Email credentials                            No in development Email integration
  Frontend                                                    No Client application

This table reflects the configuration logic visible in the backend
source.

------------------------------------------------------------------------

# 38. Architecture Strengths

The current architecture provides several useful boundaries:

### Domain-oriented API organization

Routes and services are divided by functional domain.

### Clear persistence boundary

Drizzle/PostgreSQL access is concentrated in backend models.

### Shared authentication mechanism

JWT is used for both HTTP authentication and Socket.IO authentication.

### Real-time capability

The application is not limited to polling-based collaboration.

### Scaling path

Redis adapter support provides a path toward multi-instance Socket.IO
messaging.

### Centralized configuration

Environment validation is centralized rather than distributed throughout
the application.

### Centralized error handling

Controllers can delegate errors to common middleware.

------------------------------------------------------------------------

# 39. Architecture Risks / Verification Items

The following are important architectural observations, not claims that
the application is unusable.

## 39.1 In-memory presence

Live users are stored in an in-memory `Map`.

This is naturally process-local.

For multi-instance deployments, shared presence state would require an
additional coordination mechanism.

## 39.2 Real-time broadcast completeness

Some socket event files contain example/commented broadcast logic.

The complete guarantee that every relevant mutation emits every intended
event should be verified across the corresponding services/controllers.

## 39.3 API contract formalization

The repository contains route/controller implementations but the
supplied source does not establish a generated OpenAPI contract.

## 39.4 Observability

The backend has a logger utility, but the supplied source does not
establish a complete metrics/tracing architecture.

## 39.5 Health/readiness

The supplied architecture does not establish formal liveness/readiness
endpoints.

These should be addressed in the operational documentation if the
application is expected to run as a highly available production service.

------------------------------------------------------------------------

# 40. Recommended Architectural Rules for Future Development

The existing structure suggests the following rules should be preserved.

### Frontend

Prefer:

``` text
Component
   ↓
Context/Hook
   ↓
API Service
```

over embedding raw Axios requests throughout presentation components.

### Backend

Prefer:

``` text
Route
   ↓
Controller
   ↓
Service
   ↓
Model
```

for domain operations.

### Database

Keep PostgreSQL access behind the backend.

### Authentication

Do not trust frontend authentication state as an authorization
mechanism.

### Real-time

Authenticate Socket.IO connections using the same identity mechanism as
REST.

### Scaling

If deploying multiple backend instances, treat Socket.IO synchronization
and live-user presence as separate scaling problems.

------------------------------------------------------------------------

# 41. Architecture Navigation

The next documentation parts should expand this architecture into
focused references:

``` text
03-system-architecture.md
        │
        ├── 04-repository-structure.md
        │
        ├── 05-core-concepts.md
        │
        ├── 06-frontend-architecture.md
        │
        ├── 07-backend-architecture.md
        │
        ├── 08-authentication-and-authorization.md
        │
        ├── 09-budget-and-collaboration.md
        │
        ├── 10-transactions-and-financial-domain.md
        │
        ├── 11-real-time-architecture.md
        │
        └── 12-database-and-data-model.md
```

This prevents the architecture document from becoming an implementation
dump while still giving engineers a reliable mental model of the entire
system.

------------------------------------------------------------------------

# 42. Architecture Summary

WalletFlow can be summarized as:

``` text
                     WALLET FLOW

                         Browser
                            │
                ┌───────────┴───────────┐
                │                       │
             React                   Socket.IO
                │                       │
        ┌───────┴────────┐              │
        │                │              │
     Contexts         API Services      │
        │                │              │
        └───────┬────────┘              │
                │                       │
              Axios                     │
                │                       │
                ▼                       ▼
          ┌────────────────────────────────┐
          │       Express + Socket.IO      │
          │                                │
          │ Routes → Controllers → Services│
          │                     │          │
          │                     ▼          │
          │                  Models        │
          └─────────────────────┬──────────┘
                                │
                                ▼
                       PostgreSQL / Neon

                       Optional:
                          Redis
```

The architecture is therefore a **client/server financial application
with domain-oriented REST APIs, JWT-based identity, relational
persistence, and authenticated real-time collaboration**.

------------------------------------------------------------------------

# 43. Next Part

**Part 4 --- Repository Structure**

The next document will map the repository itself at engineering depth:

-   Frontend directory-by-directory responsibilities
-   Backend directory-by-directory responsibilities
-   Important files
-   Entry points
-   Dependency direction
-   Where features should be implemented
-   Where developers should avoid placing logic
-   How frontend and backend domains correspond
-   A feature-to-file navigation matrix
-   Recommended code ownership boundaries
