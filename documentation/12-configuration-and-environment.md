# WalletFlow --- Configuration & Environment

## Part 12 --- Configuration, Environment Variables & Runtime Settings

This document defines the WalletFlow configuration architecture based on
the supplied repository.

WalletFlow separates configuration into:

``` text
Backend runtime configuration
Frontend build-time configuration
```

The backend centralizes server configuration in:

``` text
src/config/env.js
```

and related modules:

``` text
src/config/database.js
src/config/jwt.js
src/config/socket.js
```

The frontend consumes environment variables through the React build
environment.

------------------------------------------------------------------------

# 1. Configuration Architecture

The configuration flow is:

``` text
Environment
    │
    ├───────────────┐
    ▼               ▼
 Backend          Frontend
    │               │
    ▼               ▼
config/env.js    REACT_APP_*
    │
    ├── database
    ├── JWT
    ├── CORS
    ├── Redis
    └── email
```

The backend should be treated as the authoritative configuration
boundary for server-side secrets and infrastructure credentials.

------------------------------------------------------------------------

# 2. Backend Configuration Entry Point

The primary backend configuration module is:

``` text
src/config/env.js
```

It centralizes environment access instead of requiring every backend
module to read `process.env` independently.

This makes configuration easier to:

``` text
Validate
Inspect
Document
Change
Test
```

------------------------------------------------------------------------

# 3. Backend Environment Variables

The current backend configuration recognizes:

``` text
NODE_ENV
PORT
DATABASE_URL
JWT_SECRET
JWT_EXPIRES_IN
FRONTEND_URL
BACKEND_URL
REDIS_URL
EMAIL_USER
EMAIL_PASS
EMAIL
```

The exact required/optional behavior varies by environment and feature.

------------------------------------------------------------------------

# 4. NODE_ENV

``` env
NODE_ENV=development
```

or:

``` env
NODE_ENV=production
```

This variable controls environment-sensitive behavior.

Production configuration performs additional security validation.

------------------------------------------------------------------------

# 5. NODE_ENV --- Development

Development mode is intended for local development.

The repository supports development defaults, including the default
local server behavior.

Development configuration must not be copied blindly into production.

------------------------------------------------------------------------

# 6. NODE_ENV --- Production

Production mode enables stricter configuration validation.

The current backend explicitly checks production JWT configuration and
rejects the known development/default JWT secret.

Therefore:

``` text
NODE_ENV=production
```

requires a real production secret.

The environment validation logic establishes this behavior.
fileciteturn6file1L205-L245

------------------------------------------------------------------------

# 7. PORT

``` env
PORT=5000
```

`PORT` controls the backend HTTP server port.

The backend uses the configured port when starting the HTTP/Express
server.

For local development, the repository's documented/default server
behavior uses:

``` text
5000
```

unless overridden.

------------------------------------------------------------------------

# 8. DATABASE_URL

``` env
DATABASE_URL=...
```

This is the PostgreSQL/Neon database connection string.

It is consumed by:

``` text
src/config/database.js
```

and used to initialize:

``` text
Neon Pool
Drizzle
```

Database initialization is required for backend startup.
fileciteturn5file7L987-L1022

------------------------------------------------------------------------

# 9. DATABASE_URL Security

`DATABASE_URL` is a server-side secret/configuration value.

It must not be exposed through:

``` text
React frontend code
Browser JavaScript
Public client configuration
```

Only backend infrastructure should consume the database connection
string.

------------------------------------------------------------------------

# 10. JWT_SECRET

``` env
JWT_SECRET=...
```

This is the server-side secret used to:

``` text
Sign JWTs
Verify JWTs
```

It is consumed by:

``` text
config/jwt.js
authController.js
middleware/auth.js
socketHandler.js
```

------------------------------------------------------------------------

# 11. JWT_SECRET Production Rule

The backend explicitly rejects the known default/development JWT secret
when running in production.

This protects against accidentally deploying the application with a
predictable signing key. fileciteturn6file1L205-L245

Production deployments must therefore provide a unique secret.

------------------------------------------------------------------------

# 12. JWT_EXPIRES_IN

``` env
JWT_EXPIRES_IN=...
```

This controls JWT expiration configuration.

The authentication controller passes this configuration into JWT
signing.

Conceptually:

``` text
Login
  │
  ▼
jwt.sign(payload, secret, { expiresIn })
```

The exact production value should be chosen according to the
deployment's security/session policy rather than assumed by application
documentation.

------------------------------------------------------------------------

# 13. FRONTEND_URL

``` env
FRONTEND_URL=https://...
```

The backend uses `FRONTEND_URL` for frontend-facing integration points.

It is used for:

``` text
CORS
Password reset links
Invitation links
```

The CORS configuration explicitly uses the configured frontend origin.
fileciteturn5file2L337-L354

------------------------------------------------------------------------

# 14. FRONTEND_URL and CORS

The backend's CORS configuration allows the configured frontend origin.

The current configuration enables:

``` text
credentials: true
```

and permits:

``` text
GET
HEAD
PUT
PATCH
POST
DELETE
```

Therefore the production `FRONTEND_URL` must match the actual browser
application origin.

------------------------------------------------------------------------

# 15. FRONTEND_URL and Password Reset

Password reset emails construct the frontend reset URL from:

``` text
FRONTEND_URL
```

with a reset token.

The current route format is:

``` text
/reset-password?token=<token>
```

The email service constructs this URL dynamically.
fileciteturn6file7L834-L845

------------------------------------------------------------------------

# 16. FRONTEND_URL and Invitations

Invitation emails similarly construct the invitation URL using:

``` text
FRONTEND_URL
```

and the invitation token.

The current invitation link points to:

``` text
/accept-invitation?token=<token>
```

The email service establishes this format.
fileciteturn6file7L847-L857

------------------------------------------------------------------------

# 17. BACKEND_URL

``` env
BACKEND_URL=https://...
```

The backend configuration recognizes this value.

It represents the public backend URL used by deployment/integration
configuration where required.

The supplied source does not establish every current runtime consumer of
this value, so it should not be assumed to be required for every backend
operation.

------------------------------------------------------------------------

# 18. REDIS_URL

``` env
REDIS_URL=...
```

This configures optional Redis infrastructure for Socket.IO.

When configured, the backend can initialize Redis publisher/subscriber
clients and attach the Socket.IO Redis adapter.

Conceptually:

``` text
Backend A
   │
   ▼
Redis
   ▲
   │
Backend B
```

This supports distributed Socket.IO event coordination.

------------------------------------------------------------------------

# 19. Redis Is Optional

The backend can operate without the Redis configuration.

Therefore:

``` text
REDIS_URL absent
    │
    ▼
Normal single-process Socket.IO behavior
```

and:

``` text
REDIS_URL present
    │
    ▼
Redis-backed Socket.IO adapter
```

The presence of Redis does not by itself establish globally shared
live-user state.

------------------------------------------------------------------------

# 20. EMAIL_USER

``` env
EMAIL_USER=...
```

This is an email integration configuration value.

It is used by the backend email service when configuring outbound email
behavior.

------------------------------------------------------------------------

# 21. EMAIL_PASS

``` env
EMAIL_PASS=...
```

This is the email authentication credential used by the email service.

It is server-side sensitive configuration and must not be exposed to the
frontend.

------------------------------------------------------------------------

# 22. EMAIL

``` env
EMAIL=...
```

The backend configuration also recognizes:

``` text
EMAIL
```

as an email-related configuration value.

The exact distinction between this value and `EMAIL_USER` should follow
the current email service implementation and deployment configuration
rather than being inferred as a separate provider identity.

------------------------------------------------------------------------

# 23. Frontend Environment Variables

The frontend uses React environment variables with the required prefix:

``` text
REACT_APP_
```

The primary API configuration is:

``` env
REACT_APP_API_URL=...
```

------------------------------------------------------------------------

# 24. REACT_APP_API_URL

The frontend Axios client uses:

``` text
REACT_APP_API_URL
```

as its API base URL.

The current fallback is:

``` text
http://localhost:5000/api
```

The shared API client also attaches authentication tokens automatically.
fileciteturn6file5L608-L632

------------------------------------------------------------------------

# 25. Frontend API URL Format

The value should point to the API root.

For local development:

``` env
REACT_APP_API_URL=http://localhost:5000/api
```

For production:

``` env
REACT_APP_API_URL=https://api.example.com/api
```

The actual production domain is deployment-specific and should not be
hard-coded into source.

------------------------------------------------------------------------

# 26. Frontend Environment Security

React build-time environment variables are not suitable for storing
secrets.

Do not place:

``` text
DATABASE_URL
JWT_SECRET
EMAIL_PASS
Redis credentials
```

inside frontend `REACT_APP_*` variables.

Anything exposed to the frontend should be treated as public application
configuration.

------------------------------------------------------------------------

# 27. Configuration Ownership

Use this rule:

``` text
Server secret/infrastructure
        │
        ▼
Backend environment

Browser-visible configuration
        │
        ▼
Frontend environment
```

Examples:

``` text
DATABASE_URL → backend only
JWT_SECRET → backend only
EMAIL_PASS → backend only
REDIS_URL → backend only

REACT_APP_API_URL → frontend
```

------------------------------------------------------------------------

# 28. Configuration Modules

The backend configuration is divided by concern:

``` text
config/env.js
    └── environment values

config/database.js
    └── database initialization

config/jwt.js
    └── JWT settings

config/socket.js
    └── Socket.IO configuration
```

This separation should be preserved when adding new infrastructure
configuration.

------------------------------------------------------------------------

# 29. Environment Validation

Configuration validation should occur before the application enters
normal runtime.

The current environment configuration validates production requirements,
especially JWT security.

Conceptually:

``` text
Process start
    │
    ▼
Load environment
    │
    ▼
Validate configuration
    │
    ├── invalid → fail startup
    │
    └── valid
          │
          ▼
      initialize app
```

------------------------------------------------------------------------

# 30. Missing Configuration

Not every environment variable has the same failure behavior.

Examples:

``` text
DATABASE_URL
```

is required for database initialization.

``` text
JWT_SECRET
```

is security-critical, particularly in production.

``` text
REDIS_URL
```

is optional.

Email configuration is feature-dependent.

Therefore a deployment should distinguish:

``` text
Required
Optional
Feature-specific
Production-only
```

rather than treating every variable identically.

------------------------------------------------------------------------

# 31. Local Development Configuration

A typical local setup requires:

``` env
NODE_ENV=development
PORT=5000
DATABASE_URL=<local-or-neon-postgres-url>
JWT_SECRET=<development-secret>
JWT_EXPIRES_IN=<development-expiration>
FRONTEND_URL=http://localhost:3000
REACT_APP_API_URL=http://localhost:5000/api
```

Additional configuration may be required for:

``` text
Redis
Email
```

if those features are being exercised locally.

------------------------------------------------------------------------

# 32. Production Configuration

A production deployment should provide at minimum the values required by
the application's enabled runtime features.

Core configuration:

``` env
NODE_ENV=production
PORT=<deployment-port>
DATABASE_URL=<production-database-url>
JWT_SECRET=<unique-production-secret>
JWT_EXPIRES_IN=<chosen-expiration>
FRONTEND_URL=<production-frontend-origin>
```

Optional/feature-specific:

``` env
REDIS_URL=<redis-url>
EMAIL_USER=<email-account>
EMAIL_PASS=<email-credential>
EMAIL=<email-configuration>
BACKEND_URL=<public-backend-url>
```

------------------------------------------------------------------------

# 33. Production Secret Rules

Never use development defaults for:

``` text
JWT_SECRET
DATABASE credentials
Email credentials
Redis credentials
```

The repository explicitly protects the JWT secret case.

Other infrastructure credentials should follow the same operational
principle even where the source does not implement an equivalent startup
check.

------------------------------------------------------------------------

# 34. Environment File Handling

Environment files should be treated as deployment configuration rather
than application source.

The repository's `.gitignore` includes:

``` text
.env
```

This prevents ordinary local environment files from being committed.

The deployment system should provide production configuration through
its secure environment/secret mechanism.

------------------------------------------------------------------------

# 35. Configuration and Build-Time Behavior

Frontend environment variables are resolved as part of the frontend
build.

Therefore changing:

``` env
REACT_APP_API_URL
```

normally requires rebuilding the frontend bundle.

This differs from backend runtime configuration, which is read by the
Node.js process.

Conceptually:

``` text
Frontend:
env → build → browser bundle

Backend:
env → process startup → runtime
```

------------------------------------------------------------------------

# 36. Configuration Consistency

The following values must agree across deployment:

``` text
Frontend API URL
        │
        ▼
Backend public API address

Frontend browser origin
        │
        ▼
Backend FRONTEND_URL / CORS
```

A common production failure is:

``` text
Frontend points to API A
Backend CORS allows origin B
```

The browser then rejects the request despite the backend being
reachable.

------------------------------------------------------------------------

# 37. Authentication Configuration Consistency

JWT configuration must be consistent within the backend process:

``` text
Token signing
       │
       ▼
JWT_SECRET
       │
       ▼
Token verification
```

If a deployment changes the signing secret while existing tokens are
still expected to work, those existing tokens will no longer verify.

Secret rotation therefore requires an explicit session/token strategy.

The supplied repository does not establish an automated JWT key-rotation
protocol.

------------------------------------------------------------------------

# 38. Database Configuration Consistency

The database URL used by:

``` text
application
```

must point to the same intended database environment used by:

``` text
schema synchronization
seed operations
```

A common operational error is running schema commands against one
database while the application uses another.

Always verify the effective `DATABASE_URL` before destructive or
schema-changing operations.

------------------------------------------------------------------------

# 39. Redis Configuration Consistency

When using multiple backend instances, verify that all instances use the
intended Redis configuration.

Conceptually:

``` text
Instance A ─┐
             ├── same Redis infrastructure
Instance B ─┘
```

If instances use different Redis endpoints, Socket.IO cross-instance
coordination will not behave as intended.

------------------------------------------------------------------------

# 40. Email Configuration Consistency

Password reset and invitation workflows depend on outbound email
configuration.

When email behavior fails, verify:

``` text
EMAIL_USER
EMAIL_PASS
EMAIL
FRONTEND_URL
```

The generated URL is particularly important because an email can be
delivered successfully while still pointing to an incorrect frontend
environment.

------------------------------------------------------------------------

# 41. Configuration Troubleshooting

## API unavailable

Check:

``` text
REACT_APP_API_URL
PORT
backend process
```

## CORS failure

Check:

``` text
FRONTEND_URL
browser origin
API URL
```

## JWT failures

Check:

``` text
JWT_SECRET
JWT_EXPIRES_IN
token age
```

## Database startup failure

Check:

``` text
DATABASE_URL
database availability
Neon connectivity
```

## Socket failures

Check:

``` text
JWT configuration
REDIS_URL if distributed
backend URL/origin
socket connection
```

## Email failures

Check:

``` text
EMAIL_USER
EMAIL_PASS
EMAIL
FRONTEND_URL
```

------------------------------------------------------------------------

# 42. Configuration Change Workflow

When adding a configuration variable:

``` text
1. Add to environment configuration
2. Document it
3. Define required/optional semantics
4. Validate where appropriate
5. Add deployment configuration
6. Add local development configuration
7. Check security classification
8. Update relevant service/config module
9. Test startup
10. Test feature behavior
```

Do not access `process.env` randomly throughout the codebase if the
value belongs in centralized configuration.

------------------------------------------------------------------------

# 43. Configuration Security Classification

A useful classification is:

  Variable              Sensitivity             Consumer
  --------------------- ----------------------- ----------
  `NODE_ENV`            Low                     Backend
  `PORT`                Low                     Backend
  `DATABASE_URL`        Secret                  Backend
  `JWT_SECRET`          Critical secret         Backend
  `JWT_EXPIRES_IN`      Low                     Backend
  `FRONTEND_URL`        Public configuration    Backend
  `BACKEND_URL`         Public/configuration    Backend
  `REDIS_URL`           Secret/infrastructure   Backend
  `EMAIL_USER`          Sensitive               Backend
  `EMAIL_PASS`          Secret                  Backend
  `EMAIL`               Configuration           Backend
  `REACT_APP_API_URL`   Public                  Frontend

------------------------------------------------------------------------

# 44. Production Configuration Checklist

Before deployment:

``` text
[ ] NODE_ENV=production
[ ] Production JWT secret configured
[ ] Default JWT secret not used
[ ] DATABASE_URL points to production DB
[ ] Schema is synchronized
[ ] FRONTEND_URL matches production browser origin
[ ] Frontend REACT_APP_API_URL points to production API
[ ] Redis configured if distributed Socket.IO is required
[ ] Email configuration configured if email workflows are enabled
[ ] No backend secrets are exposed as REACT_APP_* variables
[ ] Environment files are not committed
[ ] Startup configuration validation succeeds
```

------------------------------------------------------------------------

# 45. Environment Separation

Treat environments as separate systems:

``` text
Development
    │
    ├── Development database
    ├── Development JWT secret
    ├── Local frontend
    └── Local backend

Production
    │
    ├── Production database
    ├── Production JWT secret
    ├── Production frontend
    └── Production backend
```

Do not mix development and production infrastructure casually.

------------------------------------------------------------------------

# 46. Configuration Documentation Rule

Whenever a new environment variable is introduced, documentation should
answer:

``` text
What is it?
Why is it required?
Who consumes it?
Is it secret?
What happens if it is missing?
Is it production-only?
What is the safe local-development value?
```

This prevents undocumented infrastructure dependencies.

------------------------------------------------------------------------

# 47. Configuration Architecture Summary

WalletFlow configuration can be summarized as:

``` text
                 Environment
                      │
            ┌─────────┴─────────┐
            ▼                   ▼
        Backend              Frontend
            │                   │
       config/env.js       REACT_APP_*
            │
     ┌──────┼────────┐
     ▼      ▼        ▼
 Database  JWT     Socket
     │      │        │
     ▼      ▼        ▼
 Postgres  Auth    Redis
                      │
                      ▼
                  Real-time

Additional backend integrations:
Email
CORS / frontend URL
Public backend URL
```

The central principle is:

> **Configuration is environment-owned, secrets stay server-side,
> frontend variables are treated as public, and production-sensitive
> settings must be explicitly validated before runtime.**

------------------------------------------------------------------------

# 48. Next Part

**Part 13 --- Local Development & Developer Setup**

The next document will provide the complete developer onboarding
workflow:

-   Repository prerequisites
-   Node/npm setup
-   Backend installation
-   Frontend installation
-   Environment setup
-   Database setup
-   Drizzle schema synchronization
-   Database seeding
-   Running backend/frontend
-   Running tests
-   Local Redis
-   Local email considerations
-   Development URLs
-   Common startup problems
-   Debugging workflow
-   Recommended development sequence
-   First-feature implementation workflow
-   Developer checklist
