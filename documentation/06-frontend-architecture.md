# WalletFlow --- Frontend Architecture

## Part 6 --- Frontend Architecture

This document describes the React application's architecture, state
boundaries, routing model, API communication, authentication lifecycle,
and real-time client behavior.

It is derived from the supplied frontend repository structure and
implementation. Where the source does not establish a behavior, this
document does not present that behavior as an implemented guarantee.

------------------------------------------------------------------------

# 1. Frontend Architecture Overview

The WalletFlow frontend is a React application organized around:

``` text
Application Bootstrap
        │
        ▼
Routing / Pages
        │
        ▼
Components
        │
        ├───────────────┐
        ▼               ▼
Contexts / Hooks     Services
        │               │
        └───────┬───────┘
                ▼
        REST API / Socket.IO
```

The frontend repository separates:

``` text
components/
context/
hooks/
pages/
services/
styles/
utils/
```

This gives the client a feature-oriented presentation layer with shared
application state and transport services.

------------------------------------------------------------------------

# 2. Application Entry Point

The primary frontend entry point is:

``` text
src/index.js
```

Its responsibility is application bootstrap.

The application is rendered into the browser DOM and establishes the
top-level React application before the user reaches individual pages.

When investigating:

-   startup behavior
-   global providers
-   application initialization
-   root rendering

start with:

``` text
src/index.js
```

------------------------------------------------------------------------

# 3. Application Composition

The next major file is:

``` text
src/App.js
```

`App.js` is the application's route/composition boundary.

Use it when investigating:

-   which URL maps to which page
-   protected routes
-   public routes
-   top-level application composition
-   route-level access behavior

A useful mental model is:

``` text
index.js
   │
   ▼
App.js
   │
   ▼
Route
   │
   ▼
Page
   │
   ▼
Feature Components
```

------------------------------------------------------------------------

# 4. Page Architecture

Pages represent route-level application screens.

The supplied repository contains:

``` text
pages/
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

Pages should primarily compose the UI required for a route.

They are not the preferred location for low-level HTTP transport code.

------------------------------------------------------------------------

# 5. Page-to-Feature Architecture

The major route/page domains are:

``` text
Home
Authentication
Dashboard
Budgets
Transactions
Reports
Sharing
Invitations
Profile
```

The corresponding feature components are separated from pages.

For example:

``` text
BudgetsPage
   │
   └── components/Budget/*
```

and:

``` text
ReportsPage
   │
   └── components/Reports/*
```

This separation keeps route composition distinct from reusable feature
presentation.

------------------------------------------------------------------------

# 6. Component Architecture

The frontend components are organized by domain:

``` text
components/
├── Auth/
├── Budget/
├── Collaboration/
├── Dashboard/
├── Reports/
├── Shared/
└── Transaction/
```

This is preferable to one large global components directory because the
feature boundary remains visible in the filesystem.

------------------------------------------------------------------------

# 7. Authentication UI

Authentication components include:

``` text
components/Auth/
├── ForgotPassword.js
├── Login.js
└── Register.js
```

These are presentation/form boundaries.

The authentication state and API operations are handled elsewhere:

``` text
AuthContext
authAPI
api
```

Therefore:

``` text
Login UI
   │
   ▼
AuthContext
   │
   ▼
authAPI
   │
   ▼
Axios
   │
   ▼
Backend
```

------------------------------------------------------------------------

# 8. Budget UI

Budget components include:

``` text
components/Budget/
├── AdjustBudgetForm.js
├── BudgetCard.js
├── BudgetDetailModal.js
├── BudgetForm.js
├── BudgetList.js
└── CategoryPicker.js
```

These components should own presentation and user interaction for budget
features.

Budget application state belongs in:

``` text
context/BudgetContext.js
```

Budget HTTP operations belong in:

``` text
services/budgetAPI.js
```

This creates the client-side budget architecture:

``` text
Budget Page
   │
   ▼
Budget Components
   │
   ▼
Budget Context
   │
   ▼
budgetAPI
   │
   ▼
Axios
```

------------------------------------------------------------------------

# 9. Transaction UI

Transaction components include:

``` text
components/Transaction/
├── TransactionForm.js
├── TransactionItem.js
└── TransactionList.js
```

The transaction HTTP boundary is:

``` text
services/transactionAPI.js
```

The preferred conceptual separation is:

``` text
Transaction UI
      │
      ▼
Transaction state / page logic
      │
      ▼
transactionAPI
      │
      ▼
Backend transaction API
```

------------------------------------------------------------------------

# 10. Collaboration UI

Collaboration components include:

``` text
components/Collaboration/
├── CollaborationModal.js
├── InviteUsers.js
├── LiveUser.js
└── UserList.js
```

Collaboration is special because it crosses two frontend transport
mechanisms:

``` text
HTTP
 │
 └── Invitations / membership operations

Socket.IO
 │
 └── Live collaboration / presence
```

The relevant frontend services are:

``` text
collaborationAPI.js
socket.js
```

------------------------------------------------------------------------

# 11. Reports UI

Reports are divided into:

``` text
components/Reports/
├── Chart.js
├── ExpenseChart.js
└── MonthlyReport.js
```

The reporting API boundary is:

``` text
services/reportAPI.js
```

The frontend report architecture is:

``` text
ReportsPage
    │
    ▼
Reports Components
    │
    ▼
reportAPI
    │
    ▼
Backend report endpoints
```

------------------------------------------------------------------------

# 12. Shared Components

Shared components include:

``` text
components/Shared/
├── Button.js
├── Header.js
├── Loading.js
├── Modal.js
├── NotificationsList.js
└── Sidebar.js
```

These are cross-feature presentation components.

Examples:

``` text
Button
Modal
Loading
Header
Sidebar
NotificationsList
```

The shared directory should remain focused on genuinely reusable
presentation and interaction components.

------------------------------------------------------------------------

# 13. Context Architecture

The frontend contains three application contexts:

``` text
context/
├── AuthContext.js
├── BudgetContext.js
└── SocketContext.js
```

These contexts represent three major application-level state boundaries:

``` text
Authentication
Budget state
Real-time connection
```

------------------------------------------------------------------------

# 14. AuthContext

`AuthContext.js` owns authentication state.

Its responsibilities include:

-   Current user
-   Authentication status
-   Loading state
-   Login
-   Registration
-   Logout
-   Profile retrieval
-   Password recovery-related operations

The context coordinates with:

``` text
authAPI.js
```

and browser token persistence.

------------------------------------------------------------------------

# 15. AuthContext State Lifecycle

The authentication lifecycle can be represented as:

``` text
Application starts
      │
      ▼
Read stored token
      │
      ├── No token
      │     │
      │     ▼
      │  Unauthenticated
      │
      └── Token exists
             │
             ▼
       Request profile
             │
        ┌────┴─────┐
        ▼          ▼
      Valid      Invalid
        │          │
        ▼          ▼
     User set   Token cleared
```

The frontend API client also handles HTTP 401 responses globally.

------------------------------------------------------------------------

# 16. Token Persistence

The frontend persists the JWT in browser `localStorage`.

The shared Axios client reads the token from storage and attaches it to
outgoing requests.

The transport pattern is:

``` text
localStorage
     │
     ▼
Axios request interceptor
     │
     ▼
Authorization: Bearer <token>
```

The source implementation establishes this behavior in
`services/api.js`.

------------------------------------------------------------------------

# 17. Global 401 Handling

The Axios client has a response interceptor.

When a response has:

``` text
HTTP 401
```

the client:

1.  Removes the stored token.
2.  Redirects the browser to `/login`.

This creates a global session-expiration behavior rather than requiring
every API service to handle authentication expiration independently.

------------------------------------------------------------------------

# 18. BudgetContext

`BudgetContext.js` represents budget-domain client state.

Its purpose is to prevent each budget-related component from
independently maintaining duplicate budget state and API logic.

The conceptual architecture is:

``` text
Budget Components
       │
       ▼
BudgetContext
       │
       ▼
budgetAPI
```

The exact state fields and update operations should be treated according
to the current context implementation.

------------------------------------------------------------------------

# 19. SocketContext

`SocketContext.js` owns the application-level Socket.IO connection
state.

It sits above low-level socket helpers:

``` text
SocketContext
      │
      ▼
services/socket.js
      │
      ▼
Socket.IO client
```

The context allows React components/hooks to interact with real-time
functionality without each component constructing its own socket
connection.

------------------------------------------------------------------------

# 20. Hook Architecture

The frontend contains:

``` text
hooks/
├── useAuth.js
├── useBudgets.js
├── useLocalStorage.js
└── useSocket.js
```

Hooks provide a cleaner component-facing API over contexts and shared
client behavior.

Typical use:

``` text
Component
    │
    ▼
useAuth / useBudgets / useSocket
    │
    ▼
Context
    │
    ▼
Service
```

------------------------------------------------------------------------

# 21. `useAuth`

Use:

``` text
useAuth.js
```

when a component needs access to authentication context.

This avoids making every component directly depend on the implementation
details of `AuthContext`.

------------------------------------------------------------------------

# 22. `useBudgets`

Use:

``` text
useBudgets.js
```

for budget state/actions exposed through the budget context.

This creates a cleaner boundary between:

``` text
React component
```

and:

``` text
BudgetContext implementation
```

------------------------------------------------------------------------

# 23. `useSocket`

Use:

``` text
useSocket.js
```

when a component needs access to the Socket context.

This keeps components decoupled from the underlying Socket.IO client
setup.

------------------------------------------------------------------------

# 24. `useLocalStorage`

`useLocalStorage.js` provides reusable browser-storage behavior.

It should be preferred over creating repeated custom localStorage access
patterns if the existing hook satisfies the use case.

------------------------------------------------------------------------

# 25. Frontend Service Architecture

The service directory contains:

``` text
services/
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

There are two major categories:

``` text
HTTP services
Socket service
```

------------------------------------------------------------------------

# 26. Shared Axios Client

`services/api.js` is the common HTTP transport.

It establishes:

``` text
baseURL
Content-Type
Authorization
401 handling
```

The API base URL comes from:

``` text
REACT_APP_API_URL
```

with a localhost fallback in the current source.

------------------------------------------------------------------------

# 27. Domain API Services

Domain API modules encapsulate endpoint details.

Examples:

``` text
authAPI.js
budgetAPI.js
transactionAPI.js
reportAPI.js
notificationAPI.js
categoryAPI.js
collaborationAPI.js
userAPI.js
```

This creates a useful rule:

> UI code should not need to know the complete backend URL or manually
> construct Authorization headers.

The shared API client handles transport-level concerns.

------------------------------------------------------------------------

# 28. Authentication API

`authAPI.js` provides frontend functions for:

``` text
register
login
getProfile
forgotPassword
resetPassword
```

The API service maps these functions to backend authentication
endpoints.

The context consumes these operations rather than embedding HTTP details
directly into authentication UI.

------------------------------------------------------------------------

# 29. Budget API

`budgetAPI.js` provides:

``` text
getAllBudgets
getBudgetById
createBudget
updateBudget
deleteBudget
getBudgetHistory
```

This module should be the frontend starting point for budget REST
operations.

------------------------------------------------------------------------

# 30. Transaction API

`transactionAPI.js` encapsulates transaction HTTP operations.

It provides functions for operations such as:

``` text
Get
Create
Update
```

The transaction UI should use this service rather than manually
constructing REST requests.

------------------------------------------------------------------------

# 31. Collaboration API

`collaborationAPI.js` encapsulates:

``` text
inviteUser
getCollaborators
removeUser
acceptInvitation
```

It therefore handles the HTTP side of collaboration.

Real-time collaboration remains under:

``` text
socket.js
```

------------------------------------------------------------------------

# 32. Notification API

`notificationAPI.js` encapsulates:

``` text
getNotifications
markAsRead
markAllAsRead
```

This keeps notification endpoint details outside presentation
components.

------------------------------------------------------------------------

# 33. Report API

`reportAPI.js` provides:

``` text
getSpendingSummary
getMonthlyReport
```

with report-period parameters.

This is the frontend boundary for report retrieval.

------------------------------------------------------------------------

# 34. Category API

`categoryAPI.js` retrieves available categories.

The current API is:

``` text
GET /categories
```

and returns category names.

The category picker consumes this service.

------------------------------------------------------------------------

# 35. User API

`userAPI.js` provides frontend access to user/profile-related backend
operations.

Profile UI should use this service rather than constructing direct HTTP
calls.

------------------------------------------------------------------------

# 36. Socket Service

`services/socket.js` is the low-level real-time service.

The frontend socket contract includes:

``` text
joinBudgetRoom
leaveBudgetRoom
onBudgetUpdate
onTransactionUpdate
onLiveUsersUpdate
```

The service emits:

``` text
joinBudget
leaveBudget
```

and listens for:

``` text
budgetUpdated
transactionUpdated
liveUsers
```

------------------------------------------------------------------------

# 37. Socket Authentication

The Socket.IO connection uses the JWT token.

Conceptually:

``` text
AuthContext
    │
    ▼
JWT
    │
    ▼
SocketContext
    │
    ▼
Socket.IO connection
```

The backend then verifies the token during the handshake.

Therefore, the real-time connection is dependent on authenticated client
state.

------------------------------------------------------------------------

# 38. Real-Time Client Lifecycle

A simplified lifecycle is:

``` text
User logs in
    │
    ▼
JWT becomes available
    │
    ▼
Socket connection established
    │
    ▼
JWT supplied to Socket.IO
    │
    ▼
Backend authenticates socket
    │
    ▼
Client can join budget rooms
    │
    ▼
Events update UI
    │
    ▼
User logs out / token becomes invalid
    │
    ▼
Socket lifecycle ends
```

The exact disconnect/reconnect behavior should follow the current
`SocketContext` implementation.

------------------------------------------------------------------------

# 39. Budget Real-Time Flow

A component interested in budget updates should conceptually use:

``` text
useSocket
   │
   ▼
SocketContext
   │
   ▼
onBudgetUpdate
   │
   ▼
Update local/client budget state
```

This separates event transport from presentation.

------------------------------------------------------------------------

# 40. Transaction Real-Time Flow

Transaction updates follow the same general pattern:

``` text
Socket event
    │
    ▼
Socket service
    │
    ▼
SocketContext / hook
    │
    ▼
Relevant UI state
    │
    ▼
Transaction components
```

The frontend socket service provides the `transactionUpdated`
subscription.

------------------------------------------------------------------------

# 41. Live User Flow

The frontend socket service subscribes to:

``` text
liveUsers
```

and passes the event data to the callback supplied by the consumer.

The UI component responsible for live-user display is:

``` text
components/Collaboration/LiveUser.js
```

This creates:

``` text
Socket.IO
   │
   ▼
Socket service
   │
   ▼
Socket context/hook
   │
   ▼
LiveUser component
```

------------------------------------------------------------------------

# 42. Loading State Architecture

The frontend contains a reusable:

``` text
components/Shared/Loading.js
```

The application also has context-level loading concepts, particularly
around authentication initialization.

Loading should generally be represented at the layer that owns the
asynchronous operation:

``` text
Authentication loading → AuthContext
Budget loading → budget state/context
Page-specific loading → page/component
Reusable visual loading → Loading component
```

------------------------------------------------------------------------

# 43. Error Handling Architecture

Frontend errors can originate from:

``` text
HTTP
Socket.IO
Validation
Application state
```

The shared Axios layer handles a global authentication-expiration case:

``` text
401 → clear token → /login
```

Other domain/API errors should remain available to the consuming
context/component for appropriate presentation.

The supplied source does not establish a single global frontend
error-store architecture, so this document does not claim one exists.

------------------------------------------------------------------------

# 44. Routing and Authentication

The frontend has authentication-sensitive pages and public pages.

A conceptual route boundary is:

``` text
Public
├── Home
├── Login
├── Register
├── Forgot Password
└── Reset Password

Authenticated
├── Dashboard
├── Budgets
├── Transactions
├── Reports
├── Sharing
└── Profile

Invitation
└── Accept Invitation
```

The exact protection logic should be maintained in the application's
route configuration rather than duplicated in individual pages.

------------------------------------------------------------------------

# 45. Frontend Data Flow

A normal CRUD flow looks like:

``` text
User interaction
       │
       ▼
Component
       │
       ▼
Context / Hook
       │
       ▼
Domain API service
       │
       ▼
Axios
       │
       ▼
Backend REST API
       │
       ▼
Response
       │
       ▼
Context/component state
       │
       ▼
React re-render
```

This is the normal request/response path.

------------------------------------------------------------------------

# 46. Frontend Event Flow

A real-time update follows a different path:

``` text
Backend Socket.IO event
       │
       ▼
Socket.IO client
       │
       ▼
services/socket.js
       │
       ▼
SocketContext / hook
       │
       ▼
Application state
       │
       ▼
React component
       │
       ▼
UI update
```

The two flows should not be conflated.

------------------------------------------------------------------------

# 47. REST vs Socket Responsibilities

The frontend should conceptually use:

### REST for

``` text
Fetch
Create
Update
Delete
Authentication
Reports
Notifications
```

### Socket.IO for

``` text
Real-time updates
Budget room events
Live collaboration
Presence
```

A socket event should not automatically replace the durable REST/API
operation unless the backend contract explicitly supports that behavior.

------------------------------------------------------------------------

# 48. State Ownership Rules

A practical state ownership model is:

``` text
Authentication state
    → AuthContext

Budget application state
    → BudgetContext

Socket connection state
    → SocketContext

Local reusable browser state
    → useLocalStorage

Temporary component UI state
    → Component
```

This prevents all application state from being placed into one global
context.

------------------------------------------------------------------------

# 49. API Ownership Rules

Use:

``` text
authAPI.js
```

for authentication endpoints.

Use:

``` text
budgetAPI.js
```

for budget endpoints.

Use:

``` text
transactionAPI.js
```

for transaction endpoints.

Use:

``` text
reportAPI.js
```

for report endpoints.

Use:

``` text
notificationAPI.js
```

for notification endpoints.

Use:

``` text
collaborationAPI.js
```

for collaboration/invitation endpoints.

This keeps endpoint knowledge localized.

------------------------------------------------------------------------

# 50. Component Ownership Rules

A component should generally own:

``` text
Presentation
Local interaction
Local UI state
```

It should not become the owner of:

``` text
Global authentication state
Database behavior
Raw backend business rules
Shared API transport configuration
```

Those belong elsewhere in the architecture.

------------------------------------------------------------------------

# 51. Context Ownership Rules

A context should represent an application-level concern.

Good examples already present:

``` text
Auth
Budget
Socket
```

Avoid creating a new global context for every small piece of state.

If a value is only needed by one component tree, local component state
or a hook may be more appropriate.

------------------------------------------------------------------------

# 52. Service Ownership Rules

Services should encapsulate transport details.

For example, components should not need to know:

``` text
/api/budgets
```

or:

``` text
Authorization: Bearer ...
```

The service/client layers own those details.

This makes endpoint changes less invasive.

------------------------------------------------------------------------

# 53. Frontend Security Boundary

The browser is not a trusted authorization boundary.

The frontend can:

``` text
Hide UI
Disable controls
Store token
Display authenticated state
```

but the backend must remain responsible for enforcing:

``` text
Authentication
Authorization
Resource ownership
Role permissions
```

This is especially important for collaborative budgets.

------------------------------------------------------------------------

# 54. Frontend Configuration

The frontend environment configuration currently supports:

``` env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

The API and socket endpoints are therefore independently configurable.

Conceptually:

``` text
REACT_APP_API_URL
       │
       ▼
Axios

REACT_APP_SOCKET_URL
       │
       ▼
Socket.IO
```

------------------------------------------------------------------------

# 55. Frontend Build Boundary

The frontend is built with Create React App / `react-scripts`.

The package scripts include:

``` text
npm start
npm run build
npm test
npm run eject
```

The production frontend build is generated with:

``` bash
npm run build
```

Environment variables used by the frontend must therefore be available
at build/runtime according to the application's deployment mechanism.

------------------------------------------------------------------------

# 56. Frontend Architecture Strengths

The current structure provides:

-   Domain-oriented component directories
-   Explicit application contexts
-   Reusable hooks
-   Centralized Axios configuration
-   Domain-specific API modules
-   Dedicated Socket.IO service
-   Separate page and component layers
-   Shared UI components
-   Centralized authentication-expiration handling

These boundaries reduce the need for individual components to understand
infrastructure details.

------------------------------------------------------------------------

# 57. Frontend Architecture Risks / Verification Items

The supplied source does not establish:

-   A formal frontend state-management library beyond React
    contexts/hooks
-   A centralized global error store
-   A generated API client
-   An OpenAPI-generated TypeScript contract
-   A formal client-side cache library
-   A complete frontend test architecture
-   A complete accessibility compliance process

These should not be represented as existing capabilities without
additional source evidence.

------------------------------------------------------------------------

# 58. Recommended Frontend Change Workflow

When implementing a feature:

### Step 1 --- Identify the page

Find the route-level screen.

### Step 2 --- Identify feature components

Find the relevant component directory.

### Step 3 --- Identify state ownership

Check:

``` text
context/
hooks/
```

### Step 4 --- Identify transport

Check:

``` text
services/
```

### Step 5 --- Identify real-time behavior

Check:

``` text
SocketContext
services/socket.js
```

### Step 6 --- Check backend contract

Follow the corresponding backend route/controller/service.

### Step 7 --- Update tests

Add or update the appropriate frontend tests where coverage exists.

------------------------------------------------------------------------

# 59. Frontend Debugging Workflow

When a UI feature is broken, debug from the outside inward:

``` text
1. Is the page rendered?
        │
        ▼
2. Is the component receiving state?
        │
        ▼
3. Is the context/hook state correct?
        │
        ▼
4. Is the API service called?
        │
        ▼
5. Is Axios sending the expected request?
        │
        ▼
6. Is the backend returning the expected response?
        │
        ▼
7. If real-time: is Socket.IO connected/event received?
```

This prevents immediately changing UI code when the actual failure is in
the API or authentication layer.

------------------------------------------------------------------------

# 60. Frontend Architecture Summary

The frontend can be summarized as:

``` text
                    React Application
                           │
                     ┌─────┴─────┐
                     ▼           ▼
                  Routing      Providers
                     │           │
                     ▼           ├── Auth
                   Pages         ├── Budget
                     │           └── Socket
                     ▼
                Components
                     │
             ┌───────┴────────┐
             ▼                ▼
          Hooks            Services
             │                │
             └───────┬────────┘
                     ▼
             ┌───────┴────────┐
             ▼                ▼
           Axios          Socket.IO
             │                │
             ▼                ▼
          REST API      Real-time API
```

The primary architectural rule is:

> **Pages compose screens, components render features, contexts own
> shared application state, hooks expose reusable client behavior, and
> services own transport details.**

------------------------------------------------------------------------

# 61. Next Part

**Part 7 --- Backend Architecture**

The next document will map the backend in implementation depth:

-   Express application lifecycle
-   Route architecture
-   Middleware order
-   Controller responsibilities
-   Service-layer responsibilities
-   Model/data-access boundaries
-   Authentication middleware
-   Validation
-   Error handling
-   Environment/configuration
-   Database access
-   Socket server integration
-   Backend request lifecycle
-   Authorization boundaries
-   Backend testing architecture
-   Production-oriented backend rules
