# WalletFlow --- Core Concepts

## Part 5 --- Domain & Application Concepts

This document defines the concepts an engineer must understand before
changing WalletFlow.

It focuses on the terminology and relationships represented by the
supplied frontend and backend repositories. It does **not** invent
business rules that are not established by the source.

------------------------------------------------------------------------

# 1. Conceptual Model

WalletFlow is organized around a small number of connected concepts:

``` text
User
 │
 ├───────────────┐
 │               │
 ▼               ▼
Budgets       Transactions
 │               │
 │               ▼
 │           Categories
 │
 ├── Membership / Roles
 │
 ├── Invitations
 │
 └── Budget History
 │
 └── Collaboration
        │
        ▼
   Real-time events

User
 │
 └── Notifications

Transactions
 │
 ▼
Reports
```

At the center is the **User**, but the main financial domain is the
**Budget** and its associated **Transactions**.

------------------------------------------------------------------------

# 2. User

A user represents an authenticated WalletFlow account.

The user participates in several parts of the system:

``` text
User
 ├── Authentication
 ├── Budgets
 ├── Transactions
 ├── Budget memberships
 ├── Invitations
 ├── Notifications
 └── Profile
```

The backend contains:

``` text
models/User.js
services/userService.js
controllers/userController.js
routes/user.js
```

The frontend contains:

``` text
ProfilePage.js
userAPI.js
AuthContext.js
```

------------------------------------------------------------------------

# 3. User Identity

WalletFlow identifies authenticated users through JWTs.

The authentication lifecycle is:

``` text
Credentials
    │
    ▼
Authentication service
    │
    ▼
JWT
    │
    ├───────────────┐
    ▼               ▼
REST API         Socket.IO
```

On REST requests, the backend authentication middleware reads the Bearer
token, verifies it, and attaches the decoded payload to:

``` text
req.user
```

The supplied middleware explicitly performs this operation.
fileciteturn5file2L299-L334

------------------------------------------------------------------------

# 4. JWT as an Identity Artifact

A JWT is not the user's profile itself.

It is an authentication artifact that allows the backend to identify the
user associated with a request.

Conceptually:

``` text
JWT
 │
 ▼
Verified payload
 │
 ▼
User identity
```

The frontend persists the token in browser storage and the shared Axios
client attaches it to API requests.

The frontend API client reads:

``` text
localStorage["token"]
```

and sends:

``` text
Authorization: Bearer <token>
```

when a token exists. fileciteturn5file0L47-L55

------------------------------------------------------------------------

# 5. Authentication vs Authorization

These are separate concepts.

## Authentication

Answers:

> Who is this user?

WalletFlow uses JWT verification.

## Authorization

Answers:

> What is this user allowed to do?

Authorization depends on the resource and, for shared budgets, the
user's relationship with that budget.

The source establishes budget membership and roles, but a complete
permission matrix should be derived from the budget service/controller
implementation before being treated as a formal authorization
specification.

------------------------------------------------------------------------

# 6. Budget

A budget is the primary collaborative financial container.

It connects:

``` text
Budget
 ├── Owner
 ├── Members
 ├── Transactions
 ├── History
 └── Invitations
```

The frontend has a dedicated budget state context:

``` text
BudgetContext.js
```

and budget API module:

``` text
budgetAPI.js
```

The backend has:

``` text
Budget.js
budgetService.js
budgetController.js
budget.js
```

------------------------------------------------------------------------

# 7. Budget Lifecycle

The repository supports budget operations including:

``` text
Create
Read
Update
Delete
View history
```

The frontend API service explicitly provides:

``` text
getAllBudgets
getBudgetById
createBudget
updateBudget
deleteBudget
getBudgetHistory
```

mapped to the `/budgets` API hierarchy. fileciteturn5file6L780-L842

A simplified lifecycle is:

``` text
Create
  │
  ▼
Active budget
  │
  ├── Update
  ├── Add/remove collaborators
  ├── Add/update/delete transactions
  └── Record history
  │
  ▼
Delete
```

The exact lifecycle/status model should not be expanded beyond the
implemented operations without inspecting the complete budget service
and schema.

------------------------------------------------------------------------

# 8. Budget Ownership

A budget has an ownership relationship with a user.

Budget ownership is different from simply being a member of a budget.

The schema contains a dedicated:

``` text
budget_users
```

relationship with roles including:

``` text
owner
editor
viewer
```

This means budget access is modeled separately from the user record.

------------------------------------------------------------------------

# 9. Budget Membership

A budget membership connects:

``` text
User ↔ Budget
```

and associates a role with that relationship.

Conceptually:

``` text
User
  │
  ▼
BudgetUser
  │
  ├── budget_id
  ├── user_id
  └── role
  │
  ▼
Budget
```

This is the core collaboration relationship.

It allows multiple users to participate in the same budget without
making the budget itself belong to multiple owners.

------------------------------------------------------------------------

# 10. Budget Roles

The repository defines budget roles:

``` text
owner
editor
viewer
```

These roles should be treated as domain concepts.

However:

> The supplied source does not provide enough evidence in this document
> set to claim a complete endpoint-by-endpoint permission matrix for
> each role.

Before changing authorization, inspect:

``` text
budgetController.js
budgetService.js
BudgetUser.js
routes/budget.js
```

and document the resulting permission matrix separately.

------------------------------------------------------------------------

# 11. Collaboration

Collaboration is the ability for multiple users to participate in a
budget.

It has both a persistent and real-time dimension.

## Persistent collaboration

Stored through:

``` text
budget_users
```

and invitations.

## Real-time collaboration

Uses:

``` text
Socket.IO
```

with budget rooms and user-presence events.

Therefore:

``` text
Collaboration
 ├── Membership
 ├── Invitations
 ├── Roles
 └── Real-time events
```

------------------------------------------------------------------------

# 12. Invitations

An invitation represents an attempt to add another user to a budget.

The frontend provides:

``` text
inviteUser()
acceptInvitation()
```

The collaboration API maps invitation acceptance to:

``` text
POST /invitations/accept
```

The backend has:

``` text
Invitation.js
invitationService.js
invitationController.js
routes/invitation.js
```

The invitation controller receives a token and authenticated user ID
before delegating to the invitation service.
fileciteturn5file9L1192-L1213

------------------------------------------------------------------------

# 13. Invitation Concept

Conceptually:

``` text
Existing User
     │
     ▼
Invite
     │
     ├── Budget
     ├── Invitee
     ├── Role
     └── Token
          │
          ▼
       Acceptance
          │
          ▼
   Budget membership
```

The invitation is therefore a temporary collaboration mechanism rather
than the membership record itself.

------------------------------------------------------------------------

# 14. Transaction

A transaction represents a financial record associated with the
application's budgeting domain.

The frontend provides:

``` text
TransactionForm
TransactionItem
TransactionList
transactionAPI.js
```

The backend provides:

``` text
Transaction.js
transactionService.js
transactionController.js
routes/transaction.js
```

The transaction API supports operations including:

``` text
Get transactions
Create transaction
Update transaction
```

The frontend implementation maps these operations to the `/transactions`
API hierarchy. fileciteturn5file4L625-L652

------------------------------------------------------------------------

# 15. Transaction Relationships

A transaction can be understood in relation to:

``` text
User
Budget
Category
```

Conceptually:

``` text
User
 │
 └───────┐
         ▼
      Transaction
         │
    ┌────┴────┐
    ▼         ▼
 Budget    Category
```

This allows transactions to participate in both user-level financial
activity and budget-level collaboration/reporting.

------------------------------------------------------------------------

# 16. Transaction Lifecycle

The currently exposed frontend API establishes:

``` text
Create
Read
Update
```

The repository also contains transaction domain infrastructure for
broader transaction management.

A typical operation is:

``` text
Transaction Form
      │
      ▼
transactionAPI
      │
      ▼
POST /transactions
      │
      ▼
transactionController
      │
      ▼
transactionService
      │
      ▼
Transaction model
      │
      ▼
PostgreSQL
```

------------------------------------------------------------------------

# 17. Transaction Status

The backend schema contains transaction-status concepts.

These should be treated as database/domain enums rather than arbitrary
frontend strings.

Before implementing logic that depends on a specific status transition,
inspect the schema and transaction service together.

The source set does not establish a complete state-transition
specification in this document.

------------------------------------------------------------------------

# 18. Category

Categories classify transactions.

The backend has:

``` text
Category.js
categoryController.js
routes/category.js
```

The frontend has:

``` text
CategoryPicker.js
categoryAPI.js
```

The category API returns category names.

The backend controller obtains categories from the model and maps them
to names before returning the response.
fileciteturn5file9L1173-L1189

------------------------------------------------------------------------

# 19. Default Categories

The seed mechanism initializes default categories.

The seed uses conflict-safe insertion so an existing category with the
same name is not duplicated. fileciteturn5file2L276-L296

The current seed data includes both expense-oriented and income-oriented
categories.

Because the seed file is the source of truth, new documentation should
not assume a category list that differs from the current seed
implementation.

------------------------------------------------------------------------

# 20. Budget History

Budgets have a history concept.

The frontend exposes:

``` text
getBudgetHistory(budgetId)
```

through:

``` text
GET /budgets/:budgetId/history
```

The backend contains:

``` text
BudgetHistory.js
```

and the budget controller retrieves history through the model.
fileciteturn5file9L1161-L1170

Conceptually:

``` text
Budget
 │
 └── Budget History
       ├── historical event/change
       ├── actor/context
       └── timestamp/data
```

The exact event taxonomy should be documented from the full history
model/service rather than inferred.

------------------------------------------------------------------------

# 21. Notification

A notification is user-scoped application information.

The backend model provides operations such as:

``` text
findByUserId
markAsRead
markAllAsRead
```

The controller always obtains the authenticated user ID when retrieving
or updating notifications.

For an individual notification, the model operation also receives the
user ID, preventing an unrelated user from marking another user's
notification as read through the same operation.
fileciteturn5file9L1216-L1249

------------------------------------------------------------------------

# 22. Notification Lifecycle

The frontend supports:

``` text
Fetch notifications
Mark one as read
Mark all as read
```

The lifecycle is:

``` text
Notification created
       │
       ▼
Unread
       │
       ├── Mark one as read
       │
       └── Mark all as read
              │
              ▼
            Read
```

The exact notification creation triggers should be documented from the
notification/invitation/budget services.

------------------------------------------------------------------------

# 23. Reports

Reports are derived financial information rather than primary
transaction records.

The frontend exposes:

``` text
getSpendingSummary(month, year)
getMonthlyReport(month, year)
```

through:

``` text
/reports/summary
/reports/monthly
```

fileciteturn5file3L484-L505

The backend reporting boundary is:

``` text
report.js
reportController.js
reportService.js
```

------------------------------------------------------------------------

# 24. Report Data Flow

A report can be conceptually represented as:

``` text
Transactions
     │
     ▼
Report Service
     │
     ├── Filter by period
     ├── Aggregate
     └── Format
     │
     ▼
Report API
     │
     ▼
Charts / Monthly Report UI
```

Reports therefore should not normally be treated as independent sources
of financial truth.

The underlying transaction data remains the primary financial record.

------------------------------------------------------------------------

# 25. Authentication State on the Frontend

The frontend has three related concepts:

``` text
Token
User
Authentication loading state
```

The `AuthContext` coordinates them.

A simplified state model is:

``` text
Application starts
      │
      ▼
Check stored token
      │
      ├── no token → unauthenticated
      │
      └── token
           │
           ▼
       Fetch profile
           │
       ┌───┴────┐
       ▼        ▼
     valid    invalid
       │        │
       ▼        ▼
authenticated  clear token
```

This distinction is important when modifying protected UI.

------------------------------------------------------------------------

# 26. Client-Side Token Persistence

The frontend uses browser `localStorage` for token persistence.

The central Axios client reads the token for every request rather than
requiring each API service to receive it manually.

This creates one client-side authentication transport boundary:

``` text
localStorage
    │
    ▼
Axios interceptor
    │
    ▼
Authorization header
```

fileciteturn5file0L47-L55

------------------------------------------------------------------------

# 27. Authentication Expiration

When the API returns HTTP `401`, the frontend Axios response interceptor
removes the stored token and redirects to:

``` text
/login
```

The current implementation explicitly performs this behavior.
fileciteturn5file0L61-L73

This means an expired/invalid session can reset authentication state
even if the user did not explicitly click Logout.

------------------------------------------------------------------------

# 28. Socket Connection

Socket.IO is an authenticated real-time channel.

The frontend's socket layer supports:

``` text
Join budget
Leave budget
Listen for budget updates
Listen for transaction updates
Listen for live users
```

The frontend socket service emits:

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

fileciteturn5file4L584-L623

------------------------------------------------------------------------

# 29. Budget Room

A budget room is a real-time grouping of socket connections associated
with a budget.

Conceptually:

``` text
Budget 123
    │
    ▼
Socket.IO room
    │
    ├── User A
    ├── User B
    └── User C
```

This allows events to be scoped to users collaborating on a particular
budget.

Room membership should not be confused with persistent budget
membership.

They are related but different concepts:

``` text
Database membership → durable authorization relationship
Socket room         → real-time communication grouping
```

------------------------------------------------------------------------

# 30. Live Users

The application exposes live-user functionality through Socket.IO.

The frontend listens for:

``` text
liveUsers
```

The backend currently keeps live-user state in process memory.

Therefore:

``` text
Socket connection
    │
    ▼
Backend process
    │
    ▼
in-memory live user state
```

This is a runtime presence concept, not durable user data.

For multiple backend instances, process-local presence does not
automatically become globally consistent.

------------------------------------------------------------------------

# 31. Redis

Redis is an optional infrastructure component.

The backend includes the Socket.IO Redis adapter.

Conceptually:

``` text
Backend instance A
       │
       ▼
     Redis
       ▲
       │
Backend instance B
```

This is intended to support cross-instance Socket.IO coordination.

However:

> Redis-backed Socket.IO messaging and Redis-backed application presence
> are separate concerns.

The current live-user implementation remains process-local unless
additional shared-state logic is introduced.

------------------------------------------------------------------------

# 32. Database

PostgreSQL is the persistent data store.

The backend uses:

``` text
Neon serverless Pool
        │
        ▼
Drizzle ORM
        │
        ▼
Application models
```

The database connection is initialized from:

``` text
DATABASE_URL
```

and the application fails startup if database initialization fails.
fileciteturn5file7L987-L1022

------------------------------------------------------------------------

# 33. Database Schema as Domain Contract

The schema defines more than tables.

It also defines:

-   Relationships
-   Foreign keys
-   Enums
-   Delete behavior
-   Data constraints

Therefore:

> A domain change that changes persistence should normally be evaluated
> at both the service/model level and the schema level.

------------------------------------------------------------------------

# 34. Core Persistence Entities

The repository contains models for:

``` text
User
Budget
BudgetUser
BudgetHistory
Transaction
Category
Invitation
Notification
```

These correspond to the principal persisted domain concepts.

The backend repository structure explicitly lists these model files.
fileciteturn5file7L935-L943

------------------------------------------------------------------------

# 35. User-to-Budget Relationship

The relationship can be represented as:

``` text
User
  │
  ├──────── owns ────────► Budget
  │
  └──────── member of ───► Budget
                              │
                              ▼
                         BudgetUser
```

This distinction is important:

-   Ownership is a domain relationship.
-   Membership is a collaboration relationship.
-   Role belongs to the membership relationship.

Do not collapse these into one generic "user owns budget" concept.

------------------------------------------------------------------------

# 36. Budget-to-Transaction Relationship

A budget can contain financial activity:

``` text
Budget
   │
   └── Transactions
           │
           └── Category
```

This is why budget operations and transaction operations are separate
API domains but still connected at the data layer.

------------------------------------------------------------------------

# 37. User-to-Transaction Relationship

Transactions are also associated with users.

This allows the application to distinguish:

``` text
Who created/owns the transaction
```

from:

``` text
Which budget contains the transaction
```

This distinction becomes important for collaboration and authorization.

------------------------------------------------------------------------

# 38. Transaction-to-Category Relationship

A category provides classification.

Conceptually:

``` text
Transaction
     │
     ▼
Category
```

This relationship supports reporting and transaction presentation.

The frontend category picker retrieves available categories from:

``` text
GET /categories
```

and the backend obtains those values from the category model.
fileciteturn5file3L393-L408

------------------------------------------------------------------------

# 39. User-to-Notification Relationship

Notifications are user-scoped:

``` text
User
 │
 └── Notifications
       ├── unread
       └── read
```

The backend explicitly queries notifications by:

``` text
req.user.id
```

and uses that same identity for read operations.
fileciteturn5file9L1220-L1248

This is an important ownership boundary.

------------------------------------------------------------------------

# 40. User-to-Invitation Relationship

Invitations involve user identities in different roles.

Conceptually:

``` text
Inviter
   │
   ▼
Invitation
   │
   ├── Budget
   │
   └── Invitee
```

Acceptance then turns the temporary invitation workflow into a budget
membership relationship.

------------------------------------------------------------------------

# 41. Persistent vs Runtime Concepts

Not everything in WalletFlow has the same lifecycle.

## Persistent concepts

Stored in PostgreSQL:

``` text
Users
Budgets
Transactions
Categories
Memberships
Invitations
Notifications
History
```

## Runtime concepts

Exist primarily during application execution:

``` text
React state
Socket connection
Socket room membership
Live-user presence
JWT in browser storage
```

This distinction matters when designing changes.

For example:

> A Socket.IO room is not a database membership record.

------------------------------------------------------------------------

# 42. Durable State vs Derived State

Another important distinction is:

``` text
Durable state
    │
    └── PostgreSQL

Derived/application state
    │
    ├── Report aggregates
    ├── React UI state
    └── Live-user presence
```

Reports can be regenerated from financial data.

UI state can be reconstructed from API responses.

Live presence can disappear when a process/socket disappears.

------------------------------------------------------------------------

# 43. Domain Boundary Summary

  Concept                  Primary source of truth
  ------------------------ ----------------------------------
  User identity            PostgreSQL + JWT
  Authentication session   JWT + frontend token storage
  Budget                   PostgreSQL
  Budget membership        PostgreSQL
  Budget role              PostgreSQL membership
  Transaction              PostgreSQL
  Category                 PostgreSQL
  Invitation               PostgreSQL + invitation workflow
  Notification             PostgreSQL
  Budget history           PostgreSQL
  Reports                  Derived from financial data
  Socket connection        Runtime
  Budget room              Runtime
  Live users               Runtime/process memory

------------------------------------------------------------------------

# 44. Safe Change Principles

When modifying a domain concept, inspect all layers that represent it.

For example, changing **Budget** may require reviewing:

``` text
Frontend:
Budget components
BudgetContext
budgetAPI
SocketContext

Backend:
budget route
budget controller
budget service
Budget model
BudgetUser model
BudgetHistory model
schema.js
socket/budgetEvents.js
```

Changing only one layer can produce a partially updated feature.

------------------------------------------------------------------------

# 45. Concept-to-Code Matrix

  --------------------------------------------------------------------------------
  Concept                 Frontend                Backend
  ----------------------- ----------------------- --------------------------------
  User                    `AuthContext`,          `User`, `userService`,
                          `ProfilePage`,          `userController`, `user` route
                          `userAPI`               

  Authentication          Auth                    `authController`, `authService`,
                          components/context,     `auth` route, JWT middleware
                          `authAPI`, `api.js`     

  Budget                  `components/Budget`,    `Budget`, `budgetService`,
                          `BudgetContext`,        `budgetController`, `budget`
                          `budgetAPI`             route

  Membership              Collaboration           `BudgetUser`, budget/invitation
                          components/API          services

  Transaction             Transaction             `Transaction`, transaction
                          components/API          service/controller/route

  Category                `CategoryPicker`,       `Category`, category
                          `categoryAPI`           controller/route

  Invitation              Accept invitation page, Invitation
                          collaboration API       model/service/controller/route

  Notification            Notifications list/API  Notification
                                                  model/controller/route

  Reports                 Reports components/API  Report service/controller/route

  Real-time               SocketContext/socket    socket handler/events/manager
                          service                 
  --------------------------------------------------------------------------------

------------------------------------------------------------------------

# 46. Engineering Vocabulary

The following terms should be used consistently in future WalletFlow
documentation.

### User

An authenticated application account.

### Budget

A financial/collaborative container.

### Budget membership

The persistent relationship between a user and a budget.

### Budget role

The role associated with a user's budget membership.

### Transaction

A financial record associated with the budgeting domain.

### Category

A classification used by transactions.

### Invitation

A temporary mechanism for adding a user to a budget.

### Notification

User-scoped application information with read state.

### Budget history

Historical budget-related records exposed through the budget history
API.

### Socket room

A runtime Socket.IO communication grouping.

### Live user

A user represented as currently connected/present in the real-time
system.

------------------------------------------------------------------------

# 47. Important Distinctions

Engineers should avoid these common conceptual mistakes:

``` text
User ≠ JWT
Budget membership ≠ Socket room
Invitation ≠ Membership
Transaction ≠ Report
Category ≠ Transaction
Authentication ≠ Authorization
Persistent state ≠ Runtime state
Redis adapter ≠ Presence database
```

These distinctions become especially important when changing
collaboration or real-time behavior.

------------------------------------------------------------------------

# 48. Core Concepts Summary

The simplest mental model for WalletFlow is:

``` text
USER
 │
 ├── authenticates with JWT
 │
 ├── owns/participates in BUDGETS
 │                    │
 │                    ├── MEMBERS
 │                    ├── INVITATIONS
 │                    ├── HISTORY
 │                    └── TRANSACTIONS
 │                              │
 │                              └── CATEGORIES
 │
 ├── receives NOTIFICATIONS
 │
 └── participates in REAL-TIME collaboration

TRANSACTIONS
     │
     ▼
  REPORTS
```

The durable domain lives primarily in PostgreSQL, while the browser and
Socket.IO layers provide runtime state and interaction around that
durable data.

------------------------------------------------------------------------

# 49. Next Part

**Part 6 --- Frontend Architecture**

The next document will go deeper into the React application itself:

-   Application bootstrap
-   Routing
-   Provider hierarchy
-   Authentication context
-   Budget context
-   Socket context
-   Hooks
-   API service architecture
-   Component/page boundaries
-   State lifecycle
-   API request lifecycle
-   Error handling
-   Loading states
-   Frontend authentication lifecycle
-   Real-time frontend lifecycle
-   Frontend architectural rules
