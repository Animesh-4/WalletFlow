# WalletFlow --- Architecture & Codebase Conventions

## Part 18 --- Engineering Structure, Responsibilities & Extension Rules

This document defines how engineers should understand and extend the
WalletFlow codebase based on the supplied repository structure and
implementation.

The project uses a layered architecture across:

``` text
Frontend
Backend
Database
Real-time infrastructure
Configuration
Tests
```

The primary engineering principle is:

> **Keep responsibilities separated by layer, keep domain rules in
> backend services, keep persistence concerns in models/database code,
> and keep client-side code focused on presentation, state, and API
> interaction.**

Where the supplied source does not establish a strict convention, this
document identifies the practice as a recommended convention rather than
an existing hard requirement.

------------------------------------------------------------------------

# 1. Repository Architecture

The repository is organized into:

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

The frontend contains the React application and supporting:

``` text
components/
context/
hooks/
pages/
services/
```

------------------------------------------------------------------------

# 2. Backend Layering

The backend follows the general flow:

``` text
HTTP request
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
Model / Database
```

This separation should be preserved when adding new features.

------------------------------------------------------------------------

# 3. Routes

Routes define the HTTP interface.

Their responsibilities should remain focused on:

``` text
HTTP method
URL
Middleware
Controller
```

A route should not contain substantial business logic.

Conceptually:

``` js
router.post(
  "/",
  authMiddleware,
  controller.create
);
```

------------------------------------------------------------------------

# 4. Middleware

Middleware handles cross-cutting request concerns.

Examples include:

``` text
Authentication
Authorization-related request context
Validation
Error handling
```

Authentication middleware establishes the authenticated identity before
protected controllers execute.

------------------------------------------------------------------------

# 5. Controllers

Controllers are the HTTP boundary.

They should primarily:

``` text
Read request
Validate/normalize request input
Call service
Return response
Pass unexpected errors to error middleware
```

The existing authentication controllers demonstrate the pattern of
calling services inside `try/catch` and forwarding errors through
`next(error)`. fileciteturn6file8L893-L984

------------------------------------------------------------------------

# 6. Controllers Should Not Own Domain Rules

Avoid placing substantial business rules directly inside controllers.

Prefer:

``` text
Controller
    │
    ▼
Service
    │
    ▼
Business rule
```

rather than:

``` text
Controller
    │
    ├── database query
    ├── role logic
    ├── calculations
    └── response
```

This keeps business logic reusable and testable.

------------------------------------------------------------------------

# 7. Services

Services contain domain/application logic.

Examples include:

``` text
authService
budgetService
transactionService
notificationService
reportService
invitationService
```

Services are where important rules should live, such as:

``` text
Budget role permissions
Ownership checks
Financial calculations
Password operations
Invitation acceptance
```

------------------------------------------------------------------------

# 8. Authorization in Services

Authorization-sensitive business operations should remain server-side.

The budget service explicitly evaluates roles and allowed operations.

For example, the budget update logic distinguishes:

``` text
owner
editor
viewer
```

and rejects unauthorized changes. fileciteturn6file6L733-L797

This pattern should be preserved for future domain operations.

------------------------------------------------------------------------

# 9. Models

Models represent persistence/domain data access.

The backend uses:

``` text
Drizzle ORM
PostgreSQL / Neon
```

Models should provide the persistence boundary used by services.

Avoid making controllers directly responsible for raw database access
when an existing model/service abstraction already exists.

------------------------------------------------------------------------

# 10. Database Layer

The database layer contains:

``` text
Schema
Database initialization
Seed logic
Models
```

The configuration initializes the Neon database connection and exposes
the Drizzle database instance. fileciteturn5file7L987-L1022

------------------------------------------------------------------------

# 11. Database Schema Changes

When adding a database-backed feature:

``` text
1. Update schema
2. Update model
3. Update service
4. Update controller/route
5. Update tests
6. Synchronize local database
7. Verify existing behavior
```

Do not introduce application code that depends on a schema change
without updating the schema definition.

------------------------------------------------------------------------

# 12. Configuration

Configuration is centralized under:

``` text
src/config/
```

Relevant areas include:

``` text
env
database
jwt
socket
```

Avoid scattering direct environment access throughout business logic.

Prefer:

``` text
config
   │
   ▼
service/module
```

rather than repeatedly reading raw environment variables.

------------------------------------------------------------------------

# 13. Environment Variable Ownership

Server-side secrets belong in backend configuration:

``` text
DATABASE_URL
JWT_SECRET
REDIS_URL
EMAIL_PASS
```

Frontend-visible configuration uses:

``` text
REACT_APP_*
```

The frontend must not receive backend secrets.

------------------------------------------------------------------------

# 14. JWT Configuration

JWT configuration belongs in:

``` text
config/jwt.js
```

rather than being duplicated across authentication modules.

The same secret/configuration model is used by:

``` text
REST authentication
Socket.IO authentication
```

This keeps identity verification consistent.

------------------------------------------------------------------------

# 15. Socket Architecture

Socket-related behavior is separated into:

``` text
socket/
```

The Socket.IO server performs:

``` text
Connection authentication
User identity assignment
Room membership
Real-time events
```

The frontend has a corresponding socket service/context architecture.

------------------------------------------------------------------------

# 16. Socket Event Conventions

Existing real-time concepts include:

``` text
joinBudget
leaveBudget
budgetUpdated
transactionUpdated
liveUsers
```

When introducing a new event:

``` text
Define event name
Define sender
Define receiver
Define payload
Define authorization
Define lifecycle
Update backend
Update frontend
Update documentation
```

Do not silently introduce undocumented socket contracts.

------------------------------------------------------------------------

# 17. Socket Payload Stability

Treat socket payloads as API contracts.

For every event document:

``` text
Event name
Direction
Payload shape
Trigger
Authorization
Expected client behavior
```

Changes to payload structure should be coordinated between backend and
frontend.

------------------------------------------------------------------------

# 18. Frontend Architecture

The frontend is organized around:

``` text
Pages
Components
Contexts
Hooks
Services
```

A useful flow is:

``` text
Page
 │
 ▼
Component
 │
 ▼
Context/Hook
 │
 ▼
API Service
 │
 ▼
Backend
```

Socket-driven updates may enter through:

``` text
Socket service
     │
     ▼
SocketContext
     │
     ▼
React state
```

------------------------------------------------------------------------

# 19. Pages

Pages represent larger application screens.

Examples include flows around:

``` text
Authentication
Dashboard
Budget
Transactions
Reports
Notifications
```

Pages should compose reusable components rather than becoming large
repositories of business logic.

------------------------------------------------------------------------

# 20. Components

Components should focus on:

``` text
Presentation
User interaction
Local UI state
Composition
```

Avoid putting:

``` text
Database logic
Authorization decisions
Direct environment access
```

inside presentation components.

------------------------------------------------------------------------

# 21. Contexts

The frontend uses contexts for application-level state.

Important contexts include:

``` text
AuthContext
BudgetContext
SocketContext
```

Contexts should own shared state and coordination rather than
duplicating the same state logic across unrelated components.

------------------------------------------------------------------------

# 22. AuthContext

Authentication context is responsible for session state such as:

``` text
Current user
Token
Loading state
Login
Registration
Logout
Session restoration
```

The current implementation persists the token and validates the session
through the profile endpoint during application initialization.
fileciteturn6file3L383-L404

------------------------------------------------------------------------

# 23. BudgetContext

Budget-related shared state should remain centralized where multiple
components depend on:

``` text
Current budget
Budget list
Members
Transactions
Budget updates
```

The exact state responsibilities should follow the current
implementation rather than duplicating API state in each component.

------------------------------------------------------------------------

# 24. SocketContext

SocketContext provides application-level access to the Socket.IO
connection.

Its responsibilities include coordinating:

``` text
Connection
Disconnection
Event listeners
Budget-room participation
Real-time state updates
```

Components should consume the context rather than creating independent
socket connections unless there is a strong architectural reason.

------------------------------------------------------------------------

# 25. Hooks

Hooks should encapsulate reusable React behavior.

Examples:

``` text
useAuth
useSocket
```

A hook should provide a clear abstraction over the underlying
context/service.

Prefer:

``` js
const { user } = useAuth();
```

over repeatedly reaching into implementation-specific context details.

------------------------------------------------------------------------

# 26. Frontend Services

Frontend services provide the API boundary.

The shared Axios client establishes:

``` text
Base URL
Authorization header
401 handling
```

The API service layer should keep HTTP details out of presentation
components. fileciteturn6file5L608-L647

------------------------------------------------------------------------

# 27. API Client Convention

Prefer:

``` text
Component
   │
   ▼
Hook/Context
   │
   ▼
API service
   │
   ▼
Axios client
```

rather than:

``` text
Component
   │
   ▼
axios.get(...)
```

directly in every component.

This centralizes API behavior.

------------------------------------------------------------------------

# 28. HTTP Error Handling

The frontend API layer should preserve meaningful backend errors.

The shared Axios client already handles `401` by clearing the token and
redirecting the user to login. fileciteturn6file5L634-L647

Do not create competing authentication interceptors without
understanding this behavior.

------------------------------------------------------------------------

# 29. Error Handling Convention

Backend errors should flow through:

``` text
Service
   │
   ▼
Controller catch
   │
   ▼
next(error)
   │
   ▼
Central error handler
```

Frontend errors should flow through:

``` text
API service
   │
   ▼
Context/hook
   │
   ▼
Component
   │
   ▼
User-facing state
```

------------------------------------------------------------------------

# 30. Validation Convention

Validation should occur near the boundary where untrusted data enters
the system.

For backend requests:

``` text
HTTP request
   │
   ▼
Validation
   │
   ▼
Service
```

Do not rely exclusively on frontend validation.

------------------------------------------------------------------------

# 31. Naming Convention

Follow the repository's existing naming style.

Use clear domain-oriented names:

``` text
authService
budgetService
transactionService
notificationService
```

and corresponding:

``` text
Controller
Model
Route
```

Avoid ambiguous names such as:

``` text
helper2
dataManager
misc
commonThing
```

unless the repository already has an established utility with that role.

------------------------------------------------------------------------

# 32. File Naming

Keep file names aligned with their responsibility.

Examples:

``` text
authService.js
budgetService.js
transactionController.js
budgetRoutes.js
auth.test.js
```

Test files should clearly identify the domain they cover.

------------------------------------------------------------------------

# 33. Function Naming

Prefer names that describe behavior:

``` text
createBudget
updateBudget
deleteBudget
getTransactions
markNotificationAsRead
```

Avoid generic names such as:

``` text
process
handleData
doThing
```

unless their context is unambiguous.

------------------------------------------------------------------------

# 34. Route Naming

Use resource-oriented routes.

Examples from the architecture include:

``` text
/auth
/budgets
/transactions
/notifications
```

HTTP methods should communicate the operation:

``` text
GET
POST
PUT/PATCH
DELETE
```

Do not create a new route style for one feature without a strong reason.

------------------------------------------------------------------------

# 35. Authentication Route Convention

Authentication operations belong under the authentication route
namespace.

Examples include:

``` text
register
login
profile
forgot-password
reset-password
```

Authentication concerns should not be mixed into unrelated resource
routes.

------------------------------------------------------------------------

# 36. Resource Authorization Convention

For a protected resource:

``` text
Route
  │
  ▼
Authentication middleware
  │
  ▼
Controller
  │
  ▼
Service ownership/role check
```

Do not omit the service-level authorization check merely because
authentication middleware is present.

------------------------------------------------------------------------

# 37. Database Query Convention

Prefer existing model/service abstractions for database access.

Do not duplicate complex queries across multiple controllers.

If the same domain query appears repeatedly:

``` text
Identify shared domain behavior
       │
       ▼
Move into service/model abstraction
```

This reduces authorization inconsistencies.

------------------------------------------------------------------------

# 38. Transactional Behavior

When an operation changes multiple related records, consider whether the
operation needs database transaction semantics.

Examples include:

``` text
Budget + membership changes
Invitation acceptance + membership creation
Complex financial mutations
```

The supplied source should be checked before claiming that each
operation currently uses database transactions.

------------------------------------------------------------------------

# 39. Financial Logic Convention

Financial calculations should be:

``` text
Deterministic
Testable
Centralized
Independent of UI formatting
```

Do not perform authoritative financial calculations only in React
components.

The backend should remain the source of truth for persisted financial
state.

------------------------------------------------------------------------

# 40. Date and Time Convention

Date-sensitive behavior should use a consistent representation across:

``` text
Database
Backend
API
Frontend
```

When introducing a new date field:

``` text
Define storage type
Define API representation
Define timezone expectation
Define frontend formatting
Add boundary tests
```

Do not introduce an implicit timezone assumption.

------------------------------------------------------------------------

# 41. Report Logic

Reports should remain a domain/service responsibility.

The frontend should request report data and render it.

Prefer:

``` text
Report service
   │
   ▼
API
   │
   ▼
React report UI
```

rather than reconstructing authoritative financial aggregations entirely
in the browser.

------------------------------------------------------------------------

# 42. Notification Logic

Notification creation and retrieval belong to the notification domain.

Keep:

``` text
Notification persistence
Notification ownership
Read/unread state
```

inside the appropriate backend service/controller boundary.

The frontend should consume notification state through the API/context
architecture.

------------------------------------------------------------------------

# 43. Collaboration Logic

Collaboration combines:

``` text
Persistent membership
Real-time presence
Authorization
```

Do not treat Socket.IO room membership as a replacement for database
membership.

Persistent authorization should remain database-backed.

------------------------------------------------------------------------

# 44. Adding a New Backend Feature

Recommended sequence:

``` text
1. Define domain behavior
2. Define data requirements
3. Update schema if necessary
4. Add model/data access
5. Add service
6. Add controller
7. Add route
8. Add middleware/validation
9. Add tests
10. Add frontend API service
11. Add context/hook if shared state is needed
12. Add UI
13. Add socket behavior if required
14. Update documentation
```

------------------------------------------------------------------------

# 45. Adding a New Frontend Feature

Recommended sequence:

``` text
1. Define user workflow
2. Identify API contract
3. Add API service
4. Add context/hook if shared state is required
5. Build page/component
6. Add loading/error states
7. Add role-aware UI
8. Add socket listeners if required
9. Test end-to-end behavior
10. Update documentation
```

------------------------------------------------------------------------

# 46. Adding a New API Endpoint

Checklist:

``` text
[ ] Route defined
[ ] Authentication requirement defined
[ ] Input validation defined
[ ] Controller added
[ ] Service method added
[ ] Authorization defined
[ ] Error behavior defined
[ ] Test added
[ ] Frontend API service updated if needed
[ ] API documentation updated
```

------------------------------------------------------------------------

# 47. Adding a New Database Entity

Checklist:

``` text
[ ] Schema defined
[ ] Relationships defined
[ ] Model/data access added
[ ] Service added
[ ] Authorization reviewed
[ ] Seed/test data considered
[ ] Tests added
[ ] Local schema synchronized
[ ] Production migration strategy reviewed
```

------------------------------------------------------------------------

# 48. Adding a New Socket Event

Checklist:

``` text
[ ] Event name defined
[ ] Sender defined
[ ] Receiver defined
[ ] Authentication requirement defined
[ ] Authorization requirement defined
[ ] Payload schema defined
[ ] Backend handler added
[ ] Frontend listener added
[ ] Reconnection behavior reviewed
[ ] Multi-instance behavior reviewed
[ ] Documentation updated
```

------------------------------------------------------------------------

# 49. Refactoring Rule

Prefer small, behavior-preserving refactors.

Before refactoring:

``` text
Understand current behavior
       │
       ▼
Run relevant tests
       │
       ▼
Refactor
       │
       ▼
Run tests again
       │
       ▼
Verify affected user flow
```

Do not combine large architectural refactors with unrelated product
changes unless necessary.

------------------------------------------------------------------------

# 50. Dependency Boundaries

Keep dependencies flowing in predictable directions.

Preferred:

``` text
Route
  ↓
Controller
  ↓
Service
  ↓
Model/Database
```

Avoid circular dependencies such as:

``` text
Service A
  ↕
Controller B
```

Controllers should not become shared domain libraries.

------------------------------------------------------------------------

# 51. Utility Modules

Utilities should contain genuinely reusable, cross-domain behavior.

Avoid putting domain-specific business rules into a generic:

``` text
utils/
```

folder merely to avoid choosing the correct service.

A utility should have a clear, narrow responsibility.

------------------------------------------------------------------------

# 52. Comments

Comments should explain:

``` text
Why
```

rather than merely restating:

``` text
What
```

Prefer:

``` text
// Preserve the same token behavior for existing clients.
```

over:

``` text
// Set token.
```

Avoid comments that become incorrect after implementation changes.

------------------------------------------------------------------------

# 53. Logging in Code

Temporary debugging logs should be removed before production.

Permanent logs should be:

``` text
Intentional
Safe
Useful
Structured where possible
```

Never add debug output containing:

``` text
JWT
Password
Secret
Reset token
Invitation token
```

------------------------------------------------------------------------

# 54. Error Messages

Backend errors should be:

``` text
Actionable for developers
Safe for clients
Consistent
```

Do not expose internal implementation details merely because they are
available in the caught exception.

------------------------------------------------------------------------

# 55. API Contract Changes

When changing an API:

``` text
Identify consumers
       │
       ▼
Update backend
       │
       ▼
Update frontend
       │
       ▼
Update tests
       │
       ▼
Update documentation
```

Avoid silently changing:

``` text
Field names
Status codes
Payload shapes
Error structures
```

without reviewing all consumers.

------------------------------------------------------------------------

# 56. Socket Contract Changes

Socket contracts require the same discipline as HTTP APIs.

If changing:

``` text
budgetUpdated
```

for example, verify:

``` text
Backend emitter
Frontend listener
Payload consumers
Multi-instance delivery
Documentation
```

------------------------------------------------------------------------

# 57. Backward Compatibility

Prefer backward-compatible changes when multiple application versions
may coexist.

Examples:

``` text
Add optional response field
```

is generally safer than:

``` text
Rename existing required field
```

Database and socket changes should follow the same compatibility
principle.

------------------------------------------------------------------------

# 58. Code Review Expectations

Reviewers should inspect:

``` text
Correctness
Authorization
Validation
Error handling
Database behavior
API compatibility
Real-time behavior
Tests
Configuration
Security
```

Do not approve a feature solely because its happy-path UI works.

------------------------------------------------------------------------

# 59. Security Review in Code Review

For every new protected operation ask:

``` text
Who can call it?
Who can access the resource?
Who can modify it?
Who can delete it?
What happens with an invalid token?
What happens with a valid but unauthorized user?
```

These questions should be answered before merging.

------------------------------------------------------------------------

# 60. Testing in Code Review

Every meaningful behavior change should have an appropriate verification
strategy.

Prefer:

``` text
Regression test
```

for previously broken behavior.

For new domain rules:

``` text
Positive case
Negative case
Authorization case
```

where relevant.

------------------------------------------------------------------------

# 61. Documentation in Code Review

Documentation should be updated when changes affect:

``` text
API
Database
Configuration
Socket events
Authentication
Deployment
Security
Developer workflow
```

The documentation set should remain synchronized with implementation.

------------------------------------------------------------------------

# 62. Codebase Navigation Strategy

When investigating an unfamiliar feature, trace it from the user-facing
boundary inward.

Recommended sequence:

``` text
Page/component
      │
      ▼
Context/hook
      │
      ▼
API service
      │
      ▼
Backend route
      │
      ▼
Controller
      │
      ▼
Service
      │
      ▼
Model/database
```

For real-time behavior:

``` text
Component
      │
      ▼
SocketContext
      │
      ▼
Socket service
      │
      ▼
Socket handler
      │
      ▼
Service/database
```

------------------------------------------------------------------------

# 63. Debugging Strategy

When a feature fails, identify the boundary first.

Example:

``` text
UI incorrect
   │
   ▼
Is state correct?
   │
   ▼
Was API called?
   │
   ▼
Was API response correct?
   │
   ▼
Was backend service correct?
   │
   ▼
Was database state correct?
```

This avoids changing unrelated layers.

------------------------------------------------------------------------

# 64. Change Ownership

A useful rule is:

``` text
UI problem
→ frontend

API contract problem
→ frontend + backend

Business-rule problem
→ backend service

Persistence problem
→ model/database

Authentication problem
→ auth middleware/service/config

Real-time problem
→ socket layer + frontend listener

Deployment problem
→ configuration/infrastructure
```

Many issues cross boundaries, but identifying the first incorrect
boundary speeds diagnosis.

------------------------------------------------------------------------

# 65. Architecture Summary

``` text
                         WalletFlow
                             │
             ┌───────────────┴───────────────┐
             ▼                               ▼
         Frontend                         Backend
             │                               │
     ┌───────┼────────┐              ┌───────┼────────┐
     ▼       ▼        ▼              ▼       ▼        ▼
  Pages  Contexts  Services       Routes  Controllers Services
     │       │        │                         │        │
     └───────┴────────┘                         ▼        ▼
             │                              Models   Socket
             │                                 │        │
             └──────────── API ────────────────┘        │
                                                       ▼
                                                   Real-time

                              Backend
                                 │
                                 ▼
                           PostgreSQL/Neon
```

The central engineering principle is:

> **Keep each layer responsible for its own concern, preserve backend
> authorization as the security boundary, use shared abstractions
> instead of duplicated logic, and treat APIs and socket events as
> explicit contracts.**

------------------------------------------------------------------------

# 66. Next Part

**Part 19 --- Troubleshooting & Engineering Runbooks**

The next document will consolidate practical diagnostic procedures:

-   Application startup failures
-   Environment problems
-   Database failures
-   Authentication failures
-   Authorization failures
-   API failures
-   Frontend failures
-   Socket.IO failures
-   Redis failures
-   Email failures
-   Password-reset failures
-   Invitation failures
-   Notification failures
-   Transaction/budget issues
-   Deployment failures
-   Data-integrity investigation
-   Common symptoms → likely causes → checks → fixes
