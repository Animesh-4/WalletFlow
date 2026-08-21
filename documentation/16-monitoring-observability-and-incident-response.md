# WalletFlow --- Monitoring, Observability & Incident Response

## Part 16 --- Operational Visibility, Diagnostics & Recovery

This document defines the observability and incident-response model for
WalletFlow based on the supplied application architecture.

The repository establishes:

``` text
Express backend
PostgreSQL / Neon
Socket.IO
Optional Redis
Email workflows
Centralized error handling
Jest tests
```

The supplied source does not establish a complete production monitoring
vendor, metrics backend, tracing platform, alerting system, or
incident-management platform.

Accordingly, this document separates:

``` text
Existing application observability behavior
```

from:

``` text
Recommended production observability practices
```

------------------------------------------------------------------------

# 1. Observability Architecture

A production observability model should cover:

``` text
Application
   │
   ├── Logs
   ├── Metrics
   ├── Errors
   └── Traces where implemented
        │
        ▼
Infrastructure
   │
   ├── Database
   ├── Redis
   ├── Email
   └── Hosting/runtime
```

The purpose is to answer:

``` text
Is the system healthy?
What is failing?
Who is affected?
When did it start?
What changed?
How can it be recovered?
```

------------------------------------------------------------------------

# 2. Current Error Handling

The backend controllers generally use the pattern:

``` text
try
  domain operation
catch
  next(error)
```

The centralized error handler is therefore an important observability
boundary.

Authentication controllers demonstrate this pattern across registration,
login, profile, password reset, and related operations.
fileciteturn6file8L893-L984

------------------------------------------------------------------------

# 3. Error Handling Responsibilities

The error-handling layer should distinguish:

``` text
Expected client errors
```

from:

``` text
Unexpected server failures
```

Examples of expected failures:

``` text
Invalid credentials
Unauthorized access
Forbidden budget operation
Duplicate registration
Missing required input
```

Unexpected failures include:

``` text
Database failure
Programming exception
Infrastructure failure
Unexpected third-party failure
```

------------------------------------------------------------------------

# 4. HTTP Status Monitoring

The most useful initial API health signals are:

``` text
2xx rate
4xx rate
5xx rate
```

A rise in:

``` text
5xx
```

usually indicates server-side failures.

A rise in:

``` text
401
```

may indicate:

``` text
Authentication/session problem
JWT configuration problem
Frontend token problem
```

A rise in:

``` text
403
```

may indicate:

``` text
Authorization behavior
Role changes
Client misuse
Security probing
```

------------------------------------------------------------------------

# 5. Authentication Observability

Authentication is a high-value operational boundary.

Monitor:

``` text
Login success/failure
Registration failures
JWT verification failures
Password reset requests
Password reset failures
Invitation acceptance failures
```

The current authentication implementation explicitly distinguishes
invalid credentials and token verification failures.
fileciteturn6file0L77-L86 fileciteturn5file2L299-L334

------------------------------------------------------------------------

# 6. Security-Sensitive Logging

Authentication logs must never contain:

``` text
Passwords
JWT_SECRET
Database credentials
Email passwords
Raw password-reset tokens
```

Avoid logging full:

``` text
Authorization
```

headers.

Prefer safe identifiers such as:

``` text
user ID
request ID
route
status code
timestamp
```

where operationally appropriate.

------------------------------------------------------------------------

# 7. Request Logging

Production API logs should ideally contain:

``` text
Timestamp
HTTP method
Route
Status code
Duration
Request/correlation ID
Authenticated user ID where safe
```

Example conceptual event:

``` text
POST /api/auth/login
status=200
duration=120ms
request_id=...
```

The supplied repository does not establish a formal structured
request-logging format, so this should be treated as a production
observability recommendation.

------------------------------------------------------------------------

# 8. Correlation IDs

For distributed debugging, requests should ideally have a
correlation/request ID.

Conceptually:

``` text
Browser request
      │
      ▼
request_id
      │
      ├── API log
      ├── service log
      ├── database-related log
      └── error log
```

This allows one failing request to be followed across application
layers.

The supplied source does not establish a complete request-ID
implementation.

------------------------------------------------------------------------

# 9. Error Context

A useful server-side error record should answer:

``` text
What failed?
Where did it fail?
When did it fail?
Which operation was running?
Which request triggered it?
Which user/resource was involved?
```

Do not include sensitive values merely to make debugging easier.

------------------------------------------------------------------------

# 10. Database Observability

PostgreSQL/Neon should be monitored for:

``` text
Connection availability
Connection failures
Query errors
Latency
Resource consumption
Storage growth
Connection saturation
```

The application treats database initialization as a startup dependency,
so database availability is fundamental to backend health.
fileciteturn5file7L987-L1022

------------------------------------------------------------------------

# 11. Database Failure Symptoms

Common application symptoms include:

``` text
Backend startup failure
500 responses
Slow API requests
Failed transaction operations
Budget loading failures
Authentication failures
```

When multiple unrelated endpoints fail simultaneously, database
connectivity should be one of the first infrastructure checks.

------------------------------------------------------------------------

# 12. Database Incident Workflow

``` text
API errors increase
      │
      ▼
Check backend logs
      │
      ▼
Check database connectivity
      │
      ▼
Check database provider status/metrics
      │
      ▼
Check connection/resource limits
      │
      ▼
Identify failing queries
      │
      ▼
Recover or mitigate
```

Do not immediately modify application code if the failure is
infrastructure-level.

------------------------------------------------------------------------

# 13. Redis Observability

When Redis is configured, monitor:

``` text
Connection status
Connection errors
Latency
Memory usage
Client connections
Command failures
```

Redis primarily supports distributed Socket.IO behavior.

Therefore Redis failures should be evaluated separately from PostgreSQL
failures.

------------------------------------------------------------------------

# 14. Redis Failure Impact

A Redis problem may affect:

``` text
Cross-instance Socket.IO coordination
```

without necessarily destroying:

``` text
PostgreSQL financial data
```

The exact degradation behavior depends on how the deployment handles
Redis initialization and failures.

The current architecture should therefore be monitored as two related
but distinct infrastructure paths.

------------------------------------------------------------------------

# 15. Socket.IO Observability

Monitor:

``` text
Active connections
Connection failures
Authentication failures
Disconnects
Room joins/leaves
Event errors
```

For collaboration features, useful signals include:

``` text
Budget room joins
Budget room leaves
Live-user updates
Transaction update delivery
Budget update delivery
```

The supplied source establishes these event concepts but not a complete
metrics system.

------------------------------------------------------------------------

# 16. Socket Authentication Monitoring

Socket authentication failures should be distinguishable from ordinary
disconnects.

The backend validates the JWT during the Socket.IO handshake and assigns
the decoded identity to `socket.user` after successful verification.
fileciteturn4file9L1093-L1147

Therefore useful diagnostics include:

``` text
Handshake attempted
Token missing
Token invalid
Token expired
Authentication successful
```

Sensitive token values must never be logged.

------------------------------------------------------------------------

# 17. Socket Room Diagnostics

When a collaboration update is missing, inspect:

``` text
Connection
   ↓
Authentication
   ↓
Budget authorization
   ↓
Room join
   ↓
Event emission
   ↓
Event delivery
   ↓
Frontend listener
```

This provides a deterministic troubleshooting path.

------------------------------------------------------------------------

# 18. Presence Observability

The current live-user implementation uses process-local state.

Therefore production diagnostics should identify:

``` text
Which backend instance owns the connection?
Which sockets are connected?
Which budget room is involved?
```

With multiple instances, the same user may appear differently from
different processes.

The Redis adapter does not by itself turn process-local presence state
into a globally authoritative presence system.

------------------------------------------------------------------------

# 19. Email Observability

Email workflows include:

``` text
Password reset
Invitation
```

Monitor:

``` text
Send attempt
Provider failure
Authentication failure
Rejected recipient
Delivery failure where provider data is available
```

Do not log:

``` text
Raw reset token
Sensitive invitation token
Email credentials
```

------------------------------------------------------------------------

# 20. Password Reset Diagnostics

A password-reset failure should be debugged through:

``` text
POST /api/auth/forgot-password
       │
       ▼
User lookup
       │
       ▼
Reset token generation
       │
       ▼
Token persistence
       │
       ▼
Email generation
       │
       ▼
Email provider
       │
       ▼
Frontend reset URL
       │
       ▼
POST /api/auth/reset-password
```

The current reset service hashes the token before persistence and uses a
one-hour expiration. fileciteturn6file0L95-L125

------------------------------------------------------------------------

# 21. Invitation Diagnostics

Invitation troubleshooting follows:

``` text
Invitation creation
       │
       ▼
Token/link generation
       │
       ▼
Email delivery
       │
       ▼
Frontend invitation page
       │
       ▼
Authentication
       │
       ▼
Accept invitation
       │
       ▼
Budget membership
```

The invitation URL is constructed using `FRONTEND_URL` and the
invitation token. fileciteturn6file7L847-L857

------------------------------------------------------------------------

# 22. Frontend Observability

Frontend failures should be diagnosed through:

``` text
Browser console
Network requests
Socket connection state
React state/context
```

Useful frontend signals include:

``` text
API request failures
401 redirects
Socket connection failures
Unhandled UI errors
Failed resource loading
```

The supplied repository does not establish a dedicated frontend
error-reporting platform.

------------------------------------------------------------------------

# 23. 401 Monitoring

A sudden increase in frontend/backend `401` responses can indicate:

``` text
JWT secret mismatch
Token expiration issue
Frontend token storage problem
Authorization header failure
Unexpected logout behavior
```

The shared Axios client currently clears the token and redirects to
`/login` when it receives a `401`. fileciteturn6file5L634-L647

This can turn a backend authentication regression into widespread
apparent user logout behavior.

------------------------------------------------------------------------

# 24. 403 Monitoring

`403` responses should be interpreted in context.

They can represent:

``` text
Invalid/expired JWT in the current middleware behavior
Budget role restriction
Unauthorized resource operation
```

A spike in `403` responses should therefore be correlated with the
affected endpoint rather than treated as one universal failure category.

------------------------------------------------------------------------

# 25. 404 Monitoring

`404` responses can represent:

``` text
Unknown route
Missing resource
Missing authenticated profile
```

The exact endpoint should always be inspected before treating a 404 as
an infrastructure problem.

------------------------------------------------------------------------

# 26. 409 Monitoring

The current registration flow uses:

``` text
409 Conflict
```

for duplicate email registration.

A high number of 409 responses may therefore be normal application
behavior rather than server failure.

Metrics should distinguish:

``` text
expected business conflicts
```

from:

``` text
unexpected server errors
```

------------------------------------------------------------------------

# 27. 5xx Monitoring

A rise in 5xx responses is a high-priority signal.

Investigate:

``` text
Application exceptions
Database failures
Infrastructure failures
Configuration errors
Unexpected integration failures
```

Use request-level context to identify the affected domain.

------------------------------------------------------------------------

# 28. Latency Monitoring

Track API latency by route.

Important categories include:

``` text
Authentication
Budgets
Transactions
Reports
Notifications
Invitations
```

A single global average can hide a slow endpoint.

Prefer:

``` text
Route-level latency
```

and, where supported:

``` text
Percentiles
```

such as:

``` text
p50
p95
p99
```

The repository does not currently establish these metrics; they are
recommended operational measurements.

------------------------------------------------------------------------

# 29. Error Rate Monitoring

Useful application-level rates include:

``` text
Overall 5xx rate
Auth failure rate
Database error rate
Socket failure rate
Email failure rate
```

Break down metrics by:

``` text
route
operation
environment
release
```

when the monitoring platform supports it.

------------------------------------------------------------------------

# 30. Availability

Availability should be measured from the user's perspective.

A useful definition is:

``` text
Can a valid user reach the application and complete a critical workflow?
```

not merely:

``` text
Is the process running?
```

------------------------------------------------------------------------

# 31. SLIs

Possible service-level indicators include:

``` text
API success rate
API latency
Login success rate
Database availability
Socket connection success
Critical workflow success
```

The repository does not define official SLOs, so no specific percentage
target is declared here.

------------------------------------------------------------------------

# 32. SLOs

Production teams should define explicit targets for critical services.

For example:

``` text
API availability target
Authentication success target
Latency target
```

Targets must be based on actual product/business requirements rather
than arbitrary values.

------------------------------------------------------------------------

# 33. Alerting Principles

Alerts should be:

``` text
Actionable
Specific
Low-noise
Severity-aware
```

Avoid alerting on every expected:

``` text
401
403
404
409
```

Instead alert on meaningful changes such as:

``` text
Sudden 5xx spike
Database unavailable
Large authentication failure spike
Socket infrastructure failure
Process crash loop
```

------------------------------------------------------------------------

# 34. Alert Severity

A practical severity model:

### P0 --- Critical

``` text
Complete application outage
Database unavailable
Major data integrity incident
```

### P1 --- High

``` text
Authentication broadly broken
Major API domain unavailable
Real-time collaboration broadly broken
```

### P2 --- Moderate

``` text
One feature degraded
Email workflow degraded
Specific endpoint failing
```

### P3 --- Low

``` text
Minor UI issue
Non-critical warning
Low-impact operational issue
```

The exact severity definitions should be adapted to the organization's
incident policy.

------------------------------------------------------------------------

# 35. Incident Detection

An incident can be detected through:

``` text
Monitoring alert
User report
Support ticket
Developer observation
Deployment smoke-test failure
```

The first response should establish:

``` text
What changed?
Who is affected?
How widespread is it?
Is data at risk?
```

------------------------------------------------------------------------

# 36. Incident Triage

Use this sequence:

``` text
1. Confirm the incident
2. Determine scope
3. Identify affected component
4. Check recent deployments
5. Check infrastructure
6. Check application errors
7. Mitigate user impact
8. Decide rollback/fix-forward
9. Verify recovery
10. Document incident
```

------------------------------------------------------------------------

# 37. Recent Deployment Check

When a production issue appears immediately after a release:

``` text
Current release
      │
      ▼
Compare with previous release
      │
      ▼
Check changed:
  - API
  - database
  - auth
  - socket
  - configuration
      │
      ▼
Rollback if appropriate
```

Correlation with deployment timing is evidence, not proof; confirm the
actual failure mechanism.

------------------------------------------------------------------------

# 38. Authentication Incident Playbook

If users cannot log in:

``` text
1. Check POST /api/auth/login
2. Check backend errors
3. Check database connectivity
4. Check JWT_SECRET
5. Check JWT_EXPIRES_IN
6. Check password hashing/comparison
7. Test with controlled account
8. Verify profile endpoint
```

If login succeeds but users are immediately logged out:

``` text
Check JWT verification
Check token storage
Check Authorization header
Check /auth/profile
Check 401 interceptor behavior
```

------------------------------------------------------------------------

# 39. Database Incident Playbook

If multiple domains fail:

``` text
1. Check database connectivity
2. Check provider health
3. Check connection/resource limits
4. Check recent schema changes
5. Check failing queries
6. Determine read/write impact
7. Protect data integrity
8. Recover service
```

Avoid destructive database actions during an incident without confirming
the failure and recovery plan.

------------------------------------------------------------------------

# 40. Socket Incident Playbook

If collaboration is broken:

``` text
1. Check Socket.IO connection
2. Check JWT handshake
3. Check room joins
4. Check event emission
5. Check receiving listener
6. Check Redis if multi-instance
7. Check process-local presence
8. Verify REST state independently
```

If REST works but Socket.IO does not, the durable data may still be
intact.

------------------------------------------------------------------------

# 41. Email Incident Playbook

If password reset or invitations fail:

``` text
1. Check API request
2. Check email service logs
3. Check email credentials
4. Check provider status
5. Check FRONTEND_URL
6. Verify generated link
7. Verify recipient
```

Do not rotate credentials blindly before identifying whether the issue
is:

``` text
Authentication
Provider
Configuration
Application
```

------------------------------------------------------------------------

# 42. Data Integrity Incident

A suspected financial-data integrity issue should be treated as high
severity.

Immediate priorities:

``` text
1. Stop further destructive operations if necessary
2. Preserve logs/evidence
3. Identify affected records
4. Determine source of incorrect state
5. Check database history/audit data
6. Restore or correct using controlled procedure
7. Verify dependent reports/UI
```

Budget history can provide durable historical information for budget
changes.

------------------------------------------------------------------------

# 43. Evidence Preservation

During a serious incident preserve:

``` text
Deployment version
Relevant logs
Error messages
Request IDs
Database timestamps
Infrastructure events
Configuration version
```

Do not preserve sensitive secrets merely because they are present in
logs or configuration.

------------------------------------------------------------------------

# 44. Post-Incident Review

After recovery, document:

``` text
Incident summary
Impact
Timeline
Root cause
Contributing factors
Detection method
Mitigation
Permanent fix
Follow-up actions
```

Avoid writing only:

``` text
"Bug fixed."
```

The purpose is to reduce recurrence.

------------------------------------------------------------------------

# 45. Root Cause vs Symptom

Example:

``` text
Symptom:
Users are repeatedly redirected to login.

Possible root cause:
JWT verification configuration mismatch.
```

The incident record should identify the underlying cause rather than
stopping at the visible symptom.

------------------------------------------------------------------------

# 46. Observability Improvement Loop

After incidents:

``` text
Incident
   │
   ▼
What was hard to diagnose?
   │
   ▼
Add log/metric/alert
   │
   ▼
Update runbook
   │
   ▼
Future incident diagnosed faster
```

Observability should evolve based on real operational failures.

------------------------------------------------------------------------

# 47. Production Dashboard

A useful application dashboard should include:

``` text
Request volume
5xx rate
4xx rate
Latency
Database errors
Authentication failures
Active socket connections
Socket errors
Redis health
Email failures
Process restarts
```

If reports or domain-specific workflows are business-critical, add
domain-level success indicators.

------------------------------------------------------------------------

# 48. Release Dashboard Correlation

During a deployment, compare:

``` text
Before release
      │
      ▼
Deployment
      │
      ▼
After release
```

for:

``` text
Error rate
Latency
Authentication
Database
Socket connections
```

This makes regressions easier to identify.

------------------------------------------------------------------------

# 49. Operational Runbook Principle

Every recurring production failure should eventually have a short
runbook containing:

``` text
Symptoms
Checks
Likely causes
Mitigation
Recovery
Escalation
```

The runbook should be actionable by someone who did not write the
affected code.

------------------------------------------------------------------------

# 50. Monitoring Gaps

The supplied repository does not establish complete implementation for:

``` text
Structured logging
Correlation IDs
Metrics
Distributed tracing
Alerting
Health endpoint
Readiness endpoint
Centralized error reporting
Production dashboard
SLO monitoring
Automated incident management
```

These are production observability capabilities to implement at the
application/infrastructure layer as required.

------------------------------------------------------------------------

# 51. Observability Checklist

``` text
[ ] Backend error logs available
[ ] Database failures visible
[ ] HTTP status rates monitored
[ ] Authentication failures monitored
[ ] Socket failures monitored
[ ] Redis monitored if enabled
[ ] Email failures monitored
[ ] Sensitive data excluded from logs
[ ] Production alerts configured
[ ] Deployment correlation available
[ ] Incident runbooks documented
[ ] Backup/recovery process known
```

------------------------------------------------------------------------

# 52. Incident Readiness Checklist

``` text
[ ] On-call owner identified
[ ] Deployment history accessible
[ ] Production logs accessible
[ ] Database status accessible
[ ] Redis status accessible if used
[ ] Email provider status accessible
[ ] Rollback process documented
[ ] Database recovery process documented
[ ] Critical workflow smoke tests available
[ ] Incident severity definitions agreed
```

------------------------------------------------------------------------

# 53. Observability Architecture Summary

``` text
                     Production
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      Application      Database       Infra
          │              │              │
     ┌────┼────┐         │         ┌────┴────┐
     ▼    ▼    ▼         ▼         ▼         ▼
   Logs Metrics Errors PostgreSQL Redis     Email
     │    │    │
     └────┼────┘
          ▼
      Monitoring
          │
          ▼
       Alerts
          │
          ▼
     Incident response
          │
          ▼
    Recovery / learning
```

The central principle is:

> **Production observability should make failures detectable,
> diagnosable, and recoverable without exposing sensitive information;
> logs, metrics, infrastructure signals, and documented incident
> procedures should work together rather than operating as isolated
> tools.**

------------------------------------------------------------------------

# 54. Next Part

**Part 17 --- Security Hardening & Production Security**

The next document will focus specifically on security beyond the core
authentication flow:

-   Threat model
-   Trust boundaries
-   Secret management
-   JWT security
-   Password security
-   CORS
-   API authorization
-   Resource ownership
-   Input validation
-   Error leakage
-   Socket security
-   Invitation/reset-token security
-   Database security
-   Redis security
-   Email security
-   Logging security
-   Rate limiting considerations
-   Abuse prevention
-   Security review checklist
-   Production security hardening roadmap
