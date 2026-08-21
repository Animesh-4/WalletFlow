# WalletFlow --- Deployment & Production Operations

## Part 15 --- Deployment, Release & Runtime Operations

This document defines the production deployment and operational model
that can be established from the supplied WalletFlow repository.

The production architecture consists of:

``` text
Browser
   │
   ├── HTTPS / REST
   │
   └── Socket.IO
          │
          ▼
      Backend
          │
     ┌────┼───────────────┐
     ▼    ▼               ▼
 PostgreSQL Redis       Email
   /Neon
```

The repository provides the application-level building blocks for
deployment, but it does not establish a single cloud provider, CI/CD
platform, container platform, process manager, or infrastructure-as-code
system.

Therefore this document distinguishes:

``` text
Repository-established behavior
```

from:

``` text
Operational practices that should be implemented by the deployment environment
```

------------------------------------------------------------------------

# 1. Production Deployment Overview

WalletFlow has two primary application artifacts:

``` text
Frontend
Backend
```

The backend additionally depends on:

``` text
PostgreSQL / Neon
```

and may use:

``` text
Redis
Email provider
```

The high-level deployment path is:

``` text
Source repository
      │
      ├──────────────┐
      ▼              ▼
 Frontend         Backend
      │              │
      │              ├── PostgreSQL / Neon
      │              ├── Redis
      │              └── Email
      │
      ▼
   Browser
```

------------------------------------------------------------------------

# 2. Deployment Responsibility Boundaries

The application repository owns:

``` text
Application code
Database schema definition
Backend configuration logic
Frontend configuration consumption
API routes
Socket.IO implementation
Tests
Seed logic
```

The deployment platform owns:

``` text
Compute
DNS
TLS certificates
Secrets injection
Scaling
Network policy
Backups
Monitoring infrastructure
Log retention
```

The supplied repository does not define a specific provider for these
responsibilities.

------------------------------------------------------------------------

# 3. Frontend Production Artifact

The frontend is a React application.

A production deployment should:

``` text
Install dependencies
      │
      ▼
Build frontend
      │
      ▼
Static application artifact
      │
      ▼
CDN/static hosting/web server
```

The exact hosting platform is not established by the supplied source.

------------------------------------------------------------------------

# 4. Frontend Build Configuration

The frontend consumes:

``` env
REACT_APP_API_URL
```

during the build.

Therefore production frontend builds must point at the production API.

Conceptually:

``` env
REACT_APP_API_URL=https://api.example.com/api
```

The actual domain is deployment-specific.

------------------------------------------------------------------------

# 5. Frontend Configuration Is Build-Time

Frontend environment values are embedded into the built application.

Therefore:

``` text
Change REACT_APP_API_URL
        │
        ▼
Rebuild frontend
```

Changing the backend runtime environment alone does not automatically
change an already-built frontend bundle.

------------------------------------------------------------------------

# 6. Backend Production Artifact

The backend is a Node.js application.

The production deployment should run the backend from the backend
package configuration and expose the configured:

``` text
PORT
```

The backend starts an HTTP server and attaches Socket.IO to it.

------------------------------------------------------------------------

# 7. Backend Startup Dependencies

The backend requires successful database initialization.

The startup lifecycle is:

``` text
Process starts
     │
     ▼
Load configuration
     │
     ▼
Initialize database
     │
     ▼
Initialize application
     │
     ▼
Initialize Socket.IO
     │
     ▼
Listen on PORT
```

The database initialization code creates the Neon/Drizzle connection and
fails startup when initialization fails.
fileciteturn5file7L987-L1022

------------------------------------------------------------------------

# 8. Production Environment

At minimum, production should configure the application with the
environment values required by enabled features.

Core:

``` env
NODE_ENV=production
PORT=<deployment-port>
DATABASE_URL=<production-database>
JWT_SECRET=<unique-production-secret>
JWT_EXPIRES_IN=<chosen-expiration>
FRONTEND_URL=<production-frontend-origin>
```

Optional/feature-specific:

``` env
BACKEND_URL=<public-backend-url>
REDIS_URL=<redis-url>
EMAIL_USER=<email-account>
EMAIL_PASS=<email-password>
EMAIL=<email-configuration>
```

The actual secret values must come from the deployment environment, not
source control.

------------------------------------------------------------------------

# 9. Production JWT Configuration

Production must not use the known development/default JWT secret.

The backend explicitly validates this condition during environment
configuration. fileciteturn6file1L205-L245

Deployment verification should therefore include:

``` text
NODE_ENV=production
JWT_SECRET is unique
JWT_SECRET is not the development/default secret
```

------------------------------------------------------------------------

# 10. Database Deployment

The production database is PostgreSQL-compatible and is accessed
through:

``` text
DATABASE_URL
```

The repository uses:

``` text
Neon
Drizzle
```

for database access.

Before application release, the production database schema must match
the version expected by the deployed application.

------------------------------------------------------------------------

# 11. Production Schema Synchronization

The repository exposes:

``` bash
npm run db:push
```

for Drizzle schema synchronization.

However, the repository does not establish a full production
migration-management policy.

Therefore production teams should explicitly decide whether:

``` text
db:push
```

is the approved production schema workflow

or:

``` text
versioned migrations
```

should be introduced before production-scale schema changes.

Do not assume that direct schema pushing is equivalent to a fully
managed migration strategy.

------------------------------------------------------------------------

# 12. Production Database Change Principle

Never deploy application code that assumes a schema change before the
database supports that schema.

For a compatible change:

``` text
Database supports old + new
        │
        ▼
Deploy application
        │
        ▼
Migrate/remove old behavior later
```

This expand/contract approach reduces the risk of application/database
version mismatch.

The repository itself does not currently establish an automated
expand/contract migration workflow; this is an operational
recommendation.

------------------------------------------------------------------------

# 13. Database Backup

The repository does not define:

``` text
Backup frequency
Point-in-time recovery
Restore procedure
Retention policy
RPO
RTO
```

These must be provided by the production database platform/operations
process.

A production deployment should not be considered operationally complete
until backup and restore responsibilities are explicitly assigned.

------------------------------------------------------------------------

# 14. Database Restore

A restore process should be documented separately from application
deployment.

At minimum, operations should know:

``` text
Where backups are stored
How to select restore point
How to restore
How to validate restored schema
How to reconnect application
How to verify data integrity
```

These procedures are infrastructure-specific and are not established by
the supplied repository.

------------------------------------------------------------------------

# 15. Redis Deployment

Redis is optional for the basic application architecture.

It becomes relevant when using:

``` text
Socket.IO Redis adapter
```

for distributed real-time event coordination.

Production instances that use Redis should share the intended Redis
infrastructure.

------------------------------------------------------------------------

# 16. Redis Multi-Instance Architecture

For multiple backend instances:

``` text
                 Redis
               /      \
              /        \
        Backend A    Backend B
           │            │
        Socket.IO    Socket.IO
```

The Redis adapter coordinates Socket.IO event propagation.

The current repository's live-user state remains process-local, so Redis
adapter deployment should not be interpreted as complete distributed
presence synchronization.

------------------------------------------------------------------------

# 17. Email Deployment

Email is required for workflows such as:

``` text
Password reset
Invitation
```

The deployment must configure the email-related environment values
expected by the email service.

Verify production email URLs carefully because:

``` text
Password reset link
Invitation link
```

are constructed using:

``` text
FRONTEND_URL
```

The email service currently constructs password-reset and invitation
URLs from that value. fileciteturn6file7L834-L857

------------------------------------------------------------------------

# 18. CORS Production Configuration

The backend CORS configuration uses:

``` text
FRONTEND_URL
```

as the allowed origin.

Production verification should confirm:

``` text
Browser origin
        ==
FRONTEND_URL
```

If these differ, browser requests can fail even when the backend itself
is reachable.

------------------------------------------------------------------------

# 19. HTTPS

Production should expose the application over HTTPS.

The repository itself does not establish the TLS termination mechanism.

Possible deployment responsibilities include:

``` text
Load balancer
Reverse proxy
Managed hosting platform
CDN
```

The application should not be assumed to terminate public TLS directly
unless the deployment architecture explicitly requires it.

------------------------------------------------------------------------

# 20. Public Architecture

A typical production topology is:

``` text
                  Internet
                     │
                     ▼
                HTTPS / TLS
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
       Frontend               API
          │                     │
          │                  Backend
          │                     │
          │              ┌──────┼──────┐
          │              ▼      ▼      ▼
          │          Postgres Redis   Email
          │
          ▼
       Browser
```

This is an architectural model, not a claim about the specific hosting
provider.

------------------------------------------------------------------------

# 21. Backend Process Lifecycle

The backend is a long-running Node.js process.

Operational lifecycle:

``` text
Start
  │
  ▼
Initialize configuration
  │
  ▼
Initialize database
  │
  ▼
Initialize Socket.IO
  │
  ▼
Listen
  │
  ▼
Serve REST + WebSocket traffic
  │
  ▼
Shutdown
```

The deployment environment should manage process restart and
availability.

------------------------------------------------------------------------

# 22. Graceful Shutdown

A production process should ideally handle termination signals
gracefully.

A graceful shutdown should conceptually:

``` text
Stop accepting new work
       │
       ▼
Close HTTP server
       │
       ▼
Close Socket.IO
       │
       ▼
Close database resources
       │
       ▼
Close Redis resources if configured
       │
       ▼
Exit
```

The supplied source should be checked before claiming that every
shutdown step is currently implemented.

Where a complete graceful-shutdown implementation is absent, it should
be added as an operational hardening task.

------------------------------------------------------------------------

# 23. Health Checks

The supplied repository does not establish a dedicated health endpoint
contract in the examined material.

A production deployment should distinguish:

``` text
Process is alive
```

from:

``` text
Application is ready to serve traffic
```

A health/readiness strategy should be implemented at the deployment
layer or application layer as appropriate.

------------------------------------------------------------------------

# 24. Readiness Dependencies

A readiness check should consider the dependencies required for the
instance to perform normal work.

At minimum:

``` text
Application process
Database connectivity
```

For deployments requiring distributed Socket.IO:

``` text
Redis connectivity
```

may also be relevant.

Email availability should generally be treated as feature-specific
rather than a universal application readiness dependency.

------------------------------------------------------------------------

# 25. Logging

Production logging should make it possible to identify:

``` text
Startup failures
Database initialization failures
Authentication failures
Authorization failures
API errors
Socket connection failures
Infrastructure failures
```

Logs should not contain:

``` text
Passwords
JWT secrets
Database credentials
Email passwords
Raw password-reset tokens
```

Sensitive information must remain out of logs.

------------------------------------------------------------------------

# 26. Error Logging

The backend uses centralized error handling.

Production logging should preserve:

``` text
Error class/type
Useful request context
Relevant resource identifier where safe
Stack trace in server-side logs
```

while avoiding sensitive data exposure.

Client responses should not expose internal stack traces or secrets.

------------------------------------------------------------------------

# 27. Monitoring

The repository does not establish a complete monitoring stack.

Production operations should monitor at least:

``` text
Application availability
HTTP error rate
Authentication failures
Database errors
Database connectivity
Socket connection failures
Process restarts
Memory/CPU
```

For real-time deployments:

``` text
Socket connection count
Socket errors
Redis errors
```

are also useful.

------------------------------------------------------------------------

# 28. Metrics

Recommended operational metrics include:

``` text
HTTP request count
HTTP 4xx rate
HTTP 5xx rate
Login failure rate
Database error rate
Average request latency
Active socket connections
Socket disconnect rate
Redis errors
Process restart count
```

These are recommended production observability signals; the repository
does not establish that they are currently instrumented.

------------------------------------------------------------------------

# 29. Authentication Monitoring

Authentication deserves special operational attention.

Monitor:

``` text
Repeated login failures
Unexpected JWT failures
Password reset volume
Invitation activity
```

Sudden changes can indicate:

``` text
Misconfiguration
Client regression
Credential attacks
Broken frontend deployment
```

The repository itself does not define a security-monitoring
implementation.

------------------------------------------------------------------------

# 30. Database Monitoring

Monitor the production database for:

``` text
Connection failures
Query errors
Connection exhaustion
Latency
Storage growth
CPU/resource utilization
```

The exact metrics depend on the PostgreSQL/Neon deployment platform.

------------------------------------------------------------------------

# 31. Redis Monitoring

If Redis is enabled, monitor:

``` text
Connection failures
Memory
Latency
Client connections
Command errors
```

A Redis failure may primarily affect distributed real-time behavior
rather than the durable PostgreSQL-backed financial state.

The exact degradation behavior depends on deployment configuration.

------------------------------------------------------------------------

# 32. Email Monitoring

For password-reset and invitation workflows, monitor:

``` text
Email send failures
Provider authentication failures
Delivery failures
Invalid links
```

A successful API response should not automatically be interpreted as
proof that an email reached the recipient.

------------------------------------------------------------------------

# 33. Deployment Pipeline

A production pipeline should conceptually follow:

``` text
Commit
  │
  ▼
Install dependencies
  │
  ▼
Run tests
  │
  ▼
Build frontend
  │
  ▼
Prepare backend artifact
  │
  ▼
Deploy database-compatible change
  │
  ▼
Deploy backend
  │
  ▼
Deploy frontend
  │
  ▼
Smoke test
```

The exact CI/CD implementation is not established by the supplied
repository.

------------------------------------------------------------------------

# 34. Deployment Ordering

For backward-compatible releases:

``` text
1. Database compatibility
2. Backend
3. Frontend
```

is a useful order.

For changes where old and new clients must coexist:

``` text
Database
   ↓
Backward-compatible backend
   ↓
Frontend
   ↓
Cleanup
```

This reduces version skew.

------------------------------------------------------------------------

# 35. Frontend/Backend Compatibility

Because the frontend directly consumes API and Socket.IO contracts, a
backend deployment can break an already-deployed frontend.

Before changing:

``` text
Endpoint
Request field
Response field
Socket event
Socket payload
```

verify all currently deployed clients.

------------------------------------------------------------------------

# 36. Database Compatibility

Database changes require similar caution.

Avoid:

``` text
Deploy backend expecting new field
        │
        ▼
Old database schema
```

Prefer:

``` text
Compatible schema
        │
        ▼
Backend deployment
        │
        ▼
Frontend deployment
        │
        ▼
Old schema cleanup
```

when the change permits it.

------------------------------------------------------------------------

# 37. Deployment Smoke Tests

Immediately after deployment, verify:

``` text
[ ] Frontend loads
[ ] Backend responds
[ ] Database connection works
[ ] Registration works
[ ] Login works
[ ] Protected API works
[ ] Budget loads
[ ] Transaction flow works
[ ] Socket connection works
[ ] Collaboration works
[ ] Password reset link configuration is correct
[ ] Invitation link configuration is correct
```

The exact smoke-test suite should be automated as the deployment process
matures.

------------------------------------------------------------------------

# 38. Production Authentication Smoke Test

A minimal authentication smoke test is:

``` text
Create test account
      │
      ▼
Login
      │
      ▼
Receive JWT
      │
      ▼
Call authenticated profile endpoint
      │
      ▼
Verify user identity
```

Do not use real customer credentials for deployment smoke tests.

------------------------------------------------------------------------

# 39. Production Real-Time Smoke Test

Verify:

``` text
Browser A connects
Browser B connects
Both authenticate
Both join same budget
A performs supported change
B receives expected update
```

This verifies:

``` text
Frontend
Backend
Authentication
Socket.IO
Budget room
Event propagation
```

If multiple backend instances are deployed, ensure the test exercises
cross-instance routing when distributed real-time behavior is expected.

------------------------------------------------------------------------

# 40. Rollback Strategy

A rollback should be possible for:

``` text
Backend application
Frontend application
```

Database rollback is more complex.

Never assume:

``` text
application rollback
```

automatically implies:

``` text
database rollback
```

For destructive database changes, a separate migration/recovery strategy
is required.

------------------------------------------------------------------------

# 41. Application Rollback

A typical application rollback is:

``` text
Current release
      │
      ▼
Detect regression
      │
      ▼
Deploy previous known-good artifact
      │
      ▼
Run smoke tests
      │
      ▼
Restore service
```

The exact artifact-retention mechanism belongs to the deployment
platform.

------------------------------------------------------------------------

# 42. Database Rollback Warning

If a release contains:

``` text
Destructive schema change
```

then simply reverting application code can create a version mismatch.

This is why backward-compatible schema changes are preferred.

The repository does not currently establish an automated database
rollback system.

------------------------------------------------------------------------

# 43. Incident Response

When production behavior breaks:

``` text
1. Identify user impact
2. Check application health
3. Check recent deployment
4. Check backend logs
5. Check database
6. Check Redis if relevant
7. Check frontend/API compatibility
8. Check authentication
9. Decide rollback vs fix-forward
10. Verify recovery
```

Do not modify multiple infrastructure layers simultaneously without
identifying the failure boundary.

------------------------------------------------------------------------

# 44. API Incident Debugging

If API requests fail:

``` text
Browser
  │
  ▼
API URL
  │
  ▼
DNS/TLS
  │
  ▼
Backend
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
Database
```

Identify the first failing layer.

------------------------------------------------------------------------

# 45. Socket Incident Debugging

If real-time updates fail:

``` text
Browser
  │
  ▼
Socket.IO connection
  │
  ▼
JWT authentication
  │
  ▼
Backend instance
  │
  ▼
Room membership
  │
  ▼
Event emission
  │
  ▼
Redis adapter if distributed
  │
  ▼
Receiving backend/client
```

This prevents treating every socket problem as a frontend rendering
problem.

------------------------------------------------------------------------

# 46. Production Security Checklist

``` text
[ ] HTTPS enabled
[ ] JWT production secret configured
[ ] Database credentials secret
[ ] Redis credentials secret
[ ] Email credentials secret
[ ] No secrets in frontend variables
[ ] No credentials in logs
[ ] CORS restricted to intended frontend
[ ] Authentication enabled for protected endpoints
[ ] Authorization verified server-side
[ ] Password reset behavior verified
[ ] Invitation links use correct production frontend
```

------------------------------------------------------------------------

# 47. Production Data Protection

Financial data should be treated as sensitive application data.

Operational practices should include:

``` text
Restricted database access
Secret management
Least-privilege infrastructure access
Backup protection
Log hygiene
```

The repository establishes application-level authentication and
authorization but does not itself define the complete infrastructure
security program.

------------------------------------------------------------------------

# 48. Release Checklist

Before release:

``` text
[ ] Tests pass
[ ] Frontend builds
[ ] Backend starts with production configuration
[ ] Production JWT secret validated
[ ] DATABASE_URL verified
[ ] Database schema compatible
[ ] Redis configuration verified if required
[ ] Email configuration verified if required
[ ] FRONTEND_URL verified
[ ] CORS verified
[ ] No secrets committed
[ ] Rollback artifact available
```

------------------------------------------------------------------------

# 49. Post-Deployment Checklist

After release:

``` text
[ ] Frontend accessible
[ ] API accessible
[ ] Login works
[ ] Protected API works
[ ] Database queries work
[ ] Budget loads
[ ] Transactions work
[ ] Socket.IO connects
[ ] Collaboration works
[ ] Notifications work
[ ] Password-reset link is correct
[ ] Invitation link is correct
[ ] Error logs normal
[ ] No unexpected restart loop
```

------------------------------------------------------------------------

# 50. Production Change Workflow

For any production change:

``` text
Understand impact
      │
      ▼
Check tests
      │
      ▼
Check API/database/socket compatibility
      │
      ▼
Prepare deployment
      │
      ▼
Deploy
      │
      ▼
Smoke test
      │
      ▼
Monitor
      │
      ▼
Close release
```

------------------------------------------------------------------------

# 51. Operational Ownership

A production-ready project should explicitly assign ownership for:

``` text
Application deployment
Database
Redis
Email
DNS/TLS
Secrets
Monitoring
Backups
Incident response
```

The repository does not identify these organizational owners.

They must be established by the operating team.

------------------------------------------------------------------------

# 52. Production Readiness Boundary

The source establishes a strong application architecture:

``` text
Authentication
Authorization
REST API
PostgreSQL/Drizzle
Socket.IO
Optional Redis
Email workflows
Tests
Centralized configuration
```

But application architecture alone does not establish complete
production operations.

The deployment environment must additionally provide:

``` text
Reliable compute
Secrets
TLS
Backups
Monitoring
Alerting
Recovery
Deployment automation
```

------------------------------------------------------------------------

# 53. Deployment Architecture Summary

``` text
                       Internet
                          │
                          ▼
                       HTTPS
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
         React Frontend          Node Backend
                                      │
                         ┌────────────┼─────────────┐
                         ▼            ▼             ▼
                    PostgreSQL     Redis         Email
                       /Neon       optional      optional
                         │
                         ▼
                    Durable data
```

The central operational principle is:

> **Deploy application code, database schema, infrastructure
> configuration, and secrets as coordinated release components; preserve
> compatibility across versions; verify the complete user path after
> deployment; and maintain an explicit rollback and recovery strategy.**

------------------------------------------------------------------------

# 54. Next Part

**Part 16 --- Monitoring, Observability & Incident Response**

The next document will go deeper into operational visibility:

-   Structured logging
-   Error handling
-   Request tracing
-   Authentication/security events
-   Database observability
-   Socket.IO observability
-   Redis observability
-   Email observability
-   Health checks
-   Metrics
-   Alerts
-   SLO/SLI concepts
-   Incident severity
-   Debugging playbooks
-   Production troubleshooting
-   Post-incident review
-   Operational dashboards
