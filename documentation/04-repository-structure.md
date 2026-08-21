# WalletFlow --- Repository Structure

## Part 4 --- Repository Structure & Code Navigation

This document is the **codebase navigation guide** for WalletFlow.

Its purpose is not merely to list directories. It explains where
functionality lives, which files form architectural boundaries, how
frontend and backend features map to one another, and where a developer
should begin when changing a particular part of the system.

The structure below is derived from the supplied repository snapshots.
The frontend repository contains dedicated component, context, hook,
page, service, style, and utility areas; the backend separates
configuration, controllers, database, middleware, models, routes,
services, sockets, tests, and utilities. fileciteturn5file1L176-L265
fileciteturn5file7L911-L981

------------------------------------------------------------------------

# 1. Repository-Level Structure

WalletFlow is organized as two application repositories/directories:

``` text
WalletFlow
├── frontend/
└── backend/
```

At a high level:

``` text
frontend/
    React application
    UI components
    pages
    application contexts
    API clients
    Socket.IO client
    styles
    frontend utilities

backend/
    Express application
    REST routes
    controllers
    domain services
    database models
    Drizzle schema
    authentication middleware
    Socket.IO server
    tests
    configuration
```

The frontend and backend are therefore separate deployable/runtime
concerns even though they form one product.

------------------------------------------------------------------------

# 2. Frontend Repository

## 2.1 Frontend Tree

The supplied frontend repository has the following major structure:

``` text
frontend/
├── public/
│   ├── favicon.ico
│   ├── index.html
│   ├── logo192.png
│   ├── robots.txt
│   └── sitemap.xml
│
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   ├── Budget/
│   │   ├── Collaboration/
│   │   ├── Dashboard/
│   │   ├── Reports/
│   │   ├── Shared/
│   │   └── Transaction/
│   │
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── utils/
│   ├── App.js
│   └── index.js
│
├── .env.example
├── package.json
├── postcss.config.js
└── tailwind.config.js
```

This structure is directly represented in the frontend repository
snapshot. fileciteturn5file1L176-L265

------------------------------------------------------------------------

# 3. Frontend Entry Points

## `src/index.js`

This is the browser application entry point.

Start here when investigating:

-   React application bootstrapping
-   Provider composition
-   Global application initialization
-   Root rendering

The application is rendered into the browser DOM and uses the
application's provider hierarchy before the route-driven UI.

------------------------------------------------------------------------

## `src/App.js`

This is the main application composition point.

Start here when investigating:

-   Application routing
-   Protected routes
-   Public routes
-   Page composition
-   Top-level application layout

A useful rule is:

> If you need to understand **which page appears for a URL**, start with
> `App.js`.

------------------------------------------------------------------------

# 4. Frontend `components/`

The component directory contains reusable and domain-specific UI.

``` text
src/components/
├── Auth/
├── Budget/
├── Collaboration/
├── Dashboard/
├── Reports/
├── Shared/
└── Transaction/
```

The division is feature-oriented.

------------------------------------------------------------------------

# 5. `components/Auth/`

``` text
Auth/
├── ForgotPassword.js
├── Login.js
└── Register.js
```

These components implement authentication-oriented UI.

Use this directory when modifying:

-   Login forms
-   Registration UI
-   Forgot-password UI

The associated page-level composition lives under `pages/`.

The API implementation is separate under:

``` text
services/authAPI.js
```

Therefore:

``` text
Auth UI
  │
  ▼
Auth page/context
  │
  ▼
authAPI.js
  │
  ▼
services/api.js
```

------------------------------------------------------------------------

# 6. `components/Budget/`

``` text
Budget/
├── AdjustBudgetForm.js
├── BudgetCard.js
├── BudgetDetailModal.js
├── BudgetForm.js
├── BudgetList.js
└── CategoryPicker.js
```

This is the primary budget-management UI area.

Use these files when modifying:

-   Budget creation forms
-   Budget editing
-   Budget cards
-   Budget lists
-   Budget detail views
-   Budget adjustments
-   Category selection

The corresponding HTTP operations are primarily in:

``` text
services/budgetAPI.js
```

The corresponding client-side state boundary is:

``` text
context/BudgetContext.js
```

------------------------------------------------------------------------

# 7. `components/Collaboration/`

``` text
Collaboration/
├── CollaborationModal.js
├── InviteUsers.js
├── LiveUser.js
└── UserList.js
```

This area contains budget collaboration UI.

Use it when changing:

-   User invitations
-   Collaborator lists
-   Collaboration modals
-   Live-user display

The REST API boundary is:

``` text
services/collaborationAPI.js
```

The real-time boundary is:

``` text
services/socket.js
context/SocketContext.js
```

This means collaboration spans both HTTP and Socket.IO.

------------------------------------------------------------------------

# 8. `components/Dashboard/`

``` text
Dashboard/
├── Dashboard.js
├── RecentActivity.js
└── Summary.js
```

These components provide dashboard-oriented presentation.

Use this area for:

-   Dashboard layout
-   Summary cards
-   Recent financial activity
-   Dashboard-specific presentation

If the change concerns how dashboard data is retrieved rather than
displayed, inspect the relevant context/API service instead.

------------------------------------------------------------------------

# 9. `components/Reports/`

``` text
Reports/
├── Chart.js
├── ExpenseChart.js
└── MonthlyReport.js
```

This area contains report visualization/presentation.

The corresponding API layer is:

``` text
services/reportAPI.js
```

The backend reporting implementation is:

``` text
controllers/reportController.js
services/reportService.js
routes/report.js
```

Therefore a report feature generally spans:

``` text
Reports UI
   │
   ▼
reportAPI.js
   │
   ▼
/api/reports
   │
   ▼
reportController.js
   │
   ▼
reportService.js
```

------------------------------------------------------------------------

# 10. `components/Shared/`

``` text
Shared/
├── Button.js
├── Header.js
├── Loading.js
├── Modal.js
├── NotificationsList.js
└── Sidebar.js
```

These components represent reusable application UI.

Use this area for cross-page UI primitives.

Examples:

-   Buttons
-   Modals
-   Loading states
-   Header
-   Sidebar
-   Notification list

Avoid placing domain-specific business logic in shared presentation
components unless the component genuinely owns that reusable behavior.

------------------------------------------------------------------------

# 11. `components/Transaction/`

``` text
Transaction/
├── TransactionForm.js
├── TransactionItem.js
└── TransactionList.js
```

This is the main transaction UI boundary.

Use it when modifying:

-   Transaction forms
-   Transaction rows/items
-   Transaction lists

The API boundary is:

``` text
services/transactionAPI.js
```

------------------------------------------------------------------------

# 12. Frontend `context/`

``` text
src/context/
├── AuthContext.js
├── BudgetContext.js
└── SocketContext.js
```

Contexts are application-state boundaries.

  Context              Main responsibility
  -------------------- ----------------------------
  `AuthContext.js`     Authentication/user state
  `BudgetContext.js`   Budget-domain state
  `SocketContext.js`   Real-time connection/state

A useful rule:

> If multiple unrelated components need the same application state,
> inspect the relevant context before adding duplicate state to
> individual components.

------------------------------------------------------------------------

# 13. `hooks/`

``` text
src/hooks/
├── useAuth.js
├── useBudgets.js
├── useLocalStorage.js
└── useSocket.js
```

Hooks provide convenient access to context and shared client behavior.

Typical navigation:

``` text
Component
   │
   ▼
Hook
   │
   ▼
Context
   │
   ▼
Service
```

Use hooks rather than directly coupling every component to context
implementation when the existing application already provides the
appropriate hook.

------------------------------------------------------------------------

# 14. `pages/`

The frontend page layer contains:

``` text
src/pages/
├── AcceptInvitationPage.js
├── BudgetsPage.js
├── DashboardPage.js
├── ForgotPasswordPage.js
├── HomePage.js
├── LoginPage.js
├── ProfilePage.js
├── RegisterPage.js
├── ReportsPage.js
├── ResetPasswordPage.js
├── SharingPage.js
└── TransactionsPage.js
```

Pages are route-level UI composition.

They are the best starting point when changing a complete screen.

------------------------------------------------------------------------

# 15. Page-to-Domain Mapping

  Page                        Primary domain
  --------------------------- ----------------
  `HomePage.js`               Public/home
  `LoginPage.js`              Authentication
  `RegisterPage.js`           Authentication
  `ForgotPasswordPage.js`     Authentication
  `ResetPasswordPage.js`      Authentication
  `DashboardPage.js`          Dashboard
  `BudgetsPage.js`            Budgets
  `TransactionsPage.js`       Transactions
  `ReportsPage.js`            Reports
  `SharingPage.js`            Collaboration
  `AcceptInvitationPage.js`   Invitations
  `ProfilePage.js`            User profile

------------------------------------------------------------------------

# 16. `services/`

The frontend service directory is one of the most important navigation
points:

``` text
src/services/
├── api.js
├── authAPI.js
├── budgetAPI.js
├── categoryAPI.js
├── collaborationAPI.js
├── notificationAPI.js
├── reportAPI.js
├── socket.js
├── transactionAPI.js
└── userAPI.js
```

The domain-specific API modules use the shared Axios client.

------------------------------------------------------------------------

# 17. `services/api.js`

This is the frontend's common HTTP transport layer.

It:

-   Creates the Axios instance
-   Uses `REACT_APP_API_URL`
-   Sets JSON content type
-   Reads the JWT from `localStorage`
-   Adds the `Authorization: Bearer ...` header
-   Handles HTTP 401 responses by removing the token and redirecting to
    `/login`

The actual implementation establishes the Axios base URL and
request/response interceptors. fileciteturn5file0L35-L77

Start here when investigating:

-   API base URL
-   Authorization header behavior
-   Global HTTP behavior
-   Global 401 behavior

------------------------------------------------------------------------

# 18. `services/authAPI.js`

Authentication API functions include operations such as:

``` text
login
register
getProfile
forgotPassword
resetPassword
```

The implementation maps these functions to `/auth/...` endpoints.
fileciteturn5file0L80-L124

Start here when changing the frontend's REST authentication contract.

------------------------------------------------------------------------

# 19. `services/budgetAPI.js`

Budget API operations include:

``` text
getAllBudgets
getBudgetById
createBudget
updateBudget
deleteBudget
getBudgetHistory
```

The implementation maps these to the `/budgets` API hierarchy.
fileciteturn5file6L780-L842

------------------------------------------------------------------------

# 20. `services/collaborationAPI.js`

Collaboration operations include:

``` text
inviteUser
getCollaborators
removeUser
acceptInvitation
```

The implementation maps collaboration operations to budget-sharing and
invitation endpoints. fileciteturn5file3L411-L450

------------------------------------------------------------------------

# 21. `services/notificationAPI.js`

Notification operations include:

``` text
getNotifications
markAsRead
markAllAsRead
```

The corresponding backend endpoints are:

``` text
GET /notifications
PUT /notifications/:id/read
PUT /notifications/read-all
```

The frontend implementation establishes these mappings.
fileciteturn5file3L452-L482

------------------------------------------------------------------------

# 22. `services/reportAPI.js`

Reporting operations include:

``` text
getSpendingSummary
getMonthlyReport
```

The frontend sends `month` and `year` as query parameters.

The endpoints are:

``` text
GET /reports/summary
GET /reports/monthly
```

fileciteturn5file3L484-L505

------------------------------------------------------------------------

# 23. `services/transactionAPI.js`

Transaction operations include:

``` text
getAllTransactions
createTransaction
updateTransaction
```

Additional transaction functions continue within the same service
module.

The service maps transaction operations to:

``` text
/transactions
/transactions/:id
```

fileciteturn5file4L625-L652

------------------------------------------------------------------------

# 24. `services/categoryAPI.js`

The category service provides:

``` text
getAllCategories()
```

which calls:

``` text
GET /categories
```

The backend currently returns category names rather than full category
records at this API boundary. fileciteturn5file3L393-L408

------------------------------------------------------------------------

# 25. `services/socket.js`

This file contains the frontend's low-level Socket.IO event helpers.

Current operations include:

``` text
joinBudgetRoom
leaveBudgetRoom
onBudgetUpdate
onTransactionUpdate
onLiveUsersUpdate
```

The implementation emits:

``` text
joinBudget
leaveBudget
```

and subscribes to:

``` text
budgetUpdated
transactionUpdated
liveUsers
```

fileciteturn5file4L584-L623

Start here when investigating a real-time event contract from the
frontend side.

------------------------------------------------------------------------

# 26. `styles/`

``` text
src/styles/
├── App.css
├── components.css
└── index.css
```

Use this area for global/component styling.

The repository also contains Tailwind configuration:

``` text
tailwind.config.js
postcss.config.js
```

at the frontend root.

------------------------------------------------------------------------

# 27. `utils/`

``` text
src/utils/
├── constants.js
├── formatters.js
├── helpers.js
└── validation.js
```

These files contain cross-cutting frontend utilities.

Use them before creating a new helper that duplicates existing
formatting, validation, constants, or generic utility behavior.

------------------------------------------------------------------------

# 28. Frontend Public Assets

The `public/` directory contains:

``` text
favicon.ico
index.html
logo192.png
robots.txt
sitemap.xml
```

`public/index.html` contains the product metadata and browser-level HTML
configuration.

It identifies the application as:

``` text
WalletFlow | Modern Collaborative Budgeting
```

and includes the public-facing product description.
fileciteturn5file5L745-L769

------------------------------------------------------------------------

# 29. Backend Repository

## 29.1 Backend Tree

The backend has:

``` text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── db/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── socket/
│   ├── tests/
│   ├── utils/
│   └── app.js
│
├── .env.example
├── .env.production
├── drizzle.config.js
├── package.json
└── server.js
```

This structure is directly represented in the supplied backend
repository. fileciteturn5file7L911-L981

------------------------------------------------------------------------

# 30. Backend Entry Points

## `server.js`

This is the backend process entry point.

Start here when investigating:

-   Server startup
-   HTTP server creation
-   Socket.IO initialization
-   Listening behavior
-   Shutdown handling
-   Production keep-alive behavior

------------------------------------------------------------------------

## `src/app.js`

This is the Express application composition point.

It imports:

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

and mounts them under `/api/...`.

It also applies:

``` text
CORS
express.json()
errorHandler
```

The supplied implementation explicitly shows this route composition.
fileciteturn5file8L1052-L1086

------------------------------------------------------------------------

# 31. Backend `config/`

``` text
src/config/
├── database.js
├── env.js
├── jwt.js
└── socket.js
```

Configuration is separated from domain/business logic.

------------------------------------------------------------------------

## `config/env.js`

This is the central environment configuration layer.

Start here when investigating:

-   Environment variables
-   Required configuration
-   Production validation
-   Development defaults
-   Backend URL
-   Frontend URL
-   Database URL
-   Redis URL
-   JWT configuration
-   Email configuration

The environment module validates required variables early in startup.
fileciteturn5file8L1025-L1041

------------------------------------------------------------------------

## `config/database.js`

This creates the database connection.

It:

-   Configures Neon WebSocket support
-   Creates the Neon pool
-   Creates the Drizzle instance
-   Uses the database schema
-   Exits the process if database initialization fails

The source constructs the database from `DATABASE_URL`.
fileciteturn5file7L987-L1022

------------------------------------------------------------------------

## `config/jwt.js`

This is the JWT configuration boundary.

Start here when investigating:

-   JWT signing configuration
-   Token secret
-   Token expiration
-   Authentication configuration

------------------------------------------------------------------------

## `config/socket.js`

This is the Socket.IO configuration boundary.

Use it when investigating:

-   Socket.IO server configuration
-   CORS-related socket behavior
-   Redis adapter configuration
-   Socket server initialization

------------------------------------------------------------------------

# 32. Backend `routes/`

``` text
src/routes/
├── auth.js
├── budget.js
├── category.js
├── invitation.js
├── notification.js
├── report.js
├── transaction.js
└── user.js
```

Routes define the HTTP endpoint surface.

Use route files when you need to answer:

> "Which controller handles this endpoint?"

They are the bridge:

``` text
HTTP path
    ↓
Route
    ↓
Middleware
    ↓
Controller
```

------------------------------------------------------------------------

# 33. Backend `controllers/`

``` text
src/controllers/
├── authController.js
├── budgetController.js
├── categoryController.js
├── invitationController.js
├── notificationController.js
├── reportController.js
├── transactionController.js
└── userController.js
```

Controllers translate HTTP requests into domain operations.

Start here when investigating:

-   Request parameters
-   Request bodies
-   HTTP status codes
-   Controller-level authorization checks
-   Service calls
-   Response shape
-   Error propagation

------------------------------------------------------------------------

# 34. Backend `services/`

``` text
src/services/
├── authService.js
├── budgetService.js
├── emailService.js
├── invitationService.js
├── notificationService.js
├── reportService.js
├── transactionService.js
└── userService.js
```

This is the primary business-logic area.

Start here when a change affects:

-   Business rules
-   Multi-step operations
-   Budget behavior
-   Collaboration
-   Transaction rules
-   Authentication behavior
-   Reporting calculations
-   Notifications
-   User operations
-   Email workflows

------------------------------------------------------------------------

# 35. Backend `models/`

``` text
src/models/
├── Budget.js
├── BudgetHistory.js
├── BudgetUser.js
├── Category.js
├── Invitation.js
├── Notification.js
├── Transaction.js
└── User.js
```

Models provide database-oriented operations.

Start here when:

-   Adding a database query
-   Changing a persistence operation
-   Changing database-level filtering
-   Investigating a model's relationship with the schema

Avoid putting HTTP-specific logic here.

------------------------------------------------------------------------

# 36. Backend `db/`

``` text
src/db/
├── schema.js
└── seed.js
```

This is the database definition/bootstrap area.

------------------------------------------------------------------------

## `db/schema.js`

This is the database schema source.

Use it when changing:

-   Tables
-   Columns
-   Foreign keys
-   Enums
-   Constraints
-   Relations

The Drizzle CLI also references this file through:

``` text
drizzle.config.js
```

The configured schema path is:

``` text
./src/db/schema.js
```

and the dialect is PostgreSQL. fileciteturn5file8L1089-L1102

------------------------------------------------------------------------

## `db/seed.js`

This initializes default category data.

Use it when changing:

-   Default categories
-   Development database seed data
-   Production seed safety behavior

The seed uses conflict handling so existing category names are not
blindly duplicated. fileciteturn5file2L276-L296

------------------------------------------------------------------------

# 37. Backend `middleware/`

``` text
src/middleware/
├── auth.js
├── cors.js
├── errorHandler.js
└── validation.js
```

------------------------------------------------------------------------

## `middleware/auth.js`

This is the HTTP authentication boundary.

It:

1.  Reads the `Authorization` header.
2.  Extracts the Bearer token.
3.  Verifies the JWT.
4.  Places the decoded user payload on `req.user`.
5.  Rejects missing/invalid tokens.

The implementation distinguishes missing credentials with HTTP `401` and
invalid/expired credentials with HTTP `403`.
fileciteturn5file2L299-L334

------------------------------------------------------------------------

## `middleware/cors.js`

This configures browser-origin access.

The allowed origin is:

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

Credentials are enabled. fileciteturn5file2L337-L354

------------------------------------------------------------------------

## `middleware/errorHandler.js`

This is the centralized Express error boundary.

Controllers can call:

``` javascript
next(error)
```

and allow this middleware to format/log the failure.

Start here when investigating:

-   Unexpected API errors
-   Error response formatting
-   Server-side error logging
-   Status-code selection

------------------------------------------------------------------------

## `middleware/validation.js`

This contains request-validation middleware.

Use it when modifying or investigating input validation at the HTTP
boundary.

------------------------------------------------------------------------

# 38. Backend `socket/`

``` text
src/socket/
├── budgetEvents.js
├── socketHandler.js
├── socketManager.js
└── userEvents.js
```

This is the real-time application boundary.

------------------------------------------------------------------------

## `socketHandler.js`

This is the Socket.IO connection/authentication entry point.

Use it when investigating:

-   Socket connection authentication
-   JWT verification
-   User room creation
-   Event registration
-   Disconnect handling

------------------------------------------------------------------------

## `budgetEvents.js`

Contains budget-room socket behavior.

Use it when investigating:

-   Joining budgets
-   Leaving budgets
-   Budget room events
-   Budget-related broadcasts

------------------------------------------------------------------------

## `userEvents.js`

Contains user presence-related socket behavior.

The current implementation uses process-local memory for live-user
tracking.

------------------------------------------------------------------------

## `socketManager.js`

Provides access to the initialized Socket.IO instance from other backend
modules.

Use it when a backend service/controller needs to emit an event outside
the direct socket connection handler.

------------------------------------------------------------------------

# 39. Backend `utils/`

``` text
src/utils/
├── constants.js
├── helpers.js
├── logger.js
└── validators.js
```

These are cross-cutting backend utilities.

Use them before introducing duplicate helpers.

------------------------------------------------------------------------

# 40. Backend `tests/`

``` text
src/tests/
├── auth.test.js
├── budget.test.js
└── transaction.test.js
```

These are backend automated tests.

The backend package runs them using:

``` bash
npm test
```

with Jest in-band execution. The package script is explicitly defined
as:

``` text
jest --runInBand --testTimeout=30000
```

fileciteturn5file8L1105-L1116

------------------------------------------------------------------------

# 41. Root-Level Backend Configuration

Important backend root files:

  -----------------------------------------------------------------------
  File                                Purpose
  ----------------------------------- -----------------------------------
  `.env.example`                      Environment configuration template

  `.env.production`                   Production environment
                                      configuration file present in
                                      repository

  `drizzle.config.js`                 Drizzle CLI/database configuration

  `package.json`                      Dependencies and scripts

  `server.js`                         Backend process entry point
  -----------------------------------------------------------------------

The presence of `.env.production` means production configuration is
represented in the repository snapshot, but sensitive values should
still be treated as secrets and must not be exposed in documentation.

------------------------------------------------------------------------

# 42. Frontend ↔ Backend Feature Mapping

This table is the fastest way to navigate cross-stack changes.

  -----------------------------------------------------------------------------------
  Feature                 Frontend                     Backend
  ----------------------- ---------------------------- ------------------------------
  Authentication          `AuthContext.js`,            `auth.js`,
                          `authAPI.js`, Auth           `authController.js`,
                          components/pages             `authService.js`, `User.js`

  Budgets                 Budget components,           `budget.js`,
                          `BudgetContext.js`,          `budgetController.js`,
                          `budgetAPI.js`               `budgetService.js`,
                                                       `Budget.js`

  Transactions            Transaction components,      `transaction.js`,
                          `transactionAPI.js`          `transactionController.js`,
                                                       `transactionService.js`,
                                                       `Transaction.js`

  Categories              `CategoryPicker.js`,         `category.js`,
                          `categoryAPI.js`             `categoryController.js`,
                                                       `Category.js`

  Collaboration           Collaboration components,    `budget.js`, `invitation.js`,
                          `collaborationAPI.js`        collaboration/budget services
                                                       and models

  Invitations             `AcceptInvitationPage.js`,   `invitation.js`,
                          collaboration API            `invitationController.js`,
                                                       `invitationService.js`,
                                                       `Invitation.js`

  Notifications           `NotificationsList.js`,      `notification.js`,
                          `notificationAPI.js`         `notificationController.js`,
                                                       `Notification.js`

  Reports                 Reports components,          `report.js`,
                          `reportAPI.js`               `reportController.js`,
                                                       `reportService.js`

  Profile                 `ProfilePage.js`,            `user.js`,
                          `userAPI.js`                 `userController.js`,
                                                       `userService.js`, `User.js`

  Real-time               `SocketContext.js`,          `socketHandler.js`,
                          `socket.js`                  `budgetEvents.js`,
                                                       `userEvents.js`,
                                                       `socketManager.js`
  -----------------------------------------------------------------------------------

------------------------------------------------------------------------

# 43. Feature Change Navigation

## "I want to change login"

Start here:

``` text
frontend/
├── src/pages/LoginPage.js
├── src/components/Auth/Login.js
├── src/context/AuthContext.js
└── src/services/authAPI.js

backend/
├── src/routes/auth.js
├── src/controllers/authController.js
├── src/services/authService.js
├── src/middleware/auth.js
└── src/config/jwt.js
```

------------------------------------------------------------------------

## "I want to change budget creation"

Start here:

``` text
frontend/
├── src/pages/BudgetsPage.js
├── src/components/Budget/BudgetForm.js
├── src/context/BudgetContext.js
└── src/services/budgetAPI.js

backend/
├── src/routes/budget.js
├── src/controllers/budgetController.js
├── src/services/budgetService.js
└── src/models/Budget.js
```

If the database structure changes:

``` text
backend/src/db/schema.js
```

must also be considered.

------------------------------------------------------------------------

## "I want to change transactions"

Start here:

``` text
frontend/
├── src/pages/TransactionsPage.js
├── src/components/Transaction/
└── src/services/transactionAPI.js

backend/
├── src/routes/transaction.js
├── src/controllers/transactionController.js
├── src/services/transactionService.js
└── src/models/Transaction.js
```

For transaction real-time behavior, additionally inspect:

``` text
frontend/src/services/socket.js
backend/src/socket/
```

------------------------------------------------------------------------

## "I want to change budget sharing"

Start here:

``` text
frontend/
├── src/pages/SharingPage.js
├── src/components/Collaboration/
└── src/services/collaborationAPI.js

backend/
├── src/routes/budget.js
├── src/routes/invitation.js
├── src/controllers/budgetController.js
├── src/controllers/invitationController.js
├── src/services/budgetService.js
├── src/services/invitationService.js
├── src/models/BudgetUser.js
└── src/models/Invitation.js
```

------------------------------------------------------------------------

## "I want to change reports"

Start here:

``` text
frontend/
├── src/pages/ReportsPage.js
├── src/components/Reports/
└── src/services/reportAPI.js

backend/
├── src/routes/report.js
├── src/controllers/reportController.js
└── src/services/reportService.js
```

------------------------------------------------------------------------

## "I want to change notifications"

Start here:

``` text
frontend/
├── src/components/Shared/NotificationsList.js
└── src/services/notificationAPI.js

backend/
├── src/routes/notification.js
├── src/controllers/notificationController.js
└── src/models/Notification.js
```

------------------------------------------------------------------------

## "I want to change real-time collaboration"

Inspect both sides:

``` text
Frontend
├── src/context/SocketContext.js
├── src/hooks/useSocket.js
└── src/services/socket.js

Backend
├── src/config/socket.js
├── src/socket/socketHandler.js
├── src/socket/socketManager.js
├── src/socket/budgetEvents.js
└── src/socket/userEvents.js
```

------------------------------------------------------------------------

# 44. Dependency Direction

The intended dependency direction should generally remain:

## Frontend

``` text
Pages
  ↓
Components
  ↓
Hooks / Context
  ↓
Services
  ↓
Axios / Socket.IO
```

## Backend

``` text
Routes
  ↓
Controllers
  ↓
Services
  ↓
Models
  ↓
Database
```

Cross-cutting infrastructure:

``` text
Config
Middleware
Utils
Socket infrastructure
```

should remain appropriately separated from presentation and domain code.

------------------------------------------------------------------------

# 45. Where Business Logic Belongs

A practical rule for the current architecture:

### UI behavior

Put in:

``` text
components/
pages/
```

### Shared client state

Put in:

``` text
context/
hooks/
```

### REST client behavior

Put in:

``` text
services/*API.js
```

### HTTP routing

Put in:

``` text
backend/src/routes/
```

### HTTP request/response handling

Put in:

``` text
backend/src/controllers/
```

### Business rules

Prefer:

``` text
backend/src/services/
```

### Database operations

Put in:

``` text
backend/src/models/
```

### Database structure

Put in:

``` text
backend/src/db/schema.js
```

### Socket connection/event infrastructure

Put in:

``` text
backend/src/socket/
```

------------------------------------------------------------------------

# 46. Where Logic Should Not Be Duplicated

Avoid creating parallel implementations of the same responsibility.

For example:

### Do not duplicate API base URL logic

Use:

``` text
services/api.js
```

### Do not duplicate JWT attachment

Use the Axios interceptor.

### Do not duplicate budget HTTP calls

Use:

``` text
budgetAPI.js
```

### Do not create direct database access from controllers

Keep persistence in the model layer.

### Do not put domain rules into reusable UI components

Keep domain operations in contexts/services as appropriate.

------------------------------------------------------------------------

# 47. Code Ownership Mental Model

When a developer asks:

> "Which file owns this behavior?"

Use this decision tree:

``` text
Is it visual?
    │
    └── Yes → component/page

Is it shared client state?
    │
    └── Yes → context/hook

Is it an HTTP call?
    │
    └── Yes → frontend service

Is it an API endpoint?
    │
    └── Yes → backend route/controller

Is it business behavior?
    │
    └── Yes → backend service

Is it database persistence?
    │
    └── Yes → backend model/schema

Is it real-time connection/event handling?
    │
    └── Yes → socket layer
```

------------------------------------------------------------------------

# 48. Important Architectural Files

If a new engineer has only ten minutes to understand the repository,
start with:

### Frontend

``` text
src/index.js
src/App.js
src/context/AuthContext.js
src/context/BudgetContext.js
src/context/SocketContext.js
src/services/api.js
```

### Backend

``` text
server.js
src/app.js
src/config/env.js
src/routes/
src/services/
src/db/schema.js
src/socket/socketHandler.js
```

These files provide the shortest route to understanding application
startup, routing, state, communication, persistence, and real-time
behavior.

------------------------------------------------------------------------

# 49. Repository Navigation Cheat Sheet

  -------------------------------------------------------------------------------
  Question                            Start here
  ----------------------------------- -------------------------------------------
  How does frontend start?            `frontend/src/index.js`

  What page handles this URL?         `frontend/src/App.js`

  Where is auth state?                `frontend/src/context/AuthContext.js`

  Where are budgets stored            `frontend/src/context/BudgetContext.js`
  client-side?                        

  How does REST authentication work?  `frontend/src/services/api.js`

  How does Socket.IO work on          `frontend/src/context/SocketContext.js`,
  frontend?                           `services/socket.js`

  Where are budget API calls?         `frontend/src/services/budgetAPI.js`

  Where are transaction API calls?    `frontend/src/services/transactionAPI.js`

  Where does backend start?           `backend/server.js`

  Where are API routes mounted?       `backend/src/app.js`

  Where is environment validation?    `backend/src/config/env.js`

  Where is DB connection?             `backend/src/config/database.js`

  Where is DB schema?                 `backend/src/db/schema.js`

  Where is JWT middleware?            `backend/src/middleware/auth.js`

  Where is business logic?            `backend/src/services/`

  Where is persistence logic?         `backend/src/models/`

  Where are REST routes?              `backend/src/routes/`

  Where is Socket.IO auth?            `backend/src/socket/socketHandler.js`

  Where are budget socket events?     `backend/src/socket/budgetEvents.js`

  Where is user presence?             `backend/src/socket/userEvents.js`

  Where are backend tests?            `backend/src/tests/`
  -------------------------------------------------------------------------------

------------------------------------------------------------------------

# 50. Repository Structure Summary

WalletFlow's repository structure is intentionally divided by
responsibility.

The frontend is primarily:

``` text
Pages
→ Components
→ Contexts/Hooks
→ API Services
→ HTTP/Socket transport
```

The backend is primarily:

``` text
Routes
→ Controllers
→ Services
→ Models
→ Database
```

with supporting infrastructure for:

``` text
Configuration
Middleware
Real-time sockets
Utilities
Tests
```

The most important navigation principle is:

> **Find the feature first, then follow the layer boundaries.**

For example:

``` text
Budget feature
   │
   ├── UI → components/Budget
   ├── Page → pages/BudgetsPage
   ├── State → context/BudgetContext
   ├── API → services/budgetAPI
   │
   └── Backend
       ├── Route → routes/budget
       ├── Controller → controllers/budgetController
       ├── Logic → services/budgetService
       └── Persistence → models/Budget
```

This is the intended mental model for navigating the codebase without
reading the entire repository.

------------------------------------------------------------------------

# 51. Next Part

**Part 5 --- Core Concepts**

The next document will explain the concepts developers must understand
before safely modifying WalletFlow, including:

-   Identity and JWT
-   Users
-   Budgets
-   Budget membership and roles
-   Transactions
-   Categories
-   Invitations
-   Notifications
-   Reports
-   Client state
-   Real-time rooms/events
-   Persistence
-   Resource ownership
-   Lifecycle concepts
-   Cross-domain relationships
