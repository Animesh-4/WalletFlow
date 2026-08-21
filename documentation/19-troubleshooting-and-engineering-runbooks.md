# WalletFlow --- Troubleshooting & Engineering Runbooks

## Part 19 --- Diagnostic Procedures, Failure Modes & Recovery

This document consolidates practical troubleshooting procedures for
WalletFlow.

It is based on the repository's established architecture:

``` text
Frontend
Backend
PostgreSQL / Neon
Socket.IO
Optional Redis
Email workflows
JWT authentication
Drizzle
Jest
```

The purpose of this document is to provide an engineer with a
deterministic path from:

``` text
Observed symptom
      │
      ▼
Likely boundary
      │
      ▼
Diagnostic checks
      │
      ▼
Safe remediation
      │
      ▼
Verification
```

Where the repository does not establish a specific operational command,
provider, or infrastructure mechanism, the procedure is presented as a
diagnostic recommendation rather than an existing project command.

------------------------------------------------------------------------

# 1. General Troubleshooting Method

Do not begin by changing code.

Use:

``` text
1. Observe
2. Reproduce
3. Identify failing boundary
4. Inspect evidence
5. Form hypothesis
6. Make smallest safe change
7. Verify
8. Run regression tests
```

The primary boundaries are:

``` text
Browser
API
Authentication
Authorization
Service
Database
Socket.IO
Redis
Email
Deployment
```

------------------------------------------------------------------------

# 2. Failure-Boundary Model

Use this sequence:

``` text
User action
    │
    ▼
Frontend state
    │
    ▼
HTTP / Socket request
    │
    ▼
Backend middleware
    │
    ▼
Controller
    │
    ▼
Service
    │
    ▼
Database / external system
```

For real-time problems:

``` text
Socket client
    │
    ▼
Handshake authentication
    │
    ▼
Socket handler
    │
    ▼
Room membership
    │
    ▼
Event emission
    │
    ▼
Receiving client
```

------------------------------------------------------------------------

# 3. Backend Does Not Start

## Symptoms

Examples:

``` text
Process exits immediately
Database initialization fails
Configuration error
Port binding failure
```

## Checks

``` text
NODE_ENV
PORT
DATABASE_URL
JWT_SECRET
```

Then inspect:

``` text
startup logs
database connectivity
port availability
```

The database initialization is a startup dependency in the current
backend architecture. fileciteturn5file7L987-L1022

## Resolution

Fix the first initialization failure rather than suppressing subsequent
errors.

------------------------------------------------------------------------

# 4. Production Backend Refuses to Start

## Symptom

Production startup fails around JWT configuration.

## Check

``` text
NODE_ENV=production
JWT_SECRET
```

The backend rejects the known default/development JWT secret in
production. fileciteturn6file1L205-L245

## Resolution

Configure a unique production JWT secret through the deployment secret
mechanism.

Do not modify the validation merely to make deployment start.

------------------------------------------------------------------------

# 5. Port Failure

## Symptom

Backend cannot bind to its configured port.

## Checks

``` text
PORT
existing process
deployment port mapping
```

The backend normally uses:

``` text
5000
```

unless overridden.

## Resolution

Use the port expected by the deployment platform and ensure only the
intended process is bound to it.

------------------------------------------------------------------------

# 6. Database Connection Failure

## Symptoms

``` text
Backend startup failure
500 responses
Authentication failures
Budget failures
Transaction failures
```

## Checks

``` text
DATABASE_URL
Database provider status
Network connectivity
Credentials
Database availability
```

## Resolution

Correct the connection configuration or restore database availability.

Do not change domain logic until database health is confirmed.

------------------------------------------------------------------------

# 7. Database Works but Tables Are Missing

## Symptom

Application starts but requests fail because expected tables/columns are
unavailable.

## Checks

``` text
DATABASE_URL
Current schema
Drizzle configuration
```

## Development resolution

Use the repository's schema command:

``` bash
npm run db:push
```

Then seed development data if appropriate:

``` bash
npm run db:seed
```

## Production

Do not blindly run schema operations against production.

First verify the approved production schema-change procedure.

------------------------------------------------------------------------

# 8. Wrong Database Environment

## Symptom

Expected users, budgets, or categories are missing.

## Check

Compare the effective:

``` text
DATABASE_URL
```

used by:

``` text
db:push
db:seed
backend runtime
```

All three may be targeting different environments.

## Resolution

Correct the environment configuration before modifying data.

------------------------------------------------------------------------

# 9. Database Seed Failure

## Symptom

``` bash
npm run db:seed
```

fails.

## Checks

``` text
DATABASE_URL
database connectivity
NODE_ENV
seed logs
```

Production seed behavior is protected by:

``` text
FORCE_SEED_PRODUCTION=true
```

when explicitly required by the seed implementation.

## Resolution

For normal development, use a development database and avoid production
seed overrides.

------------------------------------------------------------------------

# 10. Frontend Starts but API Calls Fail

## Symptom

The React application loads but data cannot be fetched.

## Checks

``` text
REACT_APP_API_URL
Backend running
Browser Network tab
CORS
```

The current API client uses:

``` text
REACT_APP_API_URL
```

with a localhost fallback of:

``` text
http://localhost:5000/api
```

fileciteturn6file5L608-L632

## Resolution

Confirm the frontend was built/run with the correct API URL.

------------------------------------------------------------------------

# 11. Frontend API URL Changed but Browser Still Uses Old URL

## Cause

Frontend environment values are build-time configuration.

## Resolution

Rebuild/restart the frontend after changing:

``` env
REACT_APP_API_URL=...
```

Verify the actual browser request URL rather than relying on the
environment file alone.

------------------------------------------------------------------------

# 12. CORS Failure

## Symptom

Browser reports a CORS error.

## Checks

``` text
Browser origin
FRONTEND_URL
API URL
Protocol
Port
```

The backend CORS configuration uses the configured frontend origin.
fileciteturn5file2L337-L354

## Resolution

Make:

``` text
Browser origin
      ==
FRONTEND_URL
```

and restart the backend after changing backend environment
configuration.

------------------------------------------------------------------------

# 13. Login Returns 401

## Checks

``` text
Email
Password
Database user
Password hash
Backend logs
```

The expected authentication failure is:

``` text
Invalid credentials
```

Do not expose whether the email or password specifically was incorrect.

------------------------------------------------------------------------

# 14. Login Succeeds but User Immediately Appears Logged Out

## Symptoms

``` text
Login returns success
Application redirects/returns to login
Protected request returns 401
```

## Checks

``` text
Token stored?
Authorization header attached?
JWT valid?
JWT expired?
JWT_SECRET consistent?
/auth/profile succeeds?
```

The frontend API client adds the bearer token to requests and clears the
token/redirects to login after a `401`. fileciteturn6file5L620-L647

------------------------------------------------------------------------

# 15. Profile Request Fails After Login

Trace:

``` text
Login
  │
  ▼
Token persistence
  │
  ▼
GET /auth/profile
  │
  ▼
Authorization header
  │
  ▼
JWT middleware
  │
  ▼
User lookup
```

If the token is valid but profile lookup fails, investigate
database/user-state problems rather than frontend login state first.

------------------------------------------------------------------------

# 16. Invalid JWT

## Symptoms

``` text
Protected API returns authentication failure
Socket authentication fails
Users unexpectedly log out
```

## Checks

``` text
JWT_SECRET
JWT_EXPIRES_IN
Token age
Deployment version
Multiple backend instances
```

If multiple backend instances exist, they must use compatible JWT
configuration.

------------------------------------------------------------------------

# 17. Secret Mismatch Across Backend Instances

## Symptom

Some requests succeed while others return JWT failures.

## Likely cause

Different backend instances may have different:

``` text
JWT_SECRET
```

## Resolution

Ensure all instances use the same intended production signing
configuration.

Then determine how existing sessions should be handled if the secret was
changed.

------------------------------------------------------------------------

# 18. Registration Fails

## Symptom

Registration request fails.

## Checks

``` text
Request payload
Validation
Email format
Existing user
Database
```

For duplicate email, the expected behavior is a conflict rather than an
infrastructure failure.

------------------------------------------------------------------------

# 19. Duplicate Email Registration

## Symptom

Registration returns:

``` text
409 Conflict
```

## Interpretation

This is expected when the email already exists.

Do not treat every `409` as a server incident.

------------------------------------------------------------------------

# 20. Password Reset Request Fails

Trace:

``` text
Forgot-password request
      │
      ▼
User lookup
      │
      ▼
Reset token
      │
      ▼
Token persistence
      │
      ▼
Email
```

Check:

``` text
Database
Email configuration
Email provider
FRONTEND_URL
```

The implementation intentionally avoids revealing whether the email
exists to the client. fileciteturn6file0L109-L113

------------------------------------------------------------------------

# 21. Password Reset Link Is Wrong

## Checks

``` text
FRONTEND_URL
Frontend deployment URL
Generated email
```

The current reset link format is:

``` text
/reset-password?token=<token>
```

and is built using the configured frontend URL.
fileciteturn6file7L834-L845

## Resolution

Correct `FRONTEND_URL` and regenerate a reset request.

------------------------------------------------------------------------

# 22. Password Reset Token Is Invalid

## Checks

``` text
Token copied correctly
Token expired
Token already used
Database token hash
Reset URL
```

The current reset token has a one-hour expiration.
fileciteturn6file0L95-L125

Do not log or manually expose raw reset tokens.

------------------------------------------------------------------------

# 23. Invitation Link Is Wrong

## Checks

``` text
FRONTEND_URL
Invitation URL
Frontend route
Invitation token
```

The current invitation URL uses:

``` text
/accept-invitation?token=<token>
```

fileciteturn6file7L847-L857

------------------------------------------------------------------------

# 24. Invitation Acceptance Fails

Trace:

``` text
Invitation page
    │
    ▼
Authentication
    │
    ▼
Invitation token
    │
    ▼
Invitation lookup
    │
    ▼
Budget membership
```

Check:

``` text
Authenticated user
Invitation validity
Invitation status
Budget existence
Existing membership
Database state
```

------------------------------------------------------------------------

# 25. Budget Cannot Be Loaded

## Checks

``` text
Authentication
Budget ID
Membership
Database
Backend logs
```

Remember:

``` text
Authenticated
```

does not automatically mean:

``` text
Member of budget
```

------------------------------------------------------------------------

# 26. Viewer Cannot Modify Budget

## Symptom

Viewer receives:

``` text
403
```

## Interpretation

This may be expected.

The current budget service restricts budget modifications by role.
fileciteturn6file6L733-L797

First confirm the user's actual role before changing code.

------------------------------------------------------------------------

# 27. Editor Cannot Perform an Operation

Check the specific operation.

The current service allows editor budget updates only within defined
conditions, including budget increases.

Do not generalize:

``` text
editor = full write access
```

The role is operation-specific.

------------------------------------------------------------------------

# 28. Non-Owner Cannot Delete Budget

## Symptom

Deletion returns:

``` text
403
```

## Interpretation

This is expected under the current owner-only deletion rule.
fileciteturn6file6L794-L797

Verify the authenticated user's role before changing authorization.

------------------------------------------------------------------------

# 29. Transaction Creation Fails

## Checks

``` text
Authentication
Budget membership
Transaction payload
Amount/date/category
Database
```

Trace:

``` text
Frontend
  │
  ▼
Transaction API
  │
  ▼
Route
  │
  ▼
Controller
  │
  ▼
Transaction service
  │
  ▼
Database
```

------------------------------------------------------------------------

# 30. Transaction Update/Delete Fails

First determine:

``` text
Is this validation?
Is this authorization?
Is the transaction missing?
Is the database failing?
```

Do not assume every transaction error is a persistence problem.

------------------------------------------------------------------------

# 31. Reports Are Incorrect

## Checks

``` text
Source transactions
Date range
Transaction types
Category mapping
Budget
Backend report service
```

Verify the underlying transaction data before debugging the frontend
chart.

The backend should remain authoritative for report calculations.

------------------------------------------------------------------------

# 32. Notifications Are Missing

Trace:

``` text
Notification creation
      │
      ▼
Database record
      │
      ▼
GET notifications
      │
      ▼
Authenticated user
      │
      ▼
Frontend state
```

Check whether the notification exists in the database before
investigating React rendering.

------------------------------------------------------------------------

# 33. Notification Belongs to Wrong User

Treat as a security incident.

Check:

``` text
Notification owner
Authenticated user ID
Controller query
Service ownership logic
```

The notification controller passes the authenticated user identity into
service operations. fileciteturn5file9L1216-L1249

------------------------------------------------------------------------

# 34. Socket Does Not Connect

## Checks

``` text
Backend running
Socket.IO server initialized
Frontend socket URL
JWT token
JWT_SECRET
Browser network/WebSocket activity
```

Then inspect the Socket.IO handshake.

------------------------------------------------------------------------

# 35. Socket Authentication Fails

The backend expects a token through the Socket.IO handshake.

Check:

``` text
socket.handshake.auth.token
```

or the supported query-token path.

Then verify:

``` text
Token validity
JWT_SECRET
Token expiration
```

The server establishes `socket.user` only after successful JWT
verification. fileciteturn4file9L1093-L1147

------------------------------------------------------------------------

# 36. Socket Connects but Budget Updates Do Not Arrive

Trace:

``` text
Connected
  │
  ▼
Authenticated
  │
  ▼
Joined correct budget room
  │
  ▼
Backend mutation succeeded
  │
  ▼
Event emitted
  │
  ▼
Client listener registered
  │
  ▼
React state updated
```

Check each boundary independently.

------------------------------------------------------------------------

# 37. One User Sees Updates but Another Does Not

Possible causes:

``` text
Different budget room
Missing membership
Listener not registered
Different backend instance
Redis coordination issue
```

If multiple backend instances are deployed, verify Redis configuration
and cross-instance Socket.IO behavior.

------------------------------------------------------------------------

# 38. Redis Problem

## Symptoms

``` text
Real-time events fail across instances
Socket coordination inconsistent
Redis connection errors
```

## Checks

``` text
REDIS_URL
Redis availability
Network access
Credentials
All backend instances using same Redis
```

Remember that Redis adapter coordination and process-local presence
state are separate concerns.

------------------------------------------------------------------------

# 39. Live User Count Is Incorrect

The current presence implementation uses process-local state.

Therefore:

``` text
Single instance
```

and:

``` text
Multiple instances
```

can produce different consistency characteristics.

Do not assume Redis adapter presence synchronization exists merely
because Redis is configured.

------------------------------------------------------------------------

# 40. Email Sending Fails

## Checks

``` text
EMAIL_USER
EMAIL_PASS
EMAIL
Provider status
Network access
Frontend URL
```

Determine whether failure occurs at:

``` text
Configuration
Authentication
Provider
Application
```

------------------------------------------------------------------------

# 41. Email Arrives but Link Fails

This usually indicates:

``` text
FRONTEND_URL
Frontend route
Token
```

rather than an email transport problem.

Test the link directly in the production frontend.

------------------------------------------------------------------------

# 42. API Returns 500

## First steps

``` text
1. Capture route
2. Capture request ID if available
3. Inspect backend logs
4. Identify controller/service
5. Check database
6. Reproduce with controlled request
```

Do not expose the raw server exception to the client simply to speed
debugging.

------------------------------------------------------------------------

# 43. API Returns 401

Determine whether it is:

``` text
Missing token
Invalid token
Expired token
User/session issue
```

Then verify:

``` text
Authorization header
JWT configuration
Frontend token state
```

------------------------------------------------------------------------

# 44. API Returns 403

Determine whether it represents:

``` text
Role restriction
Resource ownership
Budget membership
JWT middleware behavior
```

Inspect the endpoint and service rather than assuming all 403 responses
mean the same thing.

------------------------------------------------------------------------

# 45. API Returns 404

Check:

``` text
Route
Resource ID
Authenticated scope
Database record
```

A 404 can be an expected resource-not-found response.

------------------------------------------------------------------------

# 46. Frontend Shows Stale Data

## Checks

``` text
API response
Context state
Component props
Socket event
State update
```

For real-time data:

``` text
Was event received?
```

before changing database code.

------------------------------------------------------------------------

# 47. Frontend Shows Wrong Role UI

Check:

``` text
Authenticated user
Budget membership
Role state
Context state
Conditional rendering
```

Then independently verify backend authorization.

A correct UI does not replace backend authorization.

------------------------------------------------------------------------

# 48. Application Works Locally but Fails in Production

Compare:

``` text
NODE_ENV
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
FRONTEND_URL
BACKEND_URL
REDIS_URL
Email configuration
REACT_APP_API_URL
```

Then compare:

``` text
Frontend origin
Backend origin
Database
Redis
TLS
```

Production-only failures are often configuration/environment mismatches.

------------------------------------------------------------------------

# 49. Production Frontend Cannot Reach Backend

Check:

``` text
REACT_APP_API_URL
DNS
TLS certificate
Backend availability
CORS
```

Verify the browser's actual request URL.

------------------------------------------------------------------------

# 50. Production Socket Fails but REST Works

This usually narrows the problem to:

``` text
Socket endpoint
WebSocket/proxy configuration
JWT handshake
CORS/origin handling
Redis/multi-instance behavior
```

REST success proves the backend is reachable but does not prove
Socket.IO infrastructure is correctly configured.

------------------------------------------------------------------------

# 51. Deployment Causes Authentication Failures

Check:

``` text
JWT_SECRET changed?
JWT configuration changed?
Backend instances using same secret?
Frontend token still valid?
```

If the secret changed intentionally, existing tokens may need to be
treated as invalid.

------------------------------------------------------------------------

# 52. Deployment Causes CORS Failures

Check:

``` text
FRONTEND_URL
Actual frontend origin
Protocol
Domain
Port
```

Remember that:

``` text
http://example.com
```

and:

``` text
https://example.com
```

are different origins.

------------------------------------------------------------------------

# 53. Deployment Causes Database Errors

Check:

``` text
DATABASE_URL
Database schema
Database connectivity
Recent schema deployment
Database credentials
```

If application code changed at the same time as schema, determine
whether the release is compatible with the current database version.

------------------------------------------------------------------------

# 54. Deployment Rollback

If a release causes severe application failure:

``` text
1. Confirm release correlation
2. Assess data impact
3. Roll back application if safe
4. Verify database compatibility
5. Run smoke tests
6. Monitor
```

Never blindly roll back application code across an incompatible database
change.

------------------------------------------------------------------------

# 55. Data Integrity Investigation

If financial data appears incorrect:

``` text
1. Preserve evidence
2. Identify affected budget/user
3. Inspect transaction records
4. Inspect budget history where available
5. Determine mutation source
6. Check recent releases
7. Check authorization
8. Correct using controlled procedure
9. Verify reports
```

Do not directly edit production records without an auditable procedure.

------------------------------------------------------------------------

# 56. Performance Degradation

## Symptoms

``` text
Requests slow
Reports slow
Database queries slow
Socket responsiveness degraded
```

## Checks

``` text
API latency
Database latency
Database resources
Redis latency
CPU/memory
Recent release
```

Identify whether the bottleneck is:

``` text
Frontend
Network
Backend
Database
Redis
External email
```

------------------------------------------------------------------------

# 57. High Memory Usage

Check:

``` text
Backend process count
Socket connection count
Large in-memory collections
Unreleased listeners
Long-running requests
```

The process-local live-user state and Socket.IO connections should be
considered when investigating memory growth.

------------------------------------------------------------------------

# 58. Process Crash Loop

## Checks

``` text
Startup logs
Environment
Database
Port
Unhandled exceptions
Deployment health checks
```

If the application exits immediately after deployment, first compare the
production environment with the known startup requirements.

------------------------------------------------------------------------

# 59. Test Failure During Development

Run the failing test in isolation.

The backend test command is configured to run:

``` text
Jest
--runInBand
--testTimeout=30000
```

Then:

``` text
Read failure
Identify layer
Reproduce
Fix
Run targeted test
Run full suite
```

Do not weaken the assertion just to make the suite green.

------------------------------------------------------------------------

# 60. Test Suite Timeout

## Checks

``` text
Database connectivity
Async cleanup
Unresolved promises
External services
Test data
```

Do not immediately increase:

``` text
--testTimeout
```

unless the test genuinely requires a longer execution time.

------------------------------------------------------------------------

# 61. Common Diagnostic Commands

Repository-established database commands include:

``` bash
npm run db:push
npm run db:seed
```

The backend test command is:

``` bash
npm test
```

Use these from the backend directory according to the package scripts.

For other operational commands, use the current `package.json` and
deployment environment rather than assuming a command that the
repository does not establish.

------------------------------------------------------------------------

# 62. Browser Diagnostic Checklist

When debugging a frontend issue:

``` text
[ ] Console
[ ] Network
[ ] Request URL
[ ] HTTP status
[ ] Request payload
[ ] Authorization header
[ ] Response body
[ ] React state
[ ] Socket connection
[ ] Socket events
```

This should be the default first-line workflow.

------------------------------------------------------------------------

# 63. Backend Diagnostic Checklist

``` text
[ ] Startup logs
[ ] Route
[ ] Middleware
[ ] Controller
[ ] Service
[ ] Model
[ ] Database
[ ] External dependency
[ ] Error handler
```

Identify the first layer where expected behavior diverges.

------------------------------------------------------------------------

# 64. Security Diagnostic Checklist

For suspicious access:

``` text
[ ] User identity
[ ] JWT validity
[ ] Resource ownership
[ ] Budget membership
[ ] Role
[ ] Request path
[ ] Socket identity
[ ] Audit/log evidence
```

Do not assume an authenticated user is authorized for the requested
resource.

------------------------------------------------------------------------

# 65. Incident Escalation

Escalate immediately when there is evidence of:

``` text
Credential exposure
Unauthorized financial-data access
Database corruption
Authentication bypass
Widespread production outage
Persistent data loss
```

For lower-severity issues, use the normal engineering incident process.

------------------------------------------------------------------------

# 66. Runbook Design Principle

Every runbook should answer:

``` text
What happened?
How do I confirm it?
What should I check?
What can I safely change?
How do I verify recovery?
When should I escalate?
```

A runbook should not require undocumented tribal knowledge.

------------------------------------------------------------------------

# 67. Troubleshooting Matrix

  Symptom                       First checks                  Likely boundary
  ----------------------------- ----------------------------- -----------------
  Backend won't start           env, DB, port                 Runtime/config
  Production startup rejected   JWT config                    Security/config
  API unreachable               backend, API URL              Network/runtime
  CORS error                    FRONTEND_URL                  Browser/API
  Login 401                     credentials, DB, JWT          Auth
  Logged out after login        token, profile, header        Auth/frontend
  Budget 403                    role/membership               Authorization
  Transaction fails             payload, auth, DB             Domain/API
  Socket won't connect          JWT, socket endpoint          Real-time
  Socket updates missing        room/event/listener           Real-time
  Cross-instance socket issue   Redis                         Infrastructure
  Email fails                   credentials/provider          Email
  Reset link wrong              FRONTEND_URL                  Configuration
  Production-only failure       env/origins/schema            Deployment
  Financial data wrong          transaction/history/release   Data integrity

------------------------------------------------------------------------

# 68. Troubleshooting Summary

The preferred diagnostic model is:

``` text
Symptom
  │
  ▼
Reproduce
  │
  ▼
Find first incorrect boundary
  │
  ▼
Check configuration/state
  │
  ▼
Check implementation
  │
  ▼
Apply smallest safe fix
  │
  ▼
Test
  │
  ▼
Verify user workflow
  │
  ▼
Document if recurring
```

The central principle is:

> **Diagnose from the outside inward, identify the first broken
> boundary, preserve evidence, avoid speculative changes, and verify the
> complete user workflow after remediation.**

------------------------------------------------------------------------

# 69. Next Part

**Part 20 --- Production Readiness & Documentation Index**

The final document will provide:

-   Complete documentation map
-   Architecture reference
-   Operational checklist
-   Security checklist
-   Testing checklist
-   Deployment checklist
-   Developer onboarding checklist
-   Release checklist
-   Incident checklist
-   Production-readiness scorecard
-   Known implementation/operational gaps
-   Recommended improvement roadmap
-   Documentation maintenance rules
-   Source-of-truth guidance
-   Final system overview
