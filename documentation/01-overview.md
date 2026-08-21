# WalletFlow Documentation

## Part 1 --- Project Overview

**Documentation status:** Part 1 of the production documentation set\
**Primary application name:** WalletFlow\
**Repository structure:** Separate React frontend and Node.js/Express
backend\
**Audience:** Developers, maintainers, reviewers, operators, and
contributors

------------------------------------------------------------------------

## 1. Executive Summary

WalletFlow is a collaborative personal-finance and budgeting web
application.

The application combines:

-   User registration and authentication
-   Password recovery and password reset
-   Personal budget management
-   Income and expense transaction tracking
-   Budget categorization
-   Collaborative budget sharing
-   Role-based budget collaboration
-   Invitation workflows
-   Notifications
-   Financial reports
-   Real-time budget and transaction updates
-   Live-user presence
-   User profile management

The frontend is a React application. The backend is a Node.js
application built around Express. The backend persists data in
PostgreSQL through Drizzle ORM and the Neon serverless PostgreSQL
client. Socket.IO provides real-time communication, with an optional
Redis adapter intended to support horizontal Socket.IO scaling.

The frontend communicates with the backend through REST APIs using Axios
and communicates with the real-time layer using Socket.IO.

The repository is organized as two independently structured
applications:

``` text
WalletFlow
├── frontend/
│   ├── React application
│   ├── React Router
│   ├── Context-based application state
│   ├── Axios REST client
│   └── Socket.IO client
│
└── backend/
    ├── Express HTTP API
    ├── Authentication and authorization
    ├── Business services
    ├── Drizzle ORM
    ├── PostgreSQL / Neon
    ├── Socket.IO server
    ├── Optional Redis adapter
    ├── Email services
    └── Automated API tests
```

------------------------------------------------------------------------

## 2. Product Identity

The frontend identifies the product as **WalletFlow** and describes it
as a collaborative budgeting platform with real-time transaction
tracking, collaborative budget planning, and financial reporting.

The backend package identifies itself as **Budget Planner Backend**.

This creates a documentation-level naming distinction:

  Layer                  Current identity
  ---------------------- --------------------------------------------
  User-facing frontend   WalletFlow
  Backend package        Budget Planner Backend
  Functional domain      Collaborative budgeting / personal finance
  Frontend package       `budget-planner-frontend`
  Backend package        `budget-planner-backend`

For this documentation, **WalletFlow** refers to the complete product
unless a section explicitly refers to the frontend or backend
implementation.

------------------------------------------------------------------------

## 3. Problem Domain

WalletFlow is designed around a budgeting workflow in which users can:

1.  Create an account.
2.  Authenticate with email and password.
3.  Create and manage budgets.
4.  Record income and expenses.
5.  Associate transactions with budgets and categories.
6.  Share budgets with other users.
7.  Assign collaborator roles.
8.  Accept invitations.
9.  Receive notifications.
10. View spending summaries and monthly financial reports.
11. Receive real-time updates while collaborating.

The core domain is therefore not simply transaction tracking. It is a
combination of:

``` text
Identity
   │
   ├── Authentication
   ├── User profile
   └── Password recovery
          │
          ▼
Budget ownership and collaboration
          │
          ├── Budgets
          ├── Collaborators
          ├── Invitations
          └── Budget history
          │
          ▼
Financial activity
          │
          ├── Transactions
          ├── Categories
          └── Reports
          │
          ▼
Communication
          │
          ├── Notifications
          └── Real-time Socket.IO events
```

------------------------------------------------------------------------

## 4. Core Capabilities

### 4.1 Authentication

The system supports:

-   Registration
-   Login
-   JWT-based authentication
-   Authenticated profile retrieval
-   Logout on the frontend
-   Forgot-password requests
-   Password reset using a token
-   Password hashing with bcrypt

The frontend stores the JWT in browser `localStorage` and attaches it to
REST API requests through an Axios request interceptor.

The backend validates authenticated requests through an authentication
middleware.

------------------------------------------------------------------------

### 4.2 Budget Management

Authenticated users can:

-   List budgets
-   Retrieve an individual budget
-   Create budgets
-   Update budgets
-   Delete budgets
-   View budget history
-   Adjust budget amounts
-   Record expenses against a budget
-   Add money to a budget

The budget domain is also the primary collaboration boundary.

------------------------------------------------------------------------

### 4.3 Transactions

Transactions represent financial activity.

The current implementation supports:

-   Income transactions
-   Expense transactions
-   Transaction creation
-   Transaction retrieval
-   Transaction updates
-   Transaction deletion
-   Filtering transactions by budget
-   Category association
-   Transaction status

The database defines `active` and `deleted` transaction states.

------------------------------------------------------------------------

### 4.4 Categories

The application maintains a category list for financial activity.

The backend exposes a categories endpoint, while the frontend retrieves
the available category names through its category API service.

The repository's seed process includes default categories such as:

-   Food
-   Transportation
-   Housing
-   Utilities
-   Entertainment
-   Health
-   Shopping
-   Personal Care
-   Education
-   Gifts & Donations
-   Salary

The complete seed list should be treated as implementation data rather
than a fixed product contract.

------------------------------------------------------------------------

### 4.5 Collaboration

Budgets can be shared with other users.

The collaboration model includes:

-   Budget collaborators
-   Owner role
-   Editor role
-   Viewer role
-   Invitation records
-   Invitation tokens
-   Invitation expiry
-   Invitation status
-   Adding collaborators
-   Removing collaborators
-   Accepting invitations

The database uses a composite key for budget/user membership records.

------------------------------------------------------------------------

### 4.6 Notifications

The application supports persistent user notifications.

Users can:

-   Retrieve notifications
-   Mark one notification as read
-   Mark all notifications as read

Notifications can contain:

-   Message
-   Optional link
-   Read state
-   Creation timestamp

------------------------------------------------------------------------

### 4.7 Financial Reporting

The backend provides reporting functionality for:

-   Spending summaries by category
-   Monthly financial reports

The frontend exposes these capabilities through the Reports area and
uses the returned data to render financial charts and report views.

------------------------------------------------------------------------

### 4.8 Real-Time Collaboration

WalletFlow contains a real-time communication layer using Socket.IO.

The frontend establishes a Socket.IO connection when an authenticated
token is available.

The frontend currently exposes helpers for:

-   Joining a budget room
-   Leaving a budget room
-   Receiving budget updates
-   Receiving transaction updates
-   Receiving live-user updates

The backend can optionally configure a Redis adapter for Socket.IO when
`REDIS_URL` is supplied.

This architecture allows the application to operate without Redis in a
basic deployment while providing a path toward horizontally distributed
Socket.IO operation.

------------------------------------------------------------------------

## 5. High-Level Architecture

``` mermaid
flowchart TD
    Browser["User Browser"]

    subgraph Frontend["WalletFlow Frontend"]
        UI["React UI"]
        Router["React Router"]
        AuthContext["Auth Context"]
        BudgetContext["Budget Context"]
        SocketContext["Socket Context"]
        Axios["Axios API Client"]
        SocketClient["Socket.IO Client"]
    end

    subgraph Backend["WalletFlow Backend"]
        Express["Express Application"]
        Auth["Authentication Middleware"]
        Routes["REST Routes"]
        Controllers["Controllers"]
        Services["Business Services"]
        Models["Data Models"]
        SocketServer["Socket.IO Server"]
    end

    subgraph Data["Persistence & Infrastructure"]
        PostgreSQL["PostgreSQL / Neon"]
        Redis["Optional Redis"]
        Email["Email Service"]
    end

    Browser --> UI
    UI --> Router
    UI --> AuthContext
    UI --> BudgetContext
    UI --> SocketContext

    AuthContext --> Axios
    BudgetContext --> Axios
    Axios --> Express

    Express --> Auth
    Auth --> Routes
    Routes --> Controllers
    Controllers --> Services
    Services --> Models
    Models --> PostgreSQL

    AuthContext --> SocketClient
    SocketClient --> SocketServer
    SocketServer --> Services
    SocketServer -. optional adapter .-> Redis

    Services --> Email
```

### Architectural interpretation

The frontend follows a layered React application model:

``` text
Pages / Components
       │
       ▼
Context + Hooks
       │
       ▼
API Service Modules
       │
       ▼
Axios
       │
       ▼
REST API
```

The backend follows a controller/service/model separation:

``` text
HTTP Request
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
Drizzle ORM
     │
     ▼
PostgreSQL
```

Real-time traffic follows a separate path:

``` text
React Application
      │
      ▼
Socket.IO Client
      │
      ▼
Socket.IO Server
      │
      ├── Budget rooms
      ├── Transaction updates
      └── Live-user events
              │
              ▼
        Optional Redis Adapter
```

------------------------------------------------------------------------

## 6. Technology Stack

### Frontend

The frontend currently uses:

  Technology                           Role
  ------------------------------------ ------------------------------
  React 18                             UI framework
  React Router 6                       Client-side routing
  Axios                                REST API client
  Socket.IO Client                     Real-time communication
  Recharts                             Financial charts
  date-fns                             Date manipulation/formatting
  Tailwind CSS                         Utility-first styling
  React Icons                          UI icons
  React Testing Library                Frontend testing
  Create React App / `react-scripts`   Application build tooling

The frontend package provides development, production-build, and test
scripts.

------------------------------------------------------------------------

### Backend

The backend currently uses:

  Technology                Role
  ------------------------- ---------------------------------------
  Node.js                   Runtime
  Express                   HTTP API framework
  PostgreSQL                Relational database
  Neon serverless client    PostgreSQL connectivity
  Drizzle ORM               Database access and schema definition
  JWT                       Authentication tokens
  bcryptjs                  Password hashing
  Socket.IO                 Real-time communication
  ioredis                   Redis connectivity
  Socket.IO Redis Adapter   Optional Socket.IO horizontal scaling
  Nodemailer                Email delivery
  express-validator         Request validation
  Jest                      Automated testing
  Supertest                 HTTP/API testing
  Nodemon                   Development server reload

------------------------------------------------------------------------

## 7. Major Runtime Components

### 7.1 Frontend Runtime

The React entry point renders the application under `React.StrictMode`.

The application provider hierarchy includes:

``` text
AuthProvider
    │
    ▼
SocketProvider
    │
    ▼
BudgetProvider
    │
    ▼
Router / Application UI
```

Authentication is therefore established at the top-level application
context and is available to the socket and budget layers.

------------------------------------------------------------------------

### 7.2 REST API Runtime

The backend Express application mounts the following API domains:

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

The application applies CORS and JSON parsing globally before mounting
these routes and places centralized error handling after the route
definitions.

------------------------------------------------------------------------

### 7.3 Database Runtime

The backend initializes a Neon PostgreSQL connection and wraps it with
Drizzle ORM.

The database schema currently includes:

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

The schema also defines PostgreSQL enums for:

-   Transaction type
-   Budget role
-   Transaction status
-   Invitation status

------------------------------------------------------------------------

### 7.4 Real-Time Runtime

The backend creates an HTTP server around the Express application and
attaches Socket.IO to that server.

When `REDIS_URL` is configured, the server creates Redis
publisher/subscriber clients and configures the Socket.IO Redis adapter.

This means REST and WebSocket traffic share the same backend process and
listening port.

------------------------------------------------------------------------

## 8. Domain Model Overview

The primary relationships can be represented as:

``` mermaid
erDiagram
    USERS ||--o{ BUDGETS : owns
    USERS ||--o{ TRANSACTIONS : creates
    USERS ||--o{ BUDGET_USERS : participates
    USERS ||--o{ INVITATIONS : sends
    USERS ||--o{ NOTIFICATIONS : receives

    BUDGETS ||--o{ TRANSACTIONS : contains
    BUDGETS ||--o{ BUDGET_USERS : has
    BUDGETS ||--o{ INVITATIONS : receives
    BUDGETS ||--o{ BUDGET_HISTORY : records

    CATEGORIES ||--o{ TRANSACTIONS : categorizes

    USERS {
        integer id PK
        string username
        string email
        string password_hash
        string avatar_url
    }

    BUDGETS {
        integer id PK
        integer user_id FK
        string name
        numeric amount
        string category
        boolean is_recurring
    }

    TRANSACTIONS {
        integer id PK
        integer user_id FK
        integer budget_id FK
        integer category_id FK
        enum type
        numeric amount
        string description
        date date
        enum status
    }

    BUDGET_USERS {
        integer budget_id PK
        integer user_id PK
        enum role
    }

    INVITATIONS {
        integer id PK
        integer budget_id FK
        integer inviter_id FK
        string invitee_email
        enum role
        string token
        enum status
        timestamp expires_at
    }

    BUDGET_HISTORY {
        integer id PK
        integer budget_id FK
        integer user_id FK
        numeric amount
        string description
    }

    NOTIFICATIONS {
        integer id PK
        integer user_id FK
        string message
        string link_url
        boolean is_read
    }

    CATEGORIES {
        integer id PK
        string name
    }
```

This diagram reflects the database schema represented in the backend
source.

------------------------------------------------------------------------

## 9. Authentication Architecture

Authentication is JWT-based.

### Registration

The backend:

1.  Checks whether the email already exists.
2.  Hashes the password with bcrypt.
3.  Creates the user.
4.  Returns a successful registration response.

The registration endpoint returns a user identifier rather than an
authentication token.

### Login

The backend:

1.  Finds the user by email.
2.  Compares the submitted password against the stored bcrypt hash.
3.  Creates a JWT containing the user's ID and email.
4.  Returns the token and user profile information.

### Frontend token handling

The frontend stores the JWT in `localStorage`.

The Axios request interceptor reads that token and sends:

``` http
Authorization: Bearer <token>
```

for authenticated REST requests.

If the API responds with HTTP `401`, the frontend currently removes the
stored token and redirects the browser to `/login`.

### Password recovery

Password recovery uses a generated reset token.

The backend:

1.  Generates a cryptographically random token.
2.  Hashes the token before storing it.
3.  Stores an expiration time.
4.  Sends the unhashed token through the email service.
5.  Uses the supplied token during password reset.

The reset token is configured to expire after one hour in the current
service implementation.

------------------------------------------------------------------------

## 10. Authorization Boundary

Authentication and authorization are separate concerns.

Authentication establishes the identity represented by the JWT.

Authorization is enforced within domain operations, particularly around:

-   User-owned resources
-   Budget access
-   Collaborator management
-   User profile updates
-   Budget-specific transactions

The database also models budget roles:

``` text
owner
editor
viewer
```

The exact permission matrix for each role should be documented in the
collaboration/authorization documentation part of this documentation set
after the service implementations are fully mapped.

------------------------------------------------------------------------

## 11. Production-Oriented Characteristics

The repository contains several implementation choices intended for
production operation:

### Environment validation

The backend validates required environment variables during startup and
fails fast when required configuration is missing.

### Production JWT protection

Production startup rejects the known default JWT secret and requires a
production-specific secret.

### Centralized error handling

Express routes ultimately pass errors to a centralized error handler.

### CORS restriction

The backend configures CORS against the configured frontend origin.

### Database startup failure handling

Failure to initialize the database causes the backend process to
terminate rather than continuing with an unusable database connection.

### Optional Socket.IO horizontal scaling

A Redis adapter is available when `REDIS_URL` is configured.

### Graceful SIGINT handling

The backend listens for `SIGINT` and closes the HTTP server before
exiting.

### Production keep-alive

The server starts a keep-alive mechanism in production using
`BACKEND_URL`, specifically to prevent sleeping on hosting platforms
such as Render.

These characteristics indicate production-oriented intent, but they
should not be interpreted as proof that the application satisfies every
production security, reliability, scalability, or observability
requirement.

------------------------------------------------------------------------

## 12. Current Production Readiness Assessment

This section deliberately distinguishes **implemented behavior** from
**production-readiness gaps**.

### Implemented

-   Environment validation
-   JWT authentication
-   Password hashing
-   Centralized Express error handling
-   CORS configuration
-   PostgreSQL persistence
-   Automated backend API tests
-   Real-time Socket.IO communication
-   Optional Redis adapter
-   Production-specific JWT secret validation
-   Graceful SIGINT shutdown
-   Production keep-alive behavior

### Areas requiring additional verification

The repository evidence reviewed for this part does not establish
complete implementation of:

-   Formal health/readiness endpoints
-   Comprehensive metrics
-   Distributed tracing
-   Automated database backups
-   Automated disaster recovery
-   Rate limiting
-   Security headers
-   Comprehensive audit logging
-   Formal API schema/versioning
-   Automated deployment pipeline
-   Formal rollback automation
-   Complete end-to-end test coverage
-   Load testing
-   Capacity benchmarks
-   Formal service-level objectives

These are documentation and engineering follow-up items, not claims that
the application is defective.

------------------------------------------------------------------------

## 13. Documentation Map

The complete documentation should be divided into focused parts rather
than one oversized README.

Recommended structure:

``` text
docs/
├── 01-overview.md
├── 02-quick-start.md
├── 03-system-architecture.md
├── 04-repository-structure.md
├── 05-core-concepts.md
├── 06-frontend-architecture.md
├── 07-backend-architecture.md
├── 08-authentication-and-authorization.md
├── 09-budget-and-collaboration.md
├── 10-transactions-and-financial-domain.md
├── 11-real-time-architecture.md
├── 12-database-and-data-model.md
├── 13-api-reference.md
├── 14-configuration.md
├── 15-testing.md
├── 16-error-handling-and-reliability.md
├── 17-security.md
├── 18-deployment.md
├── 19-observability.md
├── 20-performance-and-scaling.md
├── 21-troubleshooting.md
├── 22-design-decisions.md
├── 23-known-limitations.md
├── 24-contributing.md
├── 25-glossary.md
└── README.md
```

The parts should be written so that a reader can enter the documentation
at different levels:

``` text
New Developer
     │
     ├── Overview
     ├── Quick Start
     ├── Repository Structure
     └── Core Concepts

Application Developer
     │
     ├── Frontend Architecture
     ├── Backend Architecture
     ├── API Reference
     ├── Database
     └── Real-Time Architecture

Maintainer / Senior Engineer
     │
     ├── Architecture
     ├── Security
     ├── Reliability
     ├── Performance
     └── Design Decisions

Operator
     │
     ├── Configuration
     ├── Deployment
     ├── Observability
     └── Troubleshooting
```

------------------------------------------------------------------------

## 14. Source-of-Truth Notes

This documentation was derived from the supplied frontend and backend
repository snapshots.

The frontend snapshot describes a React application with its component,
context, hook, page, service, style, and utility structure. The backend
snapshot describes the Express, controller, service, model, database,
middleware, Socket.IO, utility, and test structure.

The repository snapshots are Repomix-generated representations of the
source trees. They are treated as read-only source material for this
documentation effort.

Where implementation details could not be established from the supplied
source, this document intentionally avoids presenting assumptions as
facts.

------------------------------------------------------------------------

## 15. Next Part

**Part 2 --- Quick Start & Development Environment**

The next document should establish the reliable path from a clean
development machine to a running WalletFlow frontend and backend,
including:

-   Prerequisites
-   Node/runtime requirements
-   Repository setup
-   Dependency installation
-   Environment variables
-   PostgreSQL/Neon setup
-   Database schema push
-   Database seeding
-   Frontend startup
-   Backend startup
-   Verification
-   Common startup failures
-   Development workflow
