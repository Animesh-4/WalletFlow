# WalletFlow --- Database & Data Model

## Part 10 --- Persistence Architecture

This document describes the WalletFlow persistence layer using the
supplied repository as the source of truth.

The backend uses:

``` text
PostgreSQL
   │
   ▼
Neon serverless PostgreSQL / WebSocket transport
   │
   ▼
Drizzle ORM
   │
   ▼
Models
   │
   ▼
Services
```

The database schema is defined in:

``` text
src/db/schema.js
```

and database initialization is handled in:

``` text
src/config/database.js
```

The repository also provides:

``` text
src/db/seed.js
```

for initial category data and:

``` text
drizzle.config.js
```

for Drizzle Kit configuration.

------------------------------------------------------------------------

# 1. Persistence Architecture Overview

The database sits beneath the backend service layer.

``` text
HTTP / Socket request
        │
        ▼
Controller / Socket handler
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
PostgreSQL / Neon
```

The database should therefore be treated as the durable source of truth
for persisted domain state.

Runtime concepts such as Socket.IO rooms and in-memory presence are not
equivalent to database records.

------------------------------------------------------------------------

# 2. Database Technology

The repository uses:

``` text
PostgreSQL
```

through:

``` text
@neondatabase/serverless
```

and:

``` text
Drizzle ORM
```

The Drizzle configuration declares the PostgreSQL dialect and points
schema generation to:

``` text
src/db/schema.js
```

fileciteturn5file8L1089-L1102

------------------------------------------------------------------------

# 3. Database Connection

The database connection is configured in:

``` text
src/config/database.js
```

The current implementation:

1.  Reads `DATABASE_URL`.
2.  Configures Neon WebSocket behavior.
3.  Creates a Neon `Pool`.
4.  Initializes Drizzle with the schema.
5.  Fails startup if database initialization fails.

This makes database availability a startup dependency rather than an
optional runtime capability. fileciteturn5file7L987-L1022

------------------------------------------------------------------------

# 4. Database URL

The primary database configuration is:

``` env
DATABASE_URL=...
```

This value is used to create the PostgreSQL/Neon connection.

It is a server-side secret/configuration value and must not be exposed
through the frontend environment.

------------------------------------------------------------------------

# 5. Schema Source of Truth

The primary schema definition is:

``` text
src/db/schema.js
```

The current model layer contains:

``` text
Budget.js
BudgetHistory.js
BudgetUser.js
Category.js
Invitation.js
Notification.js
Transaction.js
User.js
```

These model files represent the application's persistence boundaries.
fileciteturn5file7L935-L943

------------------------------------------------------------------------

# 6. Core Entity Model

The persistence model can be represented as:

``` text
User
 │
 ├───────────────┐
 │               │
 ▼               ▼
Budget        Notification
 │
 ├── BudgetUser
 │      │
 │      └── User
 │
 ├── Transaction
 │      │
 │      └── Category
 │
 ├── BudgetHistory
 │
 └── Invitation
        │
        ├── Budget
        └── User
```

The important distinction is that some relationships are direct domain
entities while others are relationship/join entities.

------------------------------------------------------------------------

# 7. User

The user entity represents an application account.

Its persistence model is:

``` text
models/User.js
```

User records participate in:

``` text
Authentication
Budgets
Budget membership
Transactions
Invitations
Notifications
Profile management
```

The authentication service retrieves users by email and ID, while the
user service handles profile-level operations.

------------------------------------------------------------------------

# 8. User Password Storage

The application does not store plaintext passwords.

The authentication service hashes registration passwords using:

``` text
bcryptjs
```

with:

``` text
10
```

salt rounds. fileciteturn6file0L61-L74

The stored database field is represented internally as:

``` text
password_hash
```

The password hash should never be exposed through normal API responses.

------------------------------------------------------------------------

# 9. User Password Reset Fields

The password-reset workflow stores a hashed reset token and expiration
information.

Conceptually:

``` text
User
 ├── reset token hash
 └── reset token expiry
```

The raw reset token is sent to the user but the stored representation is
hashed.

The reset token is valid for one hour in the current service
implementation. fileciteturn6file0L95-L125

------------------------------------------------------------------------

# 10. Budget

The budget entity is the central collaborative financial container.

Persistence boundary:

``` text
models/Budget.js
```

A budget participates in:

``` text
Ownership
Membership
Transactions
History
Invitations
```

The frontend and backend both treat budgets as a primary application
domain.

------------------------------------------------------------------------

# 11. Budget Membership

Budget membership is represented separately from the budget itself.

Persistence boundary:

``` text
models/BudgetUser.js
```

Conceptually:

``` text
User
   │
   ▼
BudgetUser
   │
   ▼
Budget
```

The membership relationship carries the user's budget role.

------------------------------------------------------------------------

# 12. Budget Roles

The repository defines:

``` text
owner
editor
viewer
```

as budget membership roles.

The role is associated with the:

``` text
BudgetUser
```

relationship rather than being a global user property.

This distinction is important because one user can have different roles
across different budgets.

------------------------------------------------------------------------

# 13. Budget Ownership

Ownership is represented through the membership relationship.

Conceptually:

``` text
Budget
   │
   └── BudgetUser
          │
          ├── user_id
          └── role = owner
```

This allows ownership to participate in the same membership model as
editor/viewer access.

The current service layer treats owner status as the highest
budget-management role.

------------------------------------------------------------------------

# 14. Budget Transactions

Transactions are associated with budgets.

Persistence boundary:

``` text
models/Transaction.js
```

Conceptually:

``` text
Budget
   │
   └── Transactions
          │
          └── Category
```

This allows financial records to be grouped under a collaborative
budget.

------------------------------------------------------------------------

# 15. Transaction

The transaction entity represents a financial record.

Persistence boundary:

``` text
models/Transaction.js
```

Transaction operations are exposed through:

``` text
transactionController.js
transactionService.js
routes/transaction.js
```

The frontend has a corresponding:

``` text
transactionAPI.js
```

------------------------------------------------------------------------

# 16. Transaction User Relationship

Transactions also participate in user relationships.

The current model should therefore be understood as having both:

``` text
Budget context
```

and:

``` text
User context
```

The exact ownership semantics for every transaction mutation should be
derived from the complete `Transaction.js` and `transactionService.js`
implementations before treating them as a formal authorization contract.

------------------------------------------------------------------------

# 17. Category

Categories are persisted through:

``` text
models/Category.js
```

and exposed through:

``` text
GET /api/categories
```

Categories classify transactions.

The backend category controller obtains categories from the model and
returns category names. fileciteturn5file9L1173-L1189

------------------------------------------------------------------------

# 18. Default Categories

The repository seeds default categories through:

``` text
src/db/seed.js
```

The seed uses conflict-safe insertion so an existing category with the
same name is not duplicated.

The seed contains both expense-oriented and income-oriented category
values.

The seed file should be treated as the authoritative source for the
current default category set.

------------------------------------------------------------------------

# 19. Invitation

Invitations are persisted through:

``` text
models/Invitation.js
```

An invitation connects:

``` text
User
Budget
Invitation token/workflow
```

The invitation service uses the invitation token together with the
authenticated accepting user.

------------------------------------------------------------------------

# 20. Invitation as a Relationship Workflow

The invitation should not be treated as the permanent membership record.

The conceptual lifecycle is:

``` text
Invitation
    │
    ▼
Acceptance
    │
    ▼
BudgetUser membership
```

Therefore:

``` text
Invitation ≠ BudgetUser
```

The invitation is a collaboration onboarding mechanism.

------------------------------------------------------------------------

# 21. Notification

Notifications are persisted through:

``` text
models/Notification.js
```

Notifications are user-scoped.

Conceptually:

``` text
User
  │
  └── Notifications
        ├── unread
        └── read
```

The notification controller uses the authenticated user identity when
retrieving and modifying notifications.
fileciteturn5file9L1216-L1249

------------------------------------------------------------------------

# 22. Notification Read State

The notification model exposes operations including:

``` text
markAsRead
markAllAsRead
```

This creates a simple state transition:

``` text
Unread
  │
  ├── markAsRead
  │
  └── markAllAsRead
        │
        ▼
      Read
```

The current repository does not establish a more complex notification
lifecycle.

------------------------------------------------------------------------

# 23. Budget History

Budget history is persisted through:

``` text
models/BudgetHistory.js
```

It provides a historical record associated with a budget.

The frontend exposes:

``` text
GET /budgets/:budgetId/history
```

through:

``` text
getBudgetHistory()
```

The history model should therefore be treated as durable audit/history
data rather than transient UI state.

------------------------------------------------------------------------

# 24. Entity Relationship Summary

The main persistence relationships can be represented as:

``` text
User
 │
 ├───────────────┐
 │               │
 │               └── Notification
 │
 ├── BudgetUser ───── Budget
 │                       │
 │                       ├── Transaction ─── Category
 │                       │
 │                       ├── BudgetHistory
 │                       │
 │                       └── Invitation
 │
 ├── Transaction
 │
 └── Invitation
```

The exact foreign-key directions and cascade behavior should be read
directly from `schema.js` when modifying database constraints.

------------------------------------------------------------------------

# 25. Database vs Application Relationships

Not every application relationship must map one-to-one to a database
table.

For example:

``` text
Budget membership
```

is represented by a dedicated relationship entity.

Meanwhile:

``` text
Reports
```

are derived from financial data and are not presented as a primary
persisted report entity in the supplied model set.

This distinction prevents unnecessary persistence duplication.

------------------------------------------------------------------------

# 26. Schema Constraints

The database schema is responsible for enforcing structural data rules
such as:

``` text
Column types
Required values
Foreign-key relationships
Enums
Database-level relationships
```

The application service layer is responsible for business rules such as:

``` text
Role permissions
Budget update restrictions
Authentication workflow
Invitation behavior
```

These responsibilities should not be conflated.

------------------------------------------------------------------------

# 27. Database Constraints vs Validation

There are two useful validation layers:

``` text
HTTP/request validation
        │
        ▼
Application/service rules
        │
        ▼
Database constraints
```

A database constraint should not be assumed to replace application-level
validation.

Conversely, application validation should not be assumed to replace
database integrity constraints.

------------------------------------------------------------------------

# 28. Model Layer

The model layer is the backend persistence abstraction.

Current model files:

``` text
Budget.js
BudgetHistory.js
BudgetUser.js
Category.js
Invitation.js
Notification.js
Transaction.js
User.js
```

Services use these model operations rather than embedding raw database
access throughout controllers.

------------------------------------------------------------------------

# 29. Model Naming Convention

The repository uses singular model filenames:

``` text
User.js
Budget.js
Transaction.js
Category.js
```

This convention should be preserved for new domain models.

------------------------------------------------------------------------

# 30. Service → Model Flow

A typical persistence operation is:

``` text
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

For budget authorization, for example, the service calls the membership
model before allowing an update. fileciteturn6file6L733-L791

------------------------------------------------------------------------

# 31. Database Initialization Lifecycle

Startup database initialization is:

``` text
server.js
   │
   ▼
config/database.js
   │
   ▼
DATABASE_URL
   │
   ▼
Neon Pool
   │
   ▼
Drizzle instance
   │
   ▼
Application
```

If initialization fails, the backend exits rather than continuing
without a valid database.

------------------------------------------------------------------------

# 32. Drizzle Configuration

The Drizzle configuration establishes:

``` text
schema = src/db/schema.js
dialect = postgresql
```

and uses the database URL from environment configuration.

The repository's Drizzle configuration is the bridge between the source
schema and Drizzle Kit commands. fileciteturn5file8L1089-L1102

------------------------------------------------------------------------

# 33. Schema Synchronization

The package scripts provide:

``` bash
npm run db:push
```

which executes the configured Drizzle Kit schema push operation.

This is the repository-provided mechanism for synchronizing the current
schema with the configured database.

Before production use, the exact operational migration policy should be
established separately if the project moves beyond direct schema
pushing.

------------------------------------------------------------------------

# 34. Database Seeding

The package provides:

``` bash
npm run db:seed
```

which runs:

``` text
src/db/seed.js
```

The seed currently establishes default categories.

It should be considered initialization data rather than application
runtime behavior.

------------------------------------------------------------------------

# 35. Production Seed Safety

The seed implementation contains a production safeguard.

When:

``` text
NODE_ENV=production
```

the seed requires:

``` text
FORCE_SEED_PRODUCTION=true
```

before proceeding.

This prevents accidental production seeding during ordinary operations.

------------------------------------------------------------------------

# 36. Data Ownership

The database ownership model should be understood at the domain level.

### User-owned data

Examples:

``` text
Profile
Notifications
```

### Budget-scoped data

Examples:

``` text
Transactions
History
Membership
Invitations
```

### Shared reference data

Examples:

``` text
Categories
```

The exact ownership rules for each mutation must remain consistent with
the service layer.

------------------------------------------------------------------------

# 37. Budget Membership as an Authorization Data Structure

`BudgetUser` is not merely a convenience table.

It is part of the authorization model.

It answers:

``` text
Does user X belong to budget Y?
What role does user X have in budget Y?
```

The budget service uses this relationship to enforce:

``` text
member access
owner permissions
editor permissions
viewer restrictions
```

fileciteturn6file6L733-L791

------------------------------------------------------------------------

# 38. History as Durable State

Budget history should be treated differently from UI state.

``` text
Budget history
    │
    ▼
Database
    │
    ▼
Can be retrieved later
```

It should not be reconstructed solely from the current React state or
Socket.IO events.

The history endpoint exists specifically to retrieve persisted
historical information.

------------------------------------------------------------------------

# 39. Reports as Derived Data

Reports have a different persistence characteristic.

``` text
Transactions
    │
    ▼
Report calculations
    │
    ▼
API response
```

The supplied repository contains:

``` text
reportService.js
reportController.js
```

but not a primary `Report.js` model in the listed model set.

Therefore reporting should be treated as derived application data unless
additional source establishes otherwise.

------------------------------------------------------------------------

# 40. Runtime Data vs Database Data

The following are runtime concepts:

``` text
React state
Socket connection
Socket.IO rooms
Live-user presence
```

The following are durable database concepts:

``` text
User
Budget
BudgetUser
Transaction
Category
Invitation
Notification
BudgetHistory
```

A runtime disconnect should not be interpreted as deletion of durable
user/budget data.

------------------------------------------------------------------------

# 41. Redis and Database State

Redis is used for Socket.IO infrastructure when configured.

It should not be automatically interpreted as the source of truth for
the financial domain.

The durable financial source remains PostgreSQL.

Conceptually:

``` text
PostgreSQL
   └── durable business data

Redis
   └── real-time infrastructure
```

The current live-user implementation remains process-local even when the
Socket.IO Redis adapter is available.

------------------------------------------------------------------------

# 42. Referential Integrity

When changing a relationship, inspect:

``` text
schema.js
```

for the corresponding foreign-key relationship and delete/update
behavior.

Do not infer cascade behavior solely from the existence of a model
relationship.

The exact cascade configuration must be verified from the schema before
documenting or changing it.

------------------------------------------------------------------------

# 43. Safe Schema Change Workflow

When changing a database entity:

``` text
1. Inspect schema.js
2. Inspect model
3. Inspect service
4. Inspect controller
5. Inspect route
6. Inspect frontend API consumer
7. Identify existing data compatibility
8. Update seed data if necessary
9. Update tests
10. Run database/schema verification
```

If a field is removed or renamed, search all layers before making the
schema change.

------------------------------------------------------------------------

# 44. Adding a New Entity

A new persistent domain entity normally requires:

``` text
1. Schema definition
2. Model
3. Service
4. Controller
5. Route
6. Tests
7. Frontend API service
8. Frontend state/UI if applicable
9. Seed/migration strategy if applicable
10. Documentation
```

Do not add only a database table and consider the feature complete.

------------------------------------------------------------------------

# 45. Renaming a Database Field

A field rename can affect:

``` text
Schema
Model queries
Service objects
Controller responses
Frontend API services
Components
Tests
Seed data
```

Use repository-wide search before changing the field.

------------------------------------------------------------------------

# 46. Removing a Database Field

Before removing a field:

``` text
Search codebase
   │
   ├── Backend models
   ├── Services
   ├── Controllers
   ├── Tests
   ├── Frontend services
   └── Components
```

Then determine whether existing persisted records require a migration
strategy.

The supplied repository does not define a general data-migration
playbook, so destructive schema changes require an explicit engineering
decision.

------------------------------------------------------------------------

# 47. Data Access Security

For resource-owned data, the safest application pattern is:

``` text
Authenticated identity
       │
       ▼
Resource lookup scoped to identity
       │
       ▼
Business authorization
       │
       ▼
Mutation
```

The budget and notification implementations demonstrate identity-aware
access patterns.

------------------------------------------------------------------------

# 48. Database Performance Considerations

The source establishes the database and ORM architecture, but the
supplied documentation set does not provide measured query-performance
data.

Therefore this document does not claim:

``` text
specific query latency
specific database capacity
specific index performance
specific production throughput
```

Before performance tuning, inspect:

``` text
schema indexes
query plans
database metrics
application traces
```

rather than relying on assumptions.

------------------------------------------------------------------------

# 49. Database Reliability Considerations

The application treats database initialization as mandatory.

However, the supplied source does not establish a complete database
disaster-recovery policy.

It does not by itself document:

``` text
backup schedule
restore procedure
RPO
RTO
failover testing
point-in-time recovery procedure
```

These should be documented separately when the operational
infrastructure is known.

------------------------------------------------------------------------

# 50. Database Testing

Database-related behavior is exercised indirectly through backend tests
such as:

``` text
auth.test.js
budget.test.js
transaction.test.js
```

The supplied test inventory does not establish complete schema-level or
migration-level testing.

For database changes, add coverage appropriate to the affected
service/model behavior.

------------------------------------------------------------------------

# 51. Data Model Navigation Guide

When investigating:

### User data

``` text
models/User.js
services/userService.js
services/authService.js
```

### Budget data

``` text
models/Budget.js
services/budgetService.js
```

### Membership/roles

``` text
models/BudgetUser.js
services/budgetService.js
```

### Transactions

``` text
models/Transaction.js
services/transactionService.js
```

### Categories

``` text
models/Category.js
db/seed.js
```

### Invitations

``` text
models/Invitation.js
services/invitationService.js
```

### Notifications

``` text
models/Notification.js
services/notificationService.js
```

### History

``` text
models/BudgetHistory.js
```

------------------------------------------------------------------------

# 52. Data Model Change Checklist

Before merging a persistence change, verify:

``` text
[ ] Schema updated
[ ] Model updated
[ ] Service updated
[ ] Controller updated if response changes
[ ] Route reviewed
[ ] Frontend API reviewed
[ ] Tests updated
[ ] Seed data reviewed
[ ] Existing data compatibility considered
[ ] Authorization reviewed
[ ] Documentation updated
```

------------------------------------------------------------------------

# 53. Persistence Architecture Summary

WalletFlow's persistence architecture is:

``` text
                  PostgreSQL / Neon
                         │
                         ▼
                   Drizzle ORM
                         │
                  ┌──────┴──────┐
                  ▼             ▼
               Models        Schema
                  │
                  ▼
               Services
                  │
                  ▼
             Controllers
                  │
                  ▼
                Routes

Core entities:

User
Budget
BudgetUser
Transaction
Category
Invitation
Notification
BudgetHistory
```

The most important persistence rule is:

> **PostgreSQL stores durable domain state; Drizzle provides the
> database abstraction; models own persistence operations; services own
> business workflows; and authorization decisions must remain aligned
> with the stored relationships.**

------------------------------------------------------------------------

# 54. Next Part

**Part 11 --- Real-Time Architecture**

The next document will focus entirely on Socket.IO and collaboration:

-   Socket server initialization
-   Connection lifecycle
-   JWT handshake authentication
-   Socket identity
-   User rooms
-   Budget rooms
-   Join/leave behavior
-   Budget events
-   Transaction events
-   Live-user presence
-   Frontend SocketContext
-   Client socket service
-   Redis adapter
-   Multi-instance implications
-   Disconnect behavior
-   Event propagation
-   Real-time failure modes
-   Production scaling considerations
-   Real-time debugging workflow
