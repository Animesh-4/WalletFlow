# WalletFlow --- Real-Time Architecture

## Part 11 --- Socket.IO, Collaboration & Presence

This document describes WalletFlow's real-time architecture based on the
supplied frontend and backend source.

The real-time system uses:

``` text
Socket.IO
```

with optional:

``` text
Redis Socket.IO adapter
```

The real-time architecture is separate from the REST API, but it uses
the same authenticated user identity model.

------------------------------------------------------------------------

# 1. Real-Time Architecture Overview

The system can be represented as:

``` text
React Application
      │
      ▼
SocketContext
      │
      ▼
services/socket.js
      │
      ▼
Socket.IO Client
      │
      │ WebSocket / Socket.IO transport
      ▼
Socket.IO Server
      │
      ▼
socketHandler
      │
      ├── authentication
      ├── user events
      └── budget events
```

The backend socket implementation is organized under:

``` text
src/socket/
├── socketHandler.js
├── socketManager.js
├── budgetEvents.js
└── userEvents.js
```

The frontend contains:

``` text
context/SocketContext.js
hooks/useSocket.js
services/socket.js
```

------------------------------------------------------------------------

# 2. Why Real-Time Exists Separately

REST and Socket.IO solve different problems.

REST provides durable request/response operations:

``` text
GET
POST
PUT
DELETE
```

Socket.IO provides live event delivery:

``` text
budgetUpdated
transactionUpdated
liveUsers
```

The architectural relationship is:

``` text
REST
 │
 └── durable state changes / retrieval

Socket.IO
 │
 └── real-time notification of relevant changes
```

A socket event should therefore not automatically be treated as the
durable source of truth.

------------------------------------------------------------------------

# 3. Backend Socket Initialization

The Socket.IO server is attached to the HTTP server.

Conceptually:

``` text
Node HTTP Server
       │
       ├── Express
       │
       └── Socket.IO
```

This means both:

``` text
REST API
```

and:

``` text
Socket.IO
```

run within the same backend process.

------------------------------------------------------------------------

# 4. Socket Configuration

Socket configuration is separated into:

``` text
src/config/socket.js
```

The runtime event implementation is under:

``` text
src/socket/
```

This separation keeps socket infrastructure configuration distinct from
event/business behavior.

------------------------------------------------------------------------

# 5. Socket Manager

The socket manager is:

``` text
src/socket/socketManager.js
```

It provides access to the initialized Socket.IO instance.

The lifecycle is:

``` text
Create Socket.IO
       │
       ▼
socketManager.init(io)
       │
       ▼
Application runtime
       │
       ▼
socketManager.getIO()
```

The manager prevents consumers from retrieving the Socket.IO instance
before initialization.

------------------------------------------------------------------------

# 6. Socket Connection Lifecycle

A connection follows this conceptual sequence:

``` text
Client
  │
  ▼
Socket.IO connection attempt
  │
  ▼
Backend socket handler
  │
  ▼
JWT authentication
  │
  ├── failure → connection rejected
  │
  └── success
        │
        ▼
     socket.user
        │
        ▼
  user-specific room
        │
        ▼
  event handlers registered
```

The socket handler performs authentication during the connection
lifecycle.

------------------------------------------------------------------------

# 7. Socket JWT Authentication

The Socket.IO server accepts a JWT through the handshake.

The implementation supports:

``` text
socket.handshake.auth.token
```

or:

``` text
socket.handshake.query.token
```

The server verifies the token using the application's JWT configuration.

After verification:

``` text
socket.user = decoded token
```

The supplied socket handler explicitly implements this flow.
fileciteturn4file9L1093-L1147

------------------------------------------------------------------------

# 8. Socket Identity

The socket identity is derived from the same JWT identity model used by
REST authentication.

Conceptually:

``` text
JWT
 │
 ▼
verify
 │
 ▼
decoded identity
 │
 ▼
socket.user
```

The socket therefore represents an authenticated user session, not an
anonymous transport connection.

------------------------------------------------------------------------

# 9. User-Specific Socket Room

After successful authentication, the socket joins a user-specific room.

Conceptually:

``` text
socket.user.id
      │
      ▼
user:<id>
```

This provides a mechanism for delivering user-scoped real-time events.

The room is runtime Socket.IO state.

It is not a database membership record.

------------------------------------------------------------------------

# 10. Budget Rooms

Budget collaboration uses budget-specific rooms.

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

A client requests budget room membership through the budget socket
event.

The room represents:

``` text
Who is currently participating in this real-time channel?
```

It does not replace:

``` text
Who is persistently authorized to access this budget?
```

------------------------------------------------------------------------

# 11. Persistent Membership vs Socket Room

These concepts must remain separate:

``` text
BudgetUser
    │
    └── persistent authorization

Socket.IO room
    │
    └── runtime communication grouping
```

A user can have a database membership without an active socket
connection.

A socket room should not be treated as proof of database membership.

------------------------------------------------------------------------

# 12. Frontend Socket Service

The low-level frontend socket implementation is:

``` text
src/services/socket.js
```

It exposes operations/listeners including:

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

------------------------------------------------------------------------

# 13. Frontend SocketContext

The frontend context is:

``` text
src/context/SocketContext.js
```

Its purpose is to provide application-level access to the real-time
connection without requiring each component to construct a separate
Socket.IO client.

The conceptual hierarchy is:

``` text
Component
   │
   ▼
useSocket()
   │
   ▼
SocketContext
   │
   ▼
services/socket.js
```

------------------------------------------------------------------------

# 14. `useSocket`

The frontend hook:

``` text
src/hooks/useSocket.js
```

is the component-facing abstraction for SocketContext.

Components that need real-time behavior should use the established
context/hook boundary rather than creating independent socket
connections.

------------------------------------------------------------------------

# 15. Socket Connection Ownership

The application should maintain one application-level real-time
connection model rather than allowing every feature component to create
its own independent Socket.IO client.

The existing architecture centralizes socket behavior through:

``` text
SocketContext
```

and:

``` text
services/socket.js
```

This reduces duplicate connections and keeps event handling centralized.

------------------------------------------------------------------------

# 16. Joining a Budget

The frontend socket service exposes:

``` text
joinBudgetRoom(budgetId)
```

which emits:

``` text
joinBudget
```

with the budget identifier.

Conceptually:

``` text
User opens budget
       │
       ▼
joinBudgetRoom(budgetId)
       │
       ▼
emit("joinBudget", budgetId)
       │
       ▼
Backend budget event handler
       │
       ▼
Budget room
```

------------------------------------------------------------------------

# 17. Leaving a Budget

The corresponding operation is:

``` text
leaveBudgetRoom(budgetId)
```

which emits:

``` text
leaveBudget
```

Conceptually:

``` text
User leaves budget
       │
       ▼
leaveBudgetRoom(budgetId)
       │
       ▼
emit("leaveBudget", budgetId)
       │
       ▼
Backend removes socket from room
```

------------------------------------------------------------------------

# 18. Budget Update Event

The frontend listens for:

``` text
budgetUpdated
```

through:

``` text
onBudgetUpdate()
```

The event represents a real-time notification that budget-related state
has changed.

The socket event should be treated as a notification/update channel
rather than a replacement for durable budget persistence.

------------------------------------------------------------------------

# 19. Transaction Update Event

The frontend listens for:

``` text
transactionUpdated
```

through:

``` text
onTransactionUpdate()
```

This allows transaction-related UI to react to changes occurring
elsewhere in the collaborative application.

Conceptually:

``` text
User A changes transaction
       │
       ▼
Backend persists change
       │
       ▼
Socket event
       │
       ▼
Budget collaborators
       │
       ▼
transactionUpdated
       │
       ▼
Frontend UI
```

The exact emission trigger should be derived from the complete
transaction/socket implementation before documenting it as a guaranteed
event for every transaction mutation.

------------------------------------------------------------------------

# 20. Live User Event

The frontend listens for:

``` text
liveUsers
```

through:

``` text
onLiveUsersUpdate()
```

This represents runtime presence information.

Conceptually:

``` text
Socket connections
       │
       ▼
Backend presence state
       │
       ▼
liveUsers
       │
       ▼
Frontend collaboration UI
```

The relevant UI component is:

``` text
components/Collaboration/LiveUser.js
```

------------------------------------------------------------------------

# 21. Live Presence Is Runtime State

Live-user presence is not persisted as durable financial data.

The backend currently maintains live-user state in process memory.

Conceptually:

``` text
Backend process
    │
    └── liveUsers Map
```

When a process restarts, its in-memory presence state disappears.

------------------------------------------------------------------------

# 22. Presence and Multi-Instance Deployment

With multiple backend instances:

``` text
Instance A
 └── liveUsers A

Instance B
 └── liveUsers B
```

the current process-local presence implementation does not automatically
create a globally consistent presence state.

This is an important production scaling limitation.

The source itself identifies shared state such as Redis as a
consideration for production presence behavior.
fileciteturn4file9L1181-L1189

------------------------------------------------------------------------

# 23. Redis Socket.IO Adapter

The backend can optionally use Redis through:

``` text
REDIS_URL
```

The Socket.IO Redis adapter allows Socket.IO instances to coordinate
events through Redis.

Conceptually:

``` text
Socket.IO Instance A
        │
        ▼
      Redis
        ▲
        │
Socket.IO Instance B
```

This is useful for distributed Socket.IO communication.

------------------------------------------------------------------------

# 24. Redis Adapter vs Presence

These are separate concerns.

### Redis Socket.IO adapter

Helps coordinate Socket.IO event delivery between backend instances.

### Presence state

The current live-user implementation is process-local.

Therefore:

``` text
Redis adapter enabled
```

does not automatically mean:

``` text
globally consistent live-user presence
```

Additional shared presence design would be required.

------------------------------------------------------------------------

# 25. Socket Event Ownership

The backend separates socket behavior by domain:

``` text
budgetEvents.js
userEvents.js
```

This mirrors the application domains:

``` text
Budget collaboration
User presence
```

The central `socketHandler.js` establishes the connection and delegates
domain-specific event registration.

------------------------------------------------------------------------

# 26. Socket Handler Responsibilities

The socket handler is responsible for:

``` text
Connection
Authentication
User identity
User room
Event registration
Disconnect lifecycle
```

It should not become the primary location for all domain business rules.

Complex business operations should continue to use the domain service
layer where appropriate.

------------------------------------------------------------------------

# 27. Real-Time vs Business Logic

A useful boundary is:

``` text
Socket event
    │
    ▼
Determine event/context
    │
    ▼
Domain service
    │
    ▼
Durable operation
    │
    ▼
Emit real-time event
```

The socket layer should coordinate communication rather than duplicate
business rules already implemented by REST services.

------------------------------------------------------------------------

# 28. Real-Time Data Flow

A collaborative update can be represented as:

``` text
User action
    │
    ▼
Frontend REST API
    │
    ▼
Backend controller
    │
    ▼
Domain service
    │
    ▼
Database mutation
    │
    ▼
Socket event emission
    │
    ▼
Budget room
    │
    ▼
Other connected clients
    │
    ▼
React state/UI
```

The exact event-emission location for each domain operation should be
verified from the complete socket/service implementation.

------------------------------------------------------------------------

# 29. REST Remains the Durable Path

Real-time clients should not rely exclusively on socket events for
initial state.

A robust conceptual lifecycle is:

``` text
Open page
   │
   ├── REST → fetch current state
   │
   └── Socket → subscribe to future updates
```

This prevents a client that connects after an event occurred from
missing the durable state.

The current frontend architecture already separates REST API services
from Socket.IO services.

------------------------------------------------------------------------

# 30. Reconnection Considerations

Socket connections can disconnect because of:

``` text
Network interruption
Server restart
Browser lifecycle
Authentication/session changes
Infrastructure failure
```

The supplied source establishes the connection/event architecture but
does not provide enough evidence here to claim a complete custom
reconnection/resynchronization protocol.

Therefore, if implementing reconnection-sensitive behavior, verify:

``` text
SocketContext
services/socket.js
backend socketHandler
```

together.

------------------------------------------------------------------------

# 31. Disconnect Lifecycle

The backend socket handler registers a disconnect callback.

The disconnect lifecycle is important for:

``` text
Presence
Room membership
Resource cleanup
```

The current user-presence implementation removes the disconnected
socket/user state from the in-memory presence structure.

------------------------------------------------------------------------

# 32. Multiple Browser Tabs

A user may have more than one active browser connection.

The current presence implementation should therefore be interpreted
carefully:

``` text
User
 ├── Socket A
 └── Socket B
```

A production-grade presence interpretation may need to distinguish:

``` text
user presence
```

from:

``` text
socket connection count
```

The supplied source does not establish a complete multi-tab presence
policy.

------------------------------------------------------------------------

# 33. Socket Authentication Failure Modes

Possible failure points include:

``` text
No token
    │
    ▼
Handshake rejected

Invalid token
    │
    ▼
JWT verification fails

Valid token
    │
    ▼
socket.user established
```

For debugging, inspect the actual handshake token source and JWT
configuration before investigating budget-room behavior.

------------------------------------------------------------------------

# 34. Budget Room Failure Modes

If budget real-time updates are not received, investigate:

``` text
1. Is Socket.IO connected?
2. Is the socket authenticated?
3. Is the client emitting joinBudget?
4. Is the correct budget ID supplied?
5. Did the backend add the socket to the room?
6. Was the event emitted?
7. Was the event emitted to the intended room?
8. Is the frontend listening for the correct event name?
9. Is the React state updated after the event?
```

This sequence separates transport problems from UI problems.

------------------------------------------------------------------------

# 35. Live User Debugging

For presence problems:

``` text
Socket connected?
       │
       ▼
socket.user populated?
       │
       ▼
Connection tracked?
       │
       ▼
liveUsers state updated?
       │
       ▼
liveUsers emitted?
       │
       ▼
Frontend listener registered?
       │
       ▼
LiveUser UI updated?
```

If multiple backend instances are involved, also inspect the
process-local state limitation.

------------------------------------------------------------------------

# 36. Socket Event Naming

The current frontend/backend contract uses event names such as:

``` text
joinBudget
leaveBudget
budgetUpdated
transactionUpdated
liveUsers
```

These names are part of the real-time API contract.

Changing an event name requires coordinated updates to:

``` text
Backend emitter
Backend listener
Frontend socket service
Frontend context/hook
Frontend components
Tests
Documentation
```

------------------------------------------------------------------------

# 37. Socket Payload Stability

Event names are not the only contract.

The event payload is also part of the API.

A change such as:

``` text
budgetUpdated(payload)
```

to:

``` text
budgetUpdated({ budget, actor, timestamp })
```

can be a breaking change if clients expect the previous payload shape.

When changing a payload:

``` text
Document the new shape
Update all consumers
Add compatibility handling if required
```

The supplied source does not provide a complete formal event-payload
schema, so payload contracts should be documented from the actual event
emitters/listeners before expanding this specification.

------------------------------------------------------------------------

# 38. Real-Time Authorization Boundary

A valid socket authentication token establishes:

``` text
Who is connected?
```

It does not automatically establish:

``` text
Which budget may this socket join?
```

Budget access remains a domain authorization concern.

The persistent membership model:

``` text
BudgetUser
```

should remain conceptually separate from the socket room.

------------------------------------------------------------------------

# 39. Security Principle for Socket Events

Do not treat:

``` text
socket.connected
```

as authorization.

Do not treat:

``` text
socket.user
```

alone as budget authorization.

The security model should remain:

``` text
Authenticate user
      │
      ▼
Verify resource access
      │
      ▼
Allow real-time operation
```

------------------------------------------------------------------------

# 40. Frontend Real-Time Architecture

The frontend can be summarized as:

``` text
Component
    │
    ▼
useSocket()
    │
    ▼
SocketContext
    │
    ▼
socket.js
    │
    ▼
Socket.IO Client
```

The context/hook layer prevents UI components from depending directly on
low-level socket construction.

------------------------------------------------------------------------

# 41. Backend Real-Time Architecture

The backend can be summarized as:

``` text
HTTP Server
    │
    ▼
Socket.IO
    │
    ▼
socketHandler
    │
    ├── JWT authentication
    ├── user room
    ├── budgetEvents
    └── userEvents
```

The socket manager provides access to the initialized Socket.IO
instance.

------------------------------------------------------------------------

# 42. Real-Time Production Considerations

The current architecture has foundations for production real-time
operation:

``` text
Authenticated sockets
Socket.IO rooms
Domain-specific event modules
Socket manager
Optional Redis adapter
```

However, the supplied source does not establish complete production
guarantees for:

``` text
Distributed presence
Event durability
Event replay
Message ordering guarantees
Exactly-once delivery
Backpressure strategy
Connection-level rate limiting
Large-scale load testing
```

These should not be assumed.

------------------------------------------------------------------------

# 43. Event Delivery Semantics

Socket.IO events should be understood as runtime messages.

Unless the application explicitly persists/replays an event:

``` text
Disconnected client
```

may not receive an event emitted while it was offline.

The durable source should therefore remain the database/API for state
recovery.

------------------------------------------------------------------------

# 44. State Resynchronization Principle

When a client reconnects or opens a page:

``` text
REST → establish current state
Socket → receive future changes
```

This is the safest conceptual division between:

``` text
state retrieval
```

and:

``` text
live event delivery
```

Any explicit resynchronization implementation should follow the actual
current `SocketContext` and service behavior.

------------------------------------------------------------------------

# 45. Real-Time Change Workflow

When modifying real-time functionality:

``` text
1. Identify event name
2. Find frontend listener/emitter
3. Find backend listener/emitter
4. Check socket authentication
5. Check room membership
6. Check domain authorization
7. Check database mutation path
8. Check payload shape
9. Check disconnect/reconnect behavior
10. Update tests/documentation
```

------------------------------------------------------------------------

# 46. Real-Time Debugging Workflow

Use this order:

``` text
Transport
   ↓
Authentication
   ↓
Room membership
   ↓
Event emission
   ↓
Event delivery
   ↓
Frontend listener
   ↓
State update
   ↓
UI
```

Do not start by changing React rendering logic if the event never
reaches the browser.

------------------------------------------------------------------------

# 47. Real-Time Architecture Summary

WalletFlow's real-time architecture is:

``` text
                       Socket.IO
                           │
                  ┌────────┴────────┐
                  ▼                 ▼
             Authentication     Event handlers
                  │                 │
                  ▼          ┌──────┴──────┐
             socket.user     ▼             ▼
                         Budget events   User events
                              │             │
                              ▼             ▼
                         Budget rooms   Live presence
                              │             │
                              └──────┬──────┘
                                     ▼
                               Frontend Socket
                                     │
                               SocketContext
                                     │
                                  useSocket
                                     │
                                     ▼
                                  React UI

Optional:
Socket.IO instances
       │
       ▼
     Redis
```

The core principle is:

> **REST and PostgreSQL establish durable application state; Socket.IO
> distributes live changes and presence around that durable state.**

------------------------------------------------------------------------

# 48. Next Part

**Part 12 --- Configuration & Environment Variables**

The next document will provide the production configuration reference:

-   Backend environment variables
-   Frontend environment variables
-   JWT configuration
-   Database configuration
-   Frontend/backend URLs
-   Redis configuration
-   Email configuration
-   Development vs production behavior
-   Configuration validation
-   Startup requirements
-   Secret handling
-   Local development setup
-   Environment file conventions
-   Configuration troubleshooting
-   Production configuration checklist
