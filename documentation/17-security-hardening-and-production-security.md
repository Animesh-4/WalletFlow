# WalletFlow --- Security Hardening & Production Security

## Part 17 --- Security Model, Threats & Hardening

This document focuses on production security beyond the core
authentication implementation.

The repository already establishes important security foundations:

``` text
JWT authentication
bcrypt password hashing
authenticated REST middleware
budget role authorization
user-scoped notifications
hashed password-reset tokens
Socket.IO JWT authentication
production JWT-secret validation
```

This document separates those source-backed controls from additional
hardening areas that are not fully established by the supplied
repository.

------------------------------------------------------------------------

# 1. Security Architecture

The application's primary security boundaries are:

``` text
Browser
   │
   ▼
HTTP / Socket.IO
   │
   ▼
Authentication
   │
   ▼
Authenticated identity
   │
   ▼
Resource authorization
   │
   ▼
Domain service
   │
   ▼
Database
```

The most important principle is:

> Authentication establishes who the caller is; authorization
> establishes what that caller may do.

------------------------------------------------------------------------

# 2. Trust Boundaries

WalletFlow contains several trust boundaries:

``` text
Browser → Backend
Backend → Database
Backend → Redis
Backend → Email provider
Socket client → Socket.IO server
User → Shared budget
```

Data crossing these boundaries should be treated as untrusted until
validated.

------------------------------------------------------------------------

# 3. Browser Is Untrusted

The frontend is a client.

Never rely on:

``` text
Hidden button
Disabled button
React state
Client-side role
Client-supplied user ID
```

as the final security boundary.

The backend must enforce:

``` text
Authentication
Authorization
Resource ownership
Role permissions
```

------------------------------------------------------------------------

# 4. JWT Authentication

The application uses JWTs for authenticated sessions.

The JWT currently contains:

``` text
id
email
```

The backend verifies the token before accepting protected requests.

The same authentication model is used for Socket.IO handshake
authentication.

------------------------------------------------------------------------

# 5. JWT Secret

`JWT_SECRET` is a critical secret.

Production must use a unique secret.

The environment configuration explicitly rejects the known
development/default JWT secret in production.
fileciteturn6file1L205-L245

Operational rules:

``` text
Never commit it
Never expose it to frontend code
Never log it
Never place it in error messages
```

------------------------------------------------------------------------

# 6. JWT Expiration

JWT expiration should be configured deliberately.

Shorter lifetimes reduce the window of exposure if a token is
compromised.

Longer lifetimes reduce authentication friction.

The repository provides:

``` text
JWT_EXPIRES_IN
```

as the configuration boundary.

The actual production duration should be determined by the application's
security/session policy.

------------------------------------------------------------------------

# 7. JWT Rotation

The supplied repository does not establish a refresh-token or automated
JWT key-rotation protocol.

Therefore production teams should explicitly define:

``` text
Secret rotation process
Token invalidation strategy
User session behavior after rotation
Emergency credential rotation
```

Do not assume secret rotation is already handled automatically.

------------------------------------------------------------------------

# 8. Password Hashing

Passwords are hashed using:

``` text
bcryptjs
```

with:

``` text
10 salt rounds
```

The password hash is not returned in normal successful authentication
responses. fileciteturn6file0L61-L85

Plaintext passwords must never be stored.

------------------------------------------------------------------------

# 9. Password Handling Rules

Never:

``` text
Log passwords
Return passwords
Store plaintext passwords
Send passwords by email
Use passwords as reset tokens
```

Password input should only exist long enough to perform the required
authentication/hash operation.

------------------------------------------------------------------------

# 10. Password Reset Security

The reset flow uses:

``` text
Random token
      │
      ▼
Hash token
      │
      ▼
Store hash + expiry
      │
      ▼
Send raw token through reset link
```

The token expires after one hour in the current service implementation.
fileciteturn6file0L95-L125

This is preferable to storing the raw reset token.

------------------------------------------------------------------------

# 11. Password Reset Enumeration Protection

The forgot-password workflow returns the same user-facing message
whether the email exists or not.

This reduces account-enumeration risk. fileciteturn6file0L109-L113

Maintain this behavior unless there is a deliberate security review
supporting a change.

------------------------------------------------------------------------

# 12. Password Reset Token Handling

Raw reset tokens should never appear in:

``` text
Logs
Analytics
Error messages
Database records
Monitoring payloads
```

The raw token should only be used to complete the reset workflow.

------------------------------------------------------------------------

# 13. Invitation Token Security

Invitation links contain a token.

Treat invitation tokens as sensitive credentials until they are consumed
or invalidated.

Do not expose them through:

``` text
Logs
Analytics
Error reporting
Debug output
```

The supplied source establishes invitation token URLs but does not
provide enough evidence here to claim a complete token
rotation/revocation policy.

------------------------------------------------------------------------

# 14. Authentication Middleware

Protected REST requests use authentication middleware.

The middleware:

``` text
Read Authorization header
      │
      ▼
Require Bearer token
      │
      ▼
Verify JWT
      │
      ▼
Attach user identity
```

The current middleware rejects missing credentials and invalid/expired
tokens. fileciteturn5file2L299-L334

------------------------------------------------------------------------

# 15. Authorization After Authentication

A valid token is not enough.

For resource operations:

``` text
JWT identity
    │
    ▼
Resource lookup
    │
    ▼
Membership/ownership
    │
    ▼
Role
    │
    ▼
Allowed operation
```

Budget updates and deletion explicitly apply this model.

------------------------------------------------------------------------

# 16. Budget Role Security

Current roles:

``` text
owner
editor
viewer
```

Current service rules include:

``` text
Owner
  ├── budget modifications
  └── deletion

Editor
  └── allowed budget increase

Viewer
  └── cannot modify budget
```

The service explicitly rejects unauthorized operations with `403`.
fileciteturn6file6L733-L797

------------------------------------------------------------------------

# 17. Backend Authorization Must Be Authoritative

Frontend role logic is useful for UX.

It is not sufficient for security.

For example:

``` text
Editor UI hides Delete
```

must still be backed by:

``` text
DELETE /api/budgets/:id
→ backend owner check
```

The backend must remain authoritative.

------------------------------------------------------------------------

# 18. Resource Ownership

Every user-scoped resource should be evaluated against:

``` text
Authenticated user
```

rather than trusting a request-provided owner ID.

The notification controller, for example, uses:

``` text
req.user.id
```

when retrieving and modifying notifications.
fileciteturn5file9L1216-L1249

------------------------------------------------------------------------

# 19. IDOR Prevention

A common authorization vulnerability is insecure direct object
reference:

``` text
GET /resource/123
```

where the caller changes:

``` text
123 → 124
```

and accesses another user's resource.

Resource lookups should therefore include the authenticated identity or
perform an explicit authorization check.

Budget retrieval already incorporates the authenticated user into the
service lookup.

------------------------------------------------------------------------

# 20. User ID Trust

Never trust:

``` json
{
  "userId": "..."
}
```

as proof of identity.

The trusted identity is:

``` text
req.user.id
```

for REST.

For Socket.IO:

``` text
socket.user
```

is the authenticated identity established from the verified JWT.

------------------------------------------------------------------------

# 21. Socket Authentication

Socket.IO connections authenticate through the JWT handshake.

The backend accepts the token from:

``` text
socket.handshake.auth.token
```

or:

``` text
socket.handshake.query.token
```

and verifies it before assigning:

``` text
socket.user
```

fileciteturn4file9L1093-L1147

------------------------------------------------------------------------

# 22. Socket Authorization

Socket authentication does not automatically authorize every budget.

A secure design remains:

``` text
Authenticate socket
      │
      ▼
Verify budget membership
      │
      ▼
Join/operate on budget room
```

A room name must not be treated as authorization.

------------------------------------------------------------------------

# 23. Socket Room Security

Never assume:

``` text
joined budget room
```

means:

``` text
authorized budget member
```

The database membership model remains the persistent authorization
source.

------------------------------------------------------------------------

# 24. CORS

The backend configures CORS using:

``` text
FRONTEND_URL
```

and allows credentials.

Production should configure the exact intended frontend origin.

Avoid broad production origins such as:

``` text
*
```

when authenticated browser interactions require a specific trusted
origin.

The supplied backend configuration already uses the configured frontend
origin. fileciteturn5file2L337-L354

------------------------------------------------------------------------

# 25. HTTPS

Production should use HTTPS for:

``` text
REST
Socket.IO
Password-reset links
Invitation links
Authentication
```

Without transport encryption, tokens and sensitive application traffic
can be exposed.

The repository does not define TLS termination; this belongs to the
deployment infrastructure.

------------------------------------------------------------------------

# 26. Secure Cookies vs Local Storage

The current frontend stores the JWT in:

``` text
localStorage
```

The authentication context reads and writes:

``` text
localStorage
```

for session persistence. fileciteturn6file3L383-L404

This is an important security consideration because
JavaScript-accessible storage can be exposed if an attacker executes
malicious script in the application.

The repository does not establish an HttpOnly-cookie authentication
architecture.

------------------------------------------------------------------------

# 27. XSS Risk

Because authentication state is browser-accessible, frontend XSS
prevention becomes particularly important.

Security practices should include:

``` text
Avoid unsafe HTML injection
Validate untrusted content
Escape rendered user content
Keep dependencies updated
Use browser security headers where appropriate
```

The supplied source does not establish a complete CSP/XSS-hardening
implementation.

------------------------------------------------------------------------

# 28. Input Validation

All client input should be treated as untrusted.

Validation should occur before:

``` text
Database mutation
Authentication decisions
Email generation
Financial calculations
Resource lookup
```

The repository uses validation infrastructure in the backend, but the
exact validation coverage should be checked per endpoint.

------------------------------------------------------------------------

# 29. SQL Injection

The application uses Drizzle ORM for database access.

Application code should continue using parameterized ORM/query
mechanisms rather than string-building SQL from user input.

Do not introduce raw SQL with untrusted values concatenated directly
into query strings.

------------------------------------------------------------------------

# 30. Financial Data Validation

Financial inputs require additional care.

Validate:

``` text
Amount
Currency-related fields
Dates
Transaction type
Budget values
Category identifiers
```

before persistence.

Do not rely on frontend numeric validation alone.

------------------------------------------------------------------------

# 31. Authorization and Financial Mutations

High-risk operations include:

``` text
Budget modification
Budget deletion
Transaction modification
Transaction deletion
Collaboration changes
```

These should have explicit server-side authorization rules.

A successful authentication should never automatically grant write
access to all financial resources.

------------------------------------------------------------------------

# 32. Error Leakage

Production errors should not expose:

``` text
Stack traces
Database connection strings
JWT secrets
Passwords
Internal filesystem paths
Provider credentials
Raw reset tokens
```

Clients should receive safe error messages.

Detailed diagnostic information belongs in controlled server-side logs.

------------------------------------------------------------------------

# 33. Authentication Error Consistency

Invalid credentials should not reveal unnecessary account information.

The current login flow uses:

``` text
Invalid credentials
```

for failed authentication rather than distinguishing unknown email from
wrong password at the API boundary. fileciteturn6file0L77-L86

Preserve this property.

------------------------------------------------------------------------

# 34. Rate Limiting

The supplied source does not establish a complete rate-limiting
implementation.

Production hardening should consider rate limiting especially for:

``` text
Login
Registration
Forgot password
Reset password
Invitation endpoints
```

and potentially expensive reporting operations.

Rate limits should be designed around:

``` text
IP
User/account
Endpoint
Time window
```

where appropriate.

------------------------------------------------------------------------

# 35. Brute-Force Protection

Authentication endpoints should be protected against repeated credential
attempts.

Recommended controls include:

``` text
Rate limiting
Monitoring
Progressive throttling
Alerting
```

The exact mechanism is deployment/application-specific and is not
established by the current repository.

------------------------------------------------------------------------

# 36. Abuse Prevention

Potential abuse surfaces include:

``` text
Registration
Login
Password reset
Invitation creation
Budget collaboration
Transaction creation
Report generation
Socket connections
```

Production controls should prevent a malicious client from generating
disproportionate load.

------------------------------------------------------------------------

# 37. Resource Exhaustion

Consider limits for:

``` text
Request body size
Transaction count per request
Report query range
Invitation frequency
Socket connection count
Database connection usage
```

The repository does not establish complete application-level limits for
all of these.

------------------------------------------------------------------------

# 38. Database Security

Production database security should include:

``` text
Private credentials
Restricted network access
Least-privilege database user
Encrypted connections
Backups
Monitoring
```

The application should not expose:

``` text
DATABASE_URL
```

to frontend code.

------------------------------------------------------------------------

# 39. Redis Security

If Redis is deployed:

``` text
Use authenticated/private connection
Restrict network access
Protect REDIS_URL
Avoid exposing Redis publicly
Monitor access
```

Redis should be treated as infrastructure, not a public application
endpoint.

------------------------------------------------------------------------

# 40. Email Security

Email credentials must remain server-side.

Password-reset and invitation URLs should use:

``` text
HTTPS production frontend
```

and should not be written to logs.

The email provider should also be configured according to its secure
authentication requirements.

------------------------------------------------------------------------

# 41. Logging Security

Logs should be treated as sensitive operational data.

Never log:

``` text
Password
JWT
JWT_SECRET
DATABASE_URL
REDIS_URL
EMAIL_PASS
Reset token
Invitation token
Authorization header
```

If identifiers are logged, use only the minimum required context.

------------------------------------------------------------------------

# 42. Dependency Security

Production security includes the dependency supply chain.

Regularly review:

``` text
npm dependencies
Security advisories
Outdated packages
Transitive dependencies
```

The supplied repository does not establish an automated
dependency-security pipeline.

------------------------------------------------------------------------

# 43. Secret Management

Secrets should be provided through:

``` text
Deployment environment
Secret manager
Managed platform secrets
```

rather than:

``` text
Source code
Frontend bundle
Committed .env files
```

The repository ignores `.env`, which helps prevent accidental local
environment-file commits.

------------------------------------------------------------------------

# 44. Environment Separation

Use separate secrets and infrastructure for:

``` text
Development
Testing
Production
```

Never reuse production credentials in local development.

------------------------------------------------------------------------

# 45. Production Configuration Security

At deployment time verify:

``` text
NODE_ENV=production
JWT_SECRET unique
DATABASE_URL production
FRONTEND_URL correct
Redis credentials protected
Email credentials protected
```

The backend specifically validates the production JWT secret
requirement.

------------------------------------------------------------------------

# 46. Security Headers

The supplied repository does not establish a complete security-header
policy.

Production infrastructure/application hardening should evaluate headers
such as:

``` text
Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
```

The exact header set should be based on the frontend architecture and
deployment requirements.

------------------------------------------------------------------------

# 47. CSRF Considerations

The current frontend authentication architecture uses a JWT stored in
browser local storage and sends it explicitly in the Authorization
header.

This differs from a cookie-based authentication model.

If authentication architecture changes to cookies, explicitly review:

``` text
CSRF protection
SameSite
Secure
HttpOnly
Origin checks
```

Do not assume the current token architecture and a future cookie
architecture have identical security properties.

------------------------------------------------------------------------

# 48. File and Upload Security

The supplied architecture does not establish a general user-file upload
subsystem.

If uploads are introduced later, security requirements should include:

``` text
File type validation
Size limits
Malware scanning where appropriate
Safe storage
Filename normalization
Access control
Content-disposition controls
```

Do not treat uploaded filenames or MIME types as trusted.

------------------------------------------------------------------------

# 49. Invitation Authorization

Invitation acceptance should result in:

``` text
Authenticated user
        │
        ▼
Invitation validation
        │
        ▼
Budget membership
```

The invitation token itself should not bypass normal authenticated
identity rules.

------------------------------------------------------------------------

# 50. Notification Authorization

Notifications must remain user-scoped.

The current controller passes the authenticated user identity to
notification operations.

Therefore an attacker should not be able to modify another user's
notification simply by changing an ID in the URL.

This ownership pattern should be preserved for future notification
endpoints. fileciteturn5file9L1216-L1249

------------------------------------------------------------------------

# 51. Budget Deletion Security

Budget deletion is an especially sensitive operation.

The current service requires:

``` text
owner
```

before deletion. fileciteturn6file6L794-L797

Any future alternative deletion path must enforce the same authorization
rule.

------------------------------------------------------------------------

# 52. Transaction Deletion Security

Transaction deletion should be treated as a financial mutation.

The endpoint exists:

``` text
DELETE /api/transactions/:id
```

and is protected by authentication middleware.

The complete resource-ownership/role policy should be verified against
the transaction service before changing or expanding deletion behavior.

------------------------------------------------------------------------

# 53. Security Testing Priorities

High-value security tests include:

``` text
Missing JWT
Invalid JWT
Expired JWT
Cross-user resource access
Non-member budget access
Viewer mutation
Editor forbidden mutation
Non-owner deletion
Password reset token misuse
Invitation token misuse
Notification ownership
Socket authentication failure
Socket unauthorized budget access
```

------------------------------------------------------------------------

# 54. Security Review Checklist

Before production release:

``` text
[ ] HTTPS enabled
[ ] Production JWT secret configured
[ ] JWT secret not logged
[ ] Passwords hashed
[ ] Password hashes not exposed
[ ] Reset tokens hashed
[ ] Reset tokens expire
[ ] Authentication endpoints protected against abuse
[ ] Resource authorization verified
[ ] Budget roles enforced server-side
[ ] Notifications user-scoped
[ ] Socket authentication enabled
[ ] Socket authorization reviewed
[ ] CORS restricted
[ ] Secrets excluded from frontend
[ ] Secrets excluded from logs
[ ] Database access restricted
[ ] Redis access restricted
[ ] Email credentials protected
[ ] Dependencies reviewed
[ ] Security headers evaluated
```

------------------------------------------------------------------------

# 55. Security Incident Priorities

Treat the following as high-priority incidents:

``` text
JWT_SECRET exposure
Database credential exposure
Unauthorized financial-data access
Cross-user resource access
Password compromise
Reset-token leakage
Invitation-token abuse
Database corruption
Authentication bypass
```

These should trigger immediate containment and investigation.

------------------------------------------------------------------------

# 56. Credential Rotation

If a critical secret is exposed:

``` text
1. Contain exposure
2. Rotate secret
3. Revoke affected sessions/credentials where necessary
4. Investigate source
5. Check logs for abuse
6. Deploy corrected configuration
7. Verify recovery
8. Document incident
```

The repository does not establish an automated credential-rotation
mechanism, so operations must define the procedure.

------------------------------------------------------------------------

# 57. Security Hardening Roadmap

A practical security-hardening sequence is:

``` text
1. Verify existing authentication
2. Verify complete authorization matrix
3. Add endpoint rate limiting
4. Add security headers
5. Add structured security logging
6. Add dependency scanning
7. Add Socket.IO authorization tests
8. Add resource-ownership tests
9. Add secret-management controls
10. Perform external security review
```

Prioritize controls based on actual threat exposure.

------------------------------------------------------------------------

# 58. Security Architecture Summary

``` text
                         User
                          │
                    Untrusted client
                          │
                ┌─────────┴─────────┐
                ▼                   ▼
             REST API           Socket.IO
                │                   │
                ▼                   ▼
         JWT authentication  JWT authentication
                │                   │
                ▼                   ▼
        Resource authorization   Room authorization
                │                   │
                └─────────┬─────────┘
                          ▼
                     Domain services
                          │
                          ▼
                     PostgreSQL
                          │
                    Durable state

Supporting infrastructure:
Redis
Email
Secrets
Monitoring
```

The central security principle is:

> **Treat every client-controlled value as untrusted, authenticate
> identity explicitly, authorize every protected resource operation on
> the server, keep secrets server-side, and make security controls
> observable and testable.**

------------------------------------------------------------------------

# 59. Next Part

**Part 18 --- Architecture & Codebase Conventions**

The next document will explain how engineers should navigate and extend
the codebase:

-   Repository structure
-   Backend layering
-   Frontend layering
-   Naming conventions
-   Controller/service/model responsibilities
-   Route conventions
-   API service conventions
-   Context/hook conventions
-   Socket conventions
-   Error-handling conventions
-   Configuration conventions
-   Database conventions
-   Dependency boundaries
-   Adding features safely
-   Refactoring rules
-   Code-review expectations
-   Documentation conventions
