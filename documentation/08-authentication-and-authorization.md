# WalletFlow --- Authentication & Authorization

## Part 8 --- Authentication, Sessions & Access Control

This document describes how WalletFlow establishes user identity,
creates and validates sessions, protects REST endpoints, authenticates
Socket.IO connections, and applies budget-level authorization.

The source establishes two distinct security layers:

``` text
Authentication
    │
    ▼
Who is the user?
    │
    ▼
Authorization
    │
    ▼
What can this user do?
```

The backend authentication middleware establishes `req.user` from a
verified JWT, while budget services use budget membership and roles to
enforce resource-level permissions. fileciteturn6file0L54-L85
fileciteturn6file6L720-L792

------------------------------------------------------------------------

# 1. Security Model Overview

WalletFlow's security model can be represented as:

``` text
Credentials
    │
    ▼
Authentication Service
    │
    ▼
JWT
    │
    ├──────────────────┐
    ▼                  ▼
REST Client        Socket.IO Client
    │                  │
    ▼                  ▼
JWT Middleware     Socket Auth
    │                  │
    ▼                  ▼
req.user           socket.user
    │                  │
    └─────────┬────────┘
              ▼
        Resource Access
              │
              ▼
      Budget Membership
              │
              ▼
         Budget Role
```

The important architectural rule is:

> A valid JWT establishes identity; it does not by itself grant access
> to every resource.

------------------------------------------------------------------------

# 2. Authentication Components

The authentication implementation spans:

``` text
Backend
├── routes/auth.js
├── controllers/authController.js
├── services/authService.js
├── middleware/auth.js
├── config/jwt.js
└── models/User.js

Frontend
├── context/AuthContext.js
├── hooks/useAuth.js
├── services/authAPI.js
├── services/api.js
└── components/Auth/*
```

Password-reset behavior additionally uses:

``` text
services/emailService.js
```

------------------------------------------------------------------------

# 3. Registration Flow

The registration flow is:

``` text
Registration Form
       │
       ▼
authAPI.register()
       │
       ▼
POST /auth/register
       │
       ▼
authController.register
       │
       ▼
authService.registerUser
       │
       ├── Check email
       ├── Hash password
       └── Create user
       │
       ▼
201 Created
```

The backend registration controller reads:

``` text
username
email
password
```

and delegates to the authentication service.
fileciteturn6file8L887-L904

------------------------------------------------------------------------

# 4. Duplicate Email Protection

During registration, the authentication service first checks whether the
email already exists.

If an account is already associated with the email, the service throws:

``` text
409 Conflict
```

with the message:

``` text
An account with this email already exists.
```

The source explicitly implements this check before password hashing/user
creation. fileciteturn6file0L61-L74

------------------------------------------------------------------------

# 5. Password Hashing

WalletFlow does not store the user's plaintext password.

The registration service uses:

``` text
bcryptjs
```

and hashes the supplied password with a cost factor of:

``` text
10
```

Conceptually:

``` text
Plaintext password
       │
       ▼
bcrypt.hash(password, 10)
       │
       ▼
password_hash
       │
       ▼
Database
```

The implementation performs this hashing before creating the user.
fileciteturn6file0L65-L74

------------------------------------------------------------------------

# 6. Login Flow

The login flow is:

``` text
Login Form
    │
    ▼
authAPI.login()
    │
    ▼
POST /auth/login
    │
    ▼
authController.login
    │
    ▼
authService.loginUser
    │
    ├── Find user by email
    ├── Compare password
    └── Return safe user object
    │
    ▼
JWT creation
    │
    ▼
Token + user
    │
    ▼
Frontend
```

The backend login controller explicitly creates the JWT after successful
authentication. fileciteturn6file8L906-L934

------------------------------------------------------------------------

# 7. Password Verification

Login uses:

``` text
bcrypt.compare(password, user.password_hash)
```

If the email does not identify a user or the password does not match,
the authentication service returns `null`.

The controller then responds with:

``` text
401 Invalid credentials
```

This keeps the login failure response generic rather than distinguishing
between:

``` text
unknown email
```

and:

``` text
incorrect password
```

The implementation establishes this behavior.
fileciteturn6file0L77-L86 fileciteturn6file8L909-L915

------------------------------------------------------------------------

# 8. Password Hash Removal

After successful password verification, the authentication service
removes:

``` text
password_hash
```

from the user object before returning it.

This prevents the password hash from being passed onward as part of the
authenticated user result. fileciteturn6file0L79-L85

------------------------------------------------------------------------

# 9. JWT Creation

After successful login, the controller creates a JWT.

The current payload contains:

``` text
id
email
```

The token is signed with:

``` text
jwtConfig.secret
```

and configured with:

``` text
jwtConfig.expiresIn
```

The implementation then returns:

``` json
{
  "message": "Login successful",
  "token": "...",
  "user": {
    "id": "...",
    "username": "...",
    "email": "...",
    "avatar_url": "..."
  }
}
```

The exact user fields are established by the current controller.
fileciteturn6file8L917-L930

------------------------------------------------------------------------

# 10. JWT Is an Identity Token

The JWT payload currently carries:

``` text
id
email
```

It does not represent a complete user profile.

The application retrieves the full profile separately.

Therefore:

``` text
JWT
  └── identity claims

User profile
  └── application profile data
```

These should not be treated as the same data object.

------------------------------------------------------------------------

# 11. JWT Configuration

JWT configuration is separated into:

``` text
src/config/jwt.js
```

The controller consumes this configuration rather than embedding the
signing secret or expiration directly into login logic.

This keeps authentication configuration separate from request handling.

------------------------------------------------------------------------

# 12. Production JWT Secret

Production environment validation explicitly requires:

``` text
JWT_SECRET
```

and rejects the known development/default secret.

If production uses the default secret, environment validation raises a
security error and startup configuration is considered invalid.
fileciteturn6file1L205-L245

This is a critical deployment requirement.

------------------------------------------------------------------------

# 13. Frontend Token Storage

After successful login, `AuthContext` stores the returned token in:

``` text
localStorage
```

using the key:

``` text
token
```

The context then updates:

``` text
token
user
```

state. fileciteturn6file3L383-L412

------------------------------------------------------------------------

# 14. Frontend Authentication State

`AuthContext` exposes:

``` text
user
token
loading
isAuthenticated
login
register
logout
forgotPassword
updateProfile
resetPassword
```

This makes authentication a global application concern rather than a
property of only the login page. fileciteturn6file3L438-L455

------------------------------------------------------------------------

# 15. Startup Session Validation

When the frontend starts, `AuthContext` reads the stored token.

If a token exists, it calls:

``` text
GET /auth/profile
```

to validate the session and retrieve the current user.

Conceptually:

``` text
Browser starts
    │
    ▼
Read localStorage token
    │
    ├── no token → unauthenticated
    │
    └── token exists
          │
          ▼
      /auth/profile
          │
      ┌───┴────┐
      ▼        ▼
    valid    failure
      │        │
      ▼        ▼
    set user  remove token
```

The current `AuthContext` implements this startup validation.
fileciteturn6file3L383-L404

------------------------------------------------------------------------

# 16. Initial Loading Gate

`AuthContext` maintains:

``` text
loading
```

while the initial token/profile validation is occurring.

The provider does not render its children until the initial
authentication check has completed.

This prevents the application from immediately rendering
authenticated/unauthenticated UI before the stored session has been
evaluated. fileciteturn6file3L386-L404
fileciteturn6file3L451-L455

------------------------------------------------------------------------

# 17. REST Authorization Header

The shared Axios client reads the token from:

``` text
localStorage
```

and attaches:

``` http
Authorization: Bearer <token>
```

to outgoing API requests.

This behavior is centralized in:

``` text
src/services/api.js
```

rather than duplicated across each API service.
fileciteturn6file5L608-L632

------------------------------------------------------------------------

# 18. Protected REST Routes

Authentication middleware is applied to protected route groups.

For example, the transaction router applies:

``` text
authenticateToken
```

to all transaction routes before defining:

``` text
GET /
POST /
PUT /:id
DELETE /:id
GET /budget/:budgetId
```

The user router similarly applies authentication to its routes.
fileciteturn6file0L11-L36 fileciteturn6file0L39-L51

------------------------------------------------------------------------

# 19. REST Authentication Middleware

The middleware performs:

``` text
Read Authorization header
       │
       ▼
Extract Bearer token
       │
       ▼
Verify JWT
       │
       ▼
Attach decoded identity
       │
       ▼
req.user
```

The decoded user identity becomes available to downstream
controllers/services.

This is the bridge between authentication and authorization.

------------------------------------------------------------------------

# 20. `req.user`

After successful JWT verification, backend code can access:

``` text
req.user.id
req.user.email
```

based on the current JWT payload.

Controllers commonly use:

``` text
req.user.id
```

as the authenticated user identity when retrieving resources.

For example, the budget controller passes `req.user.id` into the budget
service when listing budgets. fileciteturn6file8L987-L996

------------------------------------------------------------------------

# 21. Protected Profile Endpoint

The profile endpoint uses the identity from:

``` text
req.user.id
```

rather than accepting an arbitrary user ID for the current profile.

The controller calls:

``` text
authService.findUserById(req.user.id)
```

and returns the authenticated user's profile fields.
fileciteturn6file8L936-L955

This is an important identity boundary.

------------------------------------------------------------------------

# 22. Session Expiration on the Frontend

The shared Axios response interceptor handles:

``` text
HTTP 401
```

by:

``` text
Remove token
Redirect to /login
```

The implementation performs this behavior globally.
fileciteturn6file5L634-L647

Therefore an authenticated page can transition back to the login page
when an API request establishes that the current authentication is no
longer accepted.

------------------------------------------------------------------------

# 23. Logout

Frontend logout is client-side token invalidation.

The current `AuthContext.logout()`:

``` text
Remove localStorage token
Set token = null
Set user = null
```

There is no backend logout endpoint established in the supplied
authentication flow.

Therefore the current model is:

``` text
JWT remains valid until expiration
        │
        ▼
Browser stops using it after logout
```

This distinction is important for security documentation.

------------------------------------------------------------------------

# 24. Password Reset Overview

WalletFlow implements a password-reset workflow:

``` text
Forgot password
      │
      ▼
Generate reset token
      │
      ▼
Hash reset token
      │
      ▼
Store hash + expiry
      │
      ▼
Email raw token
      │
      ▼
User opens reset link
      │
      ▼
Submit token + new password
      │
      ▼
Hash incoming token
      │
      ▼
Find matching stored token
      │
      ▼
Reset password
```

The implementation uses Node's `crypto` module for reset-token
generation and hashing. fileciteturn6file0L95-L125

------------------------------------------------------------------------

# 25. Password Reset Token Generation

The service generates:

``` text
crypto.randomBytes(32)
```

and converts it to hexadecimal.

The raw token is not stored directly.

Instead:

``` text
raw reset token
       │
       ▼
SHA-256
       │
       ▼
stored reset-token hash
```

The raw token is sent to the user through email.
fileciteturn6file0L96-L110

------------------------------------------------------------------------

# 26. Password Reset Expiration

The reset token expiry is set to:

``` text
1 hour
```

The service calculates:

``` text
Date.now() + 3600000
```

and stores that expiration alongside the hashed token.
fileciteturn6file0L102-L107

------------------------------------------------------------------------

# 27. Password Reset Enumeration Protection

The forgot-password operation deliberately returns the same
success-style message regardless of whether the email belongs to a user:

``` text
If a user with that email exists, a reset link has been sent.
```

This prevents the endpoint from directly revealing whether a specific
email address is registered.

The source explicitly documents and implements this behavior.
fileciteturn6file0L99-L113

------------------------------------------------------------------------

# 28. Password Reset Email

The email service creates a reset URL using:

``` text
FRONTEND_URL
```

and the raw reset token.

The URL follows the frontend route:

``` text
/reset-password?token=<token>
```

The raw token is therefore transmitted through the reset link while only
the hash is persisted server-side. fileciteturn6file7L834-L845

------------------------------------------------------------------------

# 29. Reset Password Request

The reset endpoint expects:

``` text
token
newPassword
```

The controller validates that both are present before calling the
service.

Missing values produce:

``` text
400
```

with a message indicating that both are required.
fileciteturn6file8L970-L984

------------------------------------------------------------------------

# 30. Reset Token Verification

When resetting the password, the service:

``` text
Incoming raw token
       │
       ▼
SHA-256 hash
       │
       ▼
Find user by hashed reset token
```

If no valid user/token combination is found, the operation fails with an
invalid/expired-token error.

This prevents the database from needing to store the raw reset token.
fileciteturn6file0L117-L125

------------------------------------------------------------------------

# 31. Budget Authorization

Budget authorization is more granular than authentication.

The service checks:

``` text
BudgetUser.findUserInBudget(budgetId, userId)
```

before permitting protected budget operations.

If the user has no membership, the service returns:

``` text
403 Forbidden
```

with an access-denied error. fileciteturn6file6L733-L741

------------------------------------------------------------------------

# 32. Budget Roles

The implemented budget roles are:

``` text
owner
editor
viewer
```

These roles are attached to the user-budget relationship.

The current source implements different update/delete capabilities based
on these roles.

------------------------------------------------------------------------

# 33. Owner Authorization

For budget updates, an owner can update the budget through the normal
budget update operation.

The service explicitly checks:

``` text
userRole.role === 'owner'
```

and allows the budget update path. fileciteturn6file6L743-L759

------------------------------------------------------------------------

# 34. Editor Authorization

Editors have a deliberately narrower update capability.

The current implementation allows an editor to:

``` text
Increase total budget amount
```

but rejects changes to other budget fields and rejects an amount that
does not increase the original amount.

If an invalid change is attempted, the service returns:

``` text
403 Forbidden
```

The exact rule is implemented in `budgetService.updateBudget()`.
fileciteturn6file6L761-L785

------------------------------------------------------------------------

# 35. Viewer Authorization

Viewers cannot modify the budget.

The service explicitly rejects modification attempts with:

``` text
403 Forbidden
```

and the message:

``` text
Forbidden: Viewers cannot modify the budget.
```

fileciteturn6file6L787-L791

------------------------------------------------------------------------

# 36. Budget Deletion Authorization

Budget deletion is restricted to owners.

The service checks:

``` text
userRole.role === 'owner'
```

before permitting deletion.

Non-owners are rejected with:

``` text
403 Forbidden
```

The implementation begins this check directly in `deleteBudget()`.
fileciteturn6file6L794-L797

------------------------------------------------------------------------

# 37. Frontend Role-Aware UI

The frontend also reflects budget roles in the UI.

For example, `BudgetCard` shows:

``` text
View
```

for general users, while:

``` text
Adjust
Share
```

are shown for:

``` text
editor
owner
```

and:

``` text
Edit
Delete
```

are shown for:

``` text
owner
```

The source explicitly implements these role-based UI controls.
fileciteturn6file2L284-L306

------------------------------------------------------------------------

# 38. UI Authorization Is Not Security Authorization

The frontend role checks are useful for user experience, but they must
not be treated as the security boundary.

For example:

``` text
Frontend hides Delete
```

does not secure the endpoint.

The backend must independently enforce:

``` text
Only owner can delete
```

and the backend budget service does perform this enforcement.

------------------------------------------------------------------------

# 39. Invitation Authorization Flow

Budget invitations connect authentication to collaboration.

Conceptually:

``` text
Authenticated inviter
       │
       ▼
Create invitation
       │
       ▼
Invitation token
       │
       ▼
Invitee receives link
       │
       ▼
Invitee authenticates
       │
       ▼
Accept invitation
       │
       ▼
Budget membership
```

The invitation service accepts both:

``` text
token
userId
```

as inputs. fileciteturn6file7L864-L876

------------------------------------------------------------------------

# 40. Invitation and Authentication Interaction

The frontend login component explicitly supports a pending invitation
flow.

After login, it checks for a stored pending invitation token and
redirects the authenticated user to:

``` text
/accept-invitation?token=...
```

This means invitation acceptance can begin before authentication and
resume after login.

The current login component implements this redirect behavior.
fileciteturn6file9L1049-L1088

------------------------------------------------------------------------

# 41. Invitation Security Model

The invitation token represents the invitation workflow.

The authenticated user identity is separately supplied when accepting
the invitation.

Conceptually:

``` text
Invitation token
     │
     └── Which invitation?

Authenticated user
     │
     └── Who is accepting?
```

These should not be collapsed into one concept.

------------------------------------------------------------------------

# 42. Notification Ownership

Notifications are user-scoped.

The notification controller uses:

``` text
req.user.id
```

when retrieving notifications.

For marking a notification read, the model operation also receives:

``` text
notificationId
userId
```

This creates an ownership-aware mutation boundary.

fileciteturn5file9L1216-L1249

------------------------------------------------------------------------

# 43. Socket Authentication

REST and Socket.IO have separate transport mechanisms but share the same
identity concept.

The socket connection authenticates using a JWT from the handshake.

The backend accepts the token from:

``` text
socket.handshake.auth.token
```

or:

``` text
socket.handshake.query.token
```

and verifies it before attaching the decoded user to the socket.
fileciteturn4file9L1093-L1147

------------------------------------------------------------------------

# 44. Socket User Identity

After authentication:

``` text
socket.user
```

contains the decoded token identity.

The socket then joins a user-specific room.

Conceptually:

``` text
JWT
 │
 ▼
verify
 │
 ▼
socket.user
 │
 ▼
user:<id> room
```

This allows real-time events to be associated with authenticated users.

------------------------------------------------------------------------

# 45. Socket Authentication Failure

A socket connection that cannot be authenticated is rejected during the
connection lifecycle.

This is important because Socket.IO must not be treated as an
unauthenticated alternative path around REST authorization.

The socket layer establishes identity before registering normal
authenticated user behavior.

------------------------------------------------------------------------

# 46. Budget Socket Authorization

The existence of an authenticated socket does not automatically mean the
user belongs to every budget.

Budget-room membership should therefore remain tied to budget access.

The source establishes authenticated sockets and budget-room event
handling, but a complete security contract for every socket event should
be derived from the full socket/budget implementation before expanding
it further.

------------------------------------------------------------------------

# 47. Authentication vs Authorization Matrix

  ---------------------------------------------------------------------------------
  Layer                   Question                Current mechanism
  ----------------------- ----------------------- ---------------------------------
  Registration            Can an account be       Email uniqueness + password hash
                          created?                

  Login                   Are credentials valid?  bcrypt comparison

  REST session            Is request              JWT middleware
                          authenticated?          

  Profile                 Which user is           `req.user.id`
                          requesting?             

  Budget access           Is user a member?       `BudgetUser.findUserInBudget()`

  Budget update           What can member modify? owner/editor/viewer rules

  Budget delete           Who may delete?         owner only

  Notifications           Does notification       user-scoped model operations
                          belong to user?         

  Socket session          Is socket               JWT handshake verification
                          authenticated?          

  Invitation              Who accepts invitation? authenticated user + invitation
                                                  token
  ---------------------------------------------------------------------------------

------------------------------------------------------------------------

# 48. Security-Sensitive Data

The following data requires special handling:

``` text
Password
JWT secret
JWT token
Password-reset token
Invitation token
Database credentials
Email credentials
Redis credentials
```

The repository already takes several precautions:

``` text
Password → bcrypt hash
Reset token → SHA-256 hash before persistence
JWT secret → environment configuration
Production default JWT secret → rejected
```

------------------------------------------------------------------------

# 49. Secrets vs Tokens

Do not confuse:

### JWT secret

A server-side signing secret.

``` text
JWT_SECRET
```

It must never be exposed to the browser.

### JWT token

A client-held authentication credential.

``` text
Authorization: Bearer <token>
```

It is intentionally returned to the authenticated frontend.

### Password-reset token

A short-lived credential for password recovery.

It is sent to the user but only its hash is stored.

### Invitation token

A credential used by the invitation workflow.

------------------------------------------------------------------------

# 50. Authentication Failure Handling

The current implementation uses different failure semantics depending on
the operation.

Examples:

``` text
Duplicate registration → 409
Invalid login → 401
Missing REST credentials → 401
Invalid/expired REST JWT → 403
Missing reset token/new password → 400
Invalid/expired reset token → service error
Non-member budget access → 403
Viewer budget modification → 403
Non-owner budget deletion → 403
```

These distinctions are part of the current implementation and should be
preserved when changing API behavior unless the API contract is
intentionally revised.

------------------------------------------------------------------------

# 51. Security Configuration Requirements

For production, at minimum the current configuration requires:

``` text
DATABASE_URL
JWT_SECRET
FRONTEND_URL
```

and specifically rejects the known default JWT secret.

The environment module validates these production requirements before
the application can operate normally. fileciteturn6file1L205-L245

------------------------------------------------------------------------

# 52. Security Boundary: Browser

The browser should be treated as an untrusted environment.

The frontend can:

``` text
Store token
Display user state
Hide unauthorized controls
Send authenticated requests
```

but the backend must remain authoritative for:

``` text
Identity verification
Resource ownership
Membership
Role permissions
Mutation authorization
```

------------------------------------------------------------------------

# 53. Security Boundary: Backend

The backend is the authoritative authorization boundary.

A request should not be considered safe merely because:

``` text
req.user exists
```

For resource operations, the implementation should also verify:

``` text
Does this user have access?
What role do they have?
What operation does that role permit?
```

The budget service demonstrates this pattern through membership/role
checks. fileciteturn6file6L733-L791

------------------------------------------------------------------------

# 54. Recommended Authorization Review Procedure

When adding a protected endpoint:

### Step 1

Require authentication middleware.

### Step 2

Obtain:

``` text
req.user.id
```

### Step 3

Identify the target resource.

### Step 4

Verify resource membership/ownership.

### Step 5

Determine the user's role.

### Step 6

Check whether that role permits the requested operation.

### Step 7

Only then perform the mutation.

Conceptually:

``` text
Authenticate
    ↓
Identify
    ↓
Authorize
    ↓
Mutate
```

------------------------------------------------------------------------

# 55. Common Security Mistakes to Avoid

Do not rely on:

``` text
Frontend role checks
```

alone.

Do not accept:

``` text
userId
```

from the client as proof of identity when the authenticated identity is
already available in:

``` text
req.user.id
```

Do not return:

``` text
password_hash
```

to the frontend.

Do not store password-reset tokens in plaintext when the existing
workflow hashes them before persistence.

Do not use the known default JWT secret in production.

Do not treat a valid JWT as proof of access to every budget.

------------------------------------------------------------------------

# 56. Authentication Change Workflow

When changing authentication:

``` text
1. Check frontend AuthContext
2. Check authAPI
3. Check shared Axios client
4. Check auth route
5. Check auth controller
6. Check auth service
7. Check JWT configuration
8. Check auth middleware
9. Check User model/schema
10. Update authentication tests
```

Authentication changes cross multiple layers.

------------------------------------------------------------------------

# 57. Authorization Change Workflow

When changing authorization for a budget operation:

``` text
1. Identify endpoint
2. Verify route authentication
3. Inspect controller identity source
4. Inspect budget service
5. Inspect BudgetUser model
6. Inspect schema role definition
7. Check frontend role-based UI
8. Add/update tests
```

The backend service should remain the authoritative enforcement point.

------------------------------------------------------------------------

# 58. Authentication Debugging Workflow

For a failing authenticated REST request:

``` text
Request
  │
  ▼
Does Authorization header exist?
  │
  ▼
Is Bearer token extracted?
  │
  ▼
Does JWT verify?
  │
  ▼
Is req.user populated?
  │
  ▼
Does resource authorization succeed?
  │
  ▼
Does service operation succeed?
```

For a failing socket connection:

``` text
Socket connection
  │
  ▼
Token supplied?
  │
  ▼
JWT verifies?
  │
  ▼
socket.user populated?
  │
  ▼
User room joined?
  │
  ▼
Budget access/room event succeeds?
```

------------------------------------------------------------------------

# 59. Security Architecture Summary

WalletFlow's current security architecture is:

``` text
                    USER
                     │
              ┌──────┴──────┐
              ▼             ▼
        Email/password    Invitation
              │             │
              ▼             ▼
        Auth Service    Invitation Service
              │             │
              ▼             ▼
             JWT       Budget Membership
              │
       ┌──────┴───────┐
       ▼              ▼
     REST          Socket.IO
       │              │
       ▼              ▼
   JWT Middleware   JWT Handshake
       │              │
       ▼              ▼
    req.user       socket.user
       │              │
       └──────┬───────┘
              ▼
       Resource Authorization
              │
              ▼
       Budget Membership
              │
       ┌──────┼──────┐
       ▼      ▼      ▼
     owner  editor viewer
```

The key security principle is:

> **Authentication establishes identity; authorization establishes
> permission; the backend remains the authoritative enforcement
> boundary.**

------------------------------------------------------------------------

# 60. Next Part

**Part 9 --- API Contract & Endpoint Reference**

The next document will turn the implementation into an engineer-facing
API reference:

-   API base path
-   Authentication endpoints
-   Budget endpoints
-   Transaction endpoints
-   User endpoints
-   Category endpoints
-   Invitation endpoints
-   Notification endpoints
-   Report endpoints
-   Authentication requirements
-   Request/response behavior
-   Status codes supported by the source
-   Authorization requirements
-   Frontend service → backend endpoint mapping
-   Socket event contract
-   API error conventions
-   Endpoint implementation navigation
