# WalletFlow --- API Contract & Endpoint Reference

## Part 9 --- REST API and Real-Time Contract

This document provides the engineer-facing API reference for the
WalletFlow backend based on the supplied frontend and backend source.

The API is organized by domain:

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

The frontend API modules map directly to these backend route groups.

> This document records contracts supported by the supplied source. It
> does not invent undocumented request fields, response fields, or
> status codes.

------------------------------------------------------------------------

# 1. API Architecture

The normal REST request path is:

``` text
Frontend API service
       │
       ▼
Axios
       │
       ▼
/api/<domain>
       │
       ▼
Express route
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
PostgreSQL
```

The frontend's shared Axios client uses `REACT_APP_API_URL` and adds the
JWT Bearer header when a token exists. fileciteturn6file5L608-L632

------------------------------------------------------------------------

# 2. API Base URL

The frontend configures the API client with:

``` text
REACT_APP_API_URL
```

and currently falls back to:

``` text
http://localhost:5000/api
```

The backend mounts its domain routes below:

``` text
/api
```

Therefore the frontend should normally configure `REACT_APP_API_URL` to
the backend API root.

------------------------------------------------------------------------

# 3. Authentication Header

Protected requests use:

``` http
Authorization: Bearer <JWT>
```

The frontend's shared Axios request interceptor automatically adds this
header when a token exists in browser storage.
fileciteturn6file5L620-L632

Individual domain API modules therefore do not need to construct the
Authorization header themselves.

------------------------------------------------------------------------

# 4. Global 401 Behavior

The frontend Axios response interceptor handles:

``` text
401
```

by:

``` text
Remove localStorage token
        │
        ▼
Redirect to /login
```

The original error is then rejected to the calling service/component.
fileciteturn6file5L634-L647

------------------------------------------------------------------------

# 5. Authentication API

Base path:

``` text
/api/auth
```

Frontend service:

``` text
src/services/authAPI.js
```

Backend route:

``` text
src/routes/auth.js
```

Backend controller:

``` text
src/controllers/authController.js
```

------------------------------------------------------------------------

# 6. Register

``` http
POST /api/auth/register
```

Purpose:

``` text
Create a new user account.
```

The controller reads:

``` text
username
email
password
```

and passes them to:

``` text
authService.registerUser()
```

On success, the controller returns:

``` json
{
  "message": "User registered successfully",
  "userId": "<id>"
}
```

with:

``` text
201 Created
```

The current implementation explicitly returns this shape.
fileciteturn6file8L893-L904

------------------------------------------------------------------------

# 7. Register --- Duplicate Email

If the email already exists, the service raises a conflict error.

Current behavior:

``` text
409 Conflict
```

with:

``` text
An account with this email already exists.
```

The service performs the duplicate check before hashing/creating the
user. fileciteturn6file0L61-L74

------------------------------------------------------------------------

# 8. Login

``` http
POST /api/auth/login
```

Request fields used by the controller:

``` json
{
  "email": "...",
  "password": "..."
}
```

Frontend service:

``` text
authAPI.login()
```

Backend:

``` text
authController.login
→ authService.loginUser
```

------------------------------------------------------------------------

# 9. Login Response

Successful login returns:

``` json
{
  "message": "Login successful",
  "token": "<JWT>",
  "user": {
    "id": "...",
    "username": "...",
    "email": "...",
    "avatar_url": "..."
  }
}
```

with:

``` text
200 OK
```

The JWT payload itself currently contains:

``` text
id
email
```

while the returned user object contains the additional profile fields.
fileciteturn6file8L917-L930

------------------------------------------------------------------------

# 10. Login Failure

If credentials are invalid:

``` text
401 Unauthorized
```

with:

``` text
Invalid credentials
```

The service returns no user when the email is unknown or the password
comparison fails, and the controller maps that condition to the 401
response. fileciteturn6file0L77-L86 fileciteturn6file8L909-L915

------------------------------------------------------------------------

# 11. Get Current Profile

``` http
GET /api/auth/profile
```

Authentication:

``` text
Required
```

Identity source:

``` text
req.user.id
```

The controller looks up the authenticated user's profile and returns:

``` json
{
  "id": "...",
  "username": "...",
  "email": "...",
  "avatar_url": "..."
}
```

The endpoint returns:

``` text
404
```

if the authenticated user cannot be found.
fileciteturn6file8L936-L955

------------------------------------------------------------------------

# 12. Forgot Password

``` http
POST /api/auth/forgot-password
```

Request:

``` json
{
  "email": "..."
}
```

The endpoint delegates to the password-reset service.

The service:

``` text
Find user
    │
    ▼
Generate random reset token
    │
    ▼
Hash token
    │
    ▼
Store hash + expiry
    │
    ▼
Email raw token
```

The reset token is valid for one hour. fileciteturn6file0L95-L113

------------------------------------------------------------------------

# 13. Forgot Password --- Response

The service intentionally returns the same message even if the email
does not exist:

``` text
If a user with that email exists, a reset link has been sent.
```

This behavior avoids directly revealing whether an email address is
registered. fileciteturn6file0L109-L113

------------------------------------------------------------------------

# 14. Reset Password

``` http
POST /api/auth/reset-password
```

Request:

``` json
{
  "token": "...",
  "newPassword": "..."
}
```

The controller requires both values.

If either is absent:

``` text
400 Bad Request
```

The service hashes the supplied token, looks up the matching reset
record, and changes the password if the token is valid.
fileciteturn6file8L970-L984

------------------------------------------------------------------------

# 15. Budget API

Base path:

``` text
/api/budgets
```

Frontend service:

``` text
src/services/budgetAPI.js
```

Backend route:

``` text
src/routes/budget.js
```

Backend controller:

``` text
src/controllers/budgetController.js
```

Backend service:

``` text
src/services/budgetService.js
```

------------------------------------------------------------------------

# 16. Get All Budgets

``` http
GET /api/budgets
```

Authentication:

``` text
Required
```

The controller uses:

``` text
req.user.id
```

to retrieve the budgets available to the authenticated user.

The frontend service exposes this as:

``` text
getAllBudgets()
```

The controller delegates to:

``` text
budgetService.getBudgetsByUserId(req.user.id)
```

fileciteturn6file8L987-L996

------------------------------------------------------------------------

# 17. Get Budget

``` http
GET /api/budgets/:id
```

Authentication:

``` text
Required
```

The budget service receives:

``` text
budgetId
userId
```

and delegates to an ownership/membership-aware model lookup:

``` text
Budget.findById(budgetId, userId)
```

This means the authenticated identity participates in budget retrieval
rather than treating the ID as universally readable.
fileciteturn6file6L725-L727

------------------------------------------------------------------------

# 18. Create Budget

``` http
POST /api/budgets
```

Authentication:

``` text
Required
```

The operation creates a budget using the supplied budget data.

Frontend service:

``` text
createBudget(budgetData)
```

Backend:

``` text
budgetController
→ budgetService.createBudget
→ Budget.create
```

The exact accepted body fields should be taken from the current budget
route/controller validation and model/schema rather than inferred beyond
the source.

------------------------------------------------------------------------

# 19. Update Budget

``` http
PUT /api/budgets/:id
```

Authentication:

``` text
Required
```

Authorization:

``` text
Budget membership + role
```

The service first determines the user's role:

``` text
BudgetUser.findUserInBudget(budgetId, userId)
```

No membership produces:

``` text
403 Forbidden
```

fileciteturn6file6L733-L741

------------------------------------------------------------------------

# 20. Budget Update --- Owner

An owner can update the budget through the normal update path.

The service explicitly recognizes:

``` text
role === owner
```

and applies the supplied budget update. fileciteturn6file6L748-L759

If the amount increases, the service records budget history.

------------------------------------------------------------------------

# 21. Budget Update --- Editor

An editor has a narrower contract.

The current service allows:

``` text
Increase total budget amount
```

but rejects:

``` text
Decrease amount
```

or:

``` text
Change other budget fields
```

with:

``` text
403 Forbidden
```

The service explicitly compares the proposed budget against the original
budget before allowing the editor update.
fileciteturn6file6L761-L785

------------------------------------------------------------------------

# 22. Budget Update --- Viewer

A viewer cannot modify the budget.

Current response:

``` text
403 Forbidden
```

The service explicitly rejects viewer modifications.
fileciteturn6file6L787-L791

------------------------------------------------------------------------

# 23. Delete Budget

``` http
DELETE /api/budgets/:id
```

Authentication:

``` text
Required
```

Authorization:

``` text
Owner only
```

The budget service checks membership and requires:

``` text
role === owner
```

before deletion. fileciteturn6file6L794-L797

------------------------------------------------------------------------

# 24. Budget History

``` http
GET /api/budgets/:budgetId/history
```

Authentication:

``` text
Required
```

Frontend service:

``` text
getBudgetHistory(budgetId)
```

The frontend budget detail modal uses this endpoint to retrieve history
for a selected budget. fileciteturn6file2L316-L339

The backend exposes a dedicated:

``` text
BudgetHistory
```

model.

------------------------------------------------------------------------

# 25. Transaction API

Base path:

``` text
/api/transactions
```

The transaction route applies authentication middleware to all routes.
fileciteturn6file0L11-L20

Backend controller:

``` text
transactionController.js
```

Backend service:

``` text
transactionService.js
```

Backend model:

``` text
Transaction.js
```

------------------------------------------------------------------------

# 26. Get Transactions

``` http
GET /api/transactions
```

Authentication:

``` text
Required
```

Frontend service:

``` text
getTransactions()
```

This is the general transaction retrieval endpoint.

------------------------------------------------------------------------

# 27. Create Transaction

``` http
POST /api/transactions
```

Authentication:

``` text
Required
```

Frontend service:

``` text
createTransaction(data)
```

The request enters:

``` text
transactionController.createTransaction
```

and then the transaction service/model layers.

------------------------------------------------------------------------

# 28. Update Transaction

``` http
PUT /api/transactions/:id
```

Authentication:

``` text
Required
```

Frontend service:

``` text
updateTransaction(id, data)
```

The route binds the ID to:

``` text
transactionController.updateTransaction
```

------------------------------------------------------------------------

# 29. Delete Transaction

``` http
DELETE /api/transactions/:id
```

Authentication:

``` text
Required
```

The backend route explicitly exposes this operation.
fileciteturn6file0L22-L31

The frontend service should use the corresponding transaction API
operation when deleting a transaction.

------------------------------------------------------------------------

# 30. Get Transactions by Budget

``` http
GET /api/transactions/budget/:budgetId
```

Authentication:

``` text
Required
```

The backend route explicitly exposes:

``` text
getTransactionsByBudget
```

This endpoint is useful when a UI needs transaction data scoped to a
particular budget. fileciteturn6file0L33-L36

------------------------------------------------------------------------

# 31. Transaction Route Order

The transaction router defines:

``` text
GET /
POST /
PUT /:id
DELETE /:id
GET /budget/:budgetId
```

When modifying route definitions, preserve the intended route matching
behavior and verify that parameterized routes do not unintentionally
capture more specific paths.

------------------------------------------------------------------------

# 32. User API

Base path:

``` text
/api/users
```

The user route requires authentication for all routes in the router.
fileciteturn6file0L39-L51

------------------------------------------------------------------------

# 33. Update User

``` http
PUT /api/users/:id
```

Authentication:

``` text
Required
```

Backend controller:

``` text
userController.updateUser
```

Frontend service:

``` text
userAPI.updateProfile()
```

The current frontend authentication context uses this operation when
updating the authenticated user's profile and merges the returned user
data into local authentication state. fileciteturn6file3L424-L432

------------------------------------------------------------------------

# 34. Category API

Base path:

``` text
/api/categories
```

Frontend service:

``` text
categoryAPI.js
```

Backend:

``` text
categoryController.js
category route
Category model
```

------------------------------------------------------------------------

# 35. Get Categories

``` http
GET /api/categories
```

The frontend category service retrieves category data from this
endpoint.

The backend category controller obtains categories from the model and
returns category names. The current source therefore establishes a
lightweight category response rather than exposing the entire database
record by default.

------------------------------------------------------------------------

# 36. Invitation API

Base path:

``` text
/api/invitations
```

Backend:

``` text
invitationController.js
invitationService.js
Invitation.js
```

Frontend:

``` text
collaborationAPI.js
```

The invitation API supports collaboration workflows.

------------------------------------------------------------------------

# 37. Accept Invitation

``` http
POST /api/invitations/accept
```

The current frontend collaboration service maps invitation acceptance to
this endpoint.

The operation receives an invitation token and authenticated user
context.

The backend invitation controller passes the token and authenticated
user ID into the invitation service. fileciteturn5file9L1192-L1213

------------------------------------------------------------------------

# 38. Invitation Lifecycle

The API-level workflow is:

``` text
Invitation created
      │
      ▼
Invitee receives token/link
      │
      ▼
Invitee authenticates
      │
      ▼
POST /api/invitations/accept
      │
      ▼
Invitation service
      │
      ▼
Budget membership
```

The email service builds the invitation URL from `FRONTEND_URL` and the
invitation token. fileciteturn6file7L847-L857

------------------------------------------------------------------------

# 39. Collaboration API

The frontend collaboration service exposes operations including:

``` text
inviteUser
getCollaborators
removeUser
acceptInvitation
```

These operations represent the HTTP side of budget collaboration.

Real-time collaboration is handled separately through Socket.IO.

------------------------------------------------------------------------

# 40. Notifications API

Base path:

``` text
/api/notifications
```

Frontend service:

``` text
notificationAPI.js
```

Backend:

``` text
notificationController.js
notificationService.js
Notification.js
```

Notification operations are authenticated and user-scoped.

------------------------------------------------------------------------

# 41. Get Notifications

``` http
GET /api/notifications
```

Authentication:

``` text
Required
```

The backend identifies the user using:

``` text
req.user.id
```

rather than trusting a user ID supplied by the client.

------------------------------------------------------------------------

# 42. Mark Notification as Read

``` http
PUT /api/notifications/:id/read
```

Authentication:

``` text
Required
```

The backend uses both:

``` text
notification ID
user ID
```

for the operation, preserving user ownership boundaries.

------------------------------------------------------------------------

# 43. Mark All Notifications as Read

``` http
PUT /api/notifications/read-all
```

Authentication:

``` text
Required
```

The operation is scoped to the authenticated user.

The current notification model exposes:

``` text
markAllAsRead(userId)
```

as the persistence-level operation.

------------------------------------------------------------------------

# 44. Reports API

Base path:

``` text
/api/reports
```

Frontend service:

``` text
reportAPI.js
```

Backend:

``` text
reportController.js
reportService.js
report route
```

------------------------------------------------------------------------

# 45. Spending Summary

``` http
GET /api/reports/summary
```

The frontend service provides:

``` text
getSpendingSummary(month, year)
```

and supplies month/year query parameters.

The report service is responsible for deriving the requested summary
from financial data.

------------------------------------------------------------------------

# 46. Monthly Report

``` http
GET /api/reports/monthly
```

The frontend service provides:

``` text
getMonthlyReport(month, year)
```

The report endpoint is designed for monthly reporting data consumed by
the report UI.

------------------------------------------------------------------------

# 47. Report Data Model

Reports are derived information.

The conceptual relationship is:

``` text
Transactions
      │
      ▼
Report Service
      │
      ├── Filter
      ├── Aggregate
      └── Format
      │
      ▼
Report API
      │
      ▼
Frontend charts/report
```

The report API should therefore not be treated as the primary financial
source of truth.

------------------------------------------------------------------------

# 48. Endpoint Authentication Matrix

  Domain          Endpoint                               Auth
  --------------- -------------------------------------- -------------------------
  Auth            `POST /auth/register`                  No
  Auth            `POST /auth/login`                     No
  Auth            `GET /auth/profile`                    Yes
  Auth            `POST /auth/forgot-password`           No
  Auth            `POST /auth/reset-password`            No
  Budgets         `GET /budgets`                         Yes
  Budgets         `GET /budgets/:id`                     Yes
  Budgets         `POST /budgets`                        Yes
  Budgets         `PUT /budgets/:id`                     Yes + role
  Budgets         `DELETE /budgets/:id`                  Yes + owner
  Budgets         `GET /budgets/:id/history`             Yes
  Transactions    `GET /transactions`                    Yes
  Transactions    `POST /transactions`                   Yes
  Transactions    `PUT /transactions/:id`                Yes
  Transactions    `DELETE /transactions/:id`             Yes
  Transactions    `GET /transactions/budget/:budgetId`   Yes
  Users           `PUT /users/:id`                       Yes
  Categories      `GET /categories`                      Verify route middleware
  Invitations     `POST /invitations/accept`             Yes
  Notifications   `GET /notifications`                   Yes
  Notifications   `PUT /notifications/:id/read`          Yes
  Notifications   `PUT /notifications/read-all`          Yes
  Reports         `GET /reports/summary`                 Verify route middleware
  Reports         `GET /reports/monthly`                 Verify route middleware

> Where the supplied excerpts do not expose the complete route file,
> this table intentionally marks the authentication requirement as
> **Verify route middleware** rather than inventing it.

------------------------------------------------------------------------

# 49. Frontend Service → Endpoint Mapping

  Frontend service        Backend domain
  ----------------------- -----------------------------------------
  `authAPI.js`            `/auth/*`
  `budgetAPI.js`          `/budgets/*`
  `transactionAPI.js`     `/transactions/*`
  `userAPI.js`            `/users/*`
  `categoryAPI.js`        `/categories/*`
  `collaborationAPI.js`   `/invitations/*` + collaboration routes
  `notificationAPI.js`    `/notifications/*`
  `reportAPI.js`          `/reports/*`
  `socket.js`             Socket.IO

This mapping is the fastest way to trace a frontend API call into the
backend.

------------------------------------------------------------------------

# 50. API Error Handling

The backend uses centralized error handling.

Controllers generally follow:

``` text
try
  domain operation
catch
  next(error)
```

The authentication controller demonstrates this pattern for
registration, login, profile, forgot-password, and reset-password
operations. fileciteturn6file8L896-L984

The exact serialized error shape should be taken from the current
`errorHandler.js` implementation when writing client-facing error
contracts.

------------------------------------------------------------------------

# 51. HTTP Status Semantics Currently Established

The supplied source explicitly establishes:

``` text
201 Created
```

for successful registration.

``` text
200 OK
```

for successful login/profile/password operations.

``` text
400 Bad Request
```

for missing reset-password fields.

``` text
401 Unauthorized
```

for invalid login credentials and missing REST credentials.

``` text
403 Forbidden
```

for invalid/expired REST JWTs and unauthorized budget role operations.

``` text
404 Not Found
```

when the authenticated profile cannot be found.

``` text
409 Conflict
```

for duplicate registration email.

These statuses should be preserved when maintaining backward
compatibility.

------------------------------------------------------------------------

# 52. API Identity Rules

For authenticated requests, use:

``` text
req.user.id
```

as the server-side identity.

Do not treat a client-supplied:

``` text
userId
```

as proof of identity.

Resource authorization should derive from:

``` text
authenticated user
+
resource
+
membership/ownership
+
role
```

------------------------------------------------------------------------

# 53. API Resource Rules

The API is resource-oriented.

Examples:

``` text
/budgets
/transactions
/users
/notifications
/reports
```

The domain service should remain the source of business rules.

The route should not become a second service layer.

------------------------------------------------------------------------

# 54. API Change Workflow

When modifying an existing endpoint:

``` text
1. Find frontend service
2. Find backend route
3. Find controller
4. Find service
5. Find model
6. Check schema
7. Check authentication
8. Check authorization
9. Update tests
10. Verify frontend response assumptions
```

This prevents a backend change from silently breaking frontend
consumers.

------------------------------------------------------------------------

# 55. API Debugging Workflow

When an API call fails:

``` text
Browser
  │
  ▼
Frontend API service
  │
  ▼
Axios
  │
  ▼
Network request
  │
  ▼
Express route
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
Model / database
```

Identify the first layer where the expected behavior diverges.

------------------------------------------------------------------------

# 56. Socket.IO Contract

WalletFlow also exposes a real-time API.

The frontend socket service currently exposes operations/listeners
around:

``` text
joinBudgetRoom
leaveBudgetRoom
onBudgetUpdate
onTransactionUpdate
onLiveUsersUpdate
```

The underlying event names include:

``` text
joinBudget
leaveBudget
budgetUpdated
transactionUpdated
liveUsers
```

The frontend socket service is therefore the client-side contract
boundary for real-time functionality.

------------------------------------------------------------------------

# 57. Socket Authentication Contract

The socket connection authenticates using the JWT.

The backend accepts the token through the Socket.IO handshake:

``` text
auth.token
```

or:

``` text
query.token
```

The server verifies the token before assigning:

``` text
socket.user
```

and joining the authenticated user room.
fileciteturn4file9L1093-L1147

------------------------------------------------------------------------

# 58. Socket Room Concept

Budget collaboration uses budget-specific Socket.IO rooms.

Conceptually:

``` text
Authenticated socket
        │
        ▼
joinBudget(budgetId)
        │
        ▼
budget room
        │
        ├── User A
        ├── User B
        └── User C
```

A Socket.IO room is runtime state and should not be confused with
persistent budget membership.

------------------------------------------------------------------------

# 59. API Contract Stability

Changes to these elements can be breaking changes:

``` text
Route path
HTTP method
Authentication requirement
Request field name
Response field name
Status code
Error shape
Socket event name
Socket event payload
```

When changing one of these, update both:

``` text
Backend contract
Frontend consumer
```

and corresponding tests/documentation.

------------------------------------------------------------------------

# 60. API Documentation Rule

Every production API endpoint should ideally have a corresponding
contract containing:

``` text
Method
Path
Authentication
Authorization
Request parameters
Request body
Success response
Error responses
Side effects
Related frontend service
Related backend implementation
```

This document provides the current implementation-level baseline;
endpoint schemas should be expanded only from source-backed
validation/model definitions.

------------------------------------------------------------------------

# 61. API Reference Summary

``` text
AUTH
  /auth/register
  /auth/login
  /auth/profile
  /auth/forgot-password
  /auth/reset-password

BUDGETS
  /budgets
  /budgets/:id
  /budgets/:id/history

TRANSACTIONS
  /transactions
  /transactions/:id
  /transactions/budget/:budgetId

USERS
  /users/:id

CATEGORIES
  /categories

INVITATIONS
  /invitations/accept

NOTIFICATIONS
  /notifications
  /notifications/:id/read
  /notifications/read-all

REPORTS
  /reports/summary
  /reports/monthly

REAL-TIME
  Socket.IO
  ├── joinBudget
  ├── leaveBudget
  ├── budgetUpdated
  ├── transactionUpdated
  └── liveUsers
```

------------------------------------------------------------------------

# 62. Next Part

**Part 10 --- Database & Data Model**

The next document will describe the persistence layer in depth:

-   PostgreSQL/Neon architecture
-   Drizzle ORM
-   Schema organization
-   Users
-   Budgets
-   Budget membership
-   Transactions
-   Categories
-   Invitations
-   Notifications
-   Budget history
-   Relationships
-   Foreign keys
-   Enums
-   Cascades/deletion behavior
-   Indexes and constraints where established
-   Database initialization
-   Seeding
-   Schema synchronization
-   Data ownership boundaries
-   Transactional considerations
-   Safe database-change workflow
