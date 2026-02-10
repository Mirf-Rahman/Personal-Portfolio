# Authentication System Explanation

## Overview

We use **Better Auth** as our authentication library for the Personal Portfolio admin panel.

## Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Frontend App   │         │   Auth Service   │         │  Backend API    │
│  (Single App)   │         │  (Better Auth)   │         │  (Next.js API)  │
│  Public + Admin │         │                  │         │                 │
└────────┬────────┘         └────────┬─────────┘         └────────┬────────┘
         │                           │                            │
         │  1. Admin Login at /login │                            │
         ├──────────────────────────>│                            │
         │                           │                            │
         │  2. Better Auth creates   │                            │
         │     session + JWT token   │                            │
         │<──────────────────────────┤                            │
         │                           │                            │
         │  3. Frontend stores JWT   │                            │
         │     in session            │                            │
         │                           │                            │
         │  4. Access /admin routes  │                            │
         │     (middleware checks)   │                            │
         │                           │                            │
         │  5. API Request with JWT  │                            │
         ├───────────────────────────────────────────────────────>│
         │                           │                            │
         │                           │  6. Backend validates JWT  │
         │                           │     (checks signature,     │
         │                           │      issuer, audience)     │
         │                           │                            │
         │  7. API Response          │                            │
         │<───────────────────────────────────────────────────────┤
```

## Components

### 1. **Frontend App** (`frontend/app/`)

- **Single Next.js app** serving both public and admin views
- **Public pages**: `/`, `/skills`, `/projects`, etc.
- **Admin pages**: `/admin/dashboard`, `/admin/skills`, etc.
- **Middleware**: Protects `/admin/*` routes - redirects to `/login` if not authenticated

### 2. **Auth Service** (`auth-service/`)

- **Library**: Better Auth (Node.js/Next.js)
- **Database**: PostgreSQL (`auth-db`)
- **What it does**:
  - Handles admin registration and login
  - Creates and manages sessions
  - Issues JWT tokens with user info (id, email, name, role)
  - Handles password changes and resets
  - Session invalidation via session table management

### 3. **Backend API** (`backend/`)

- **Library**: Next.js API Routes + JWT validation
- **Database**: PostgreSQL (`app-db`) - separate from auth-db
- **What it does**:
  - Validates JWT tokens from frontend
  - Extracts user info from JWT (no password handling)
  - Protects API endpoints based on user roles
  - Never sees passwords - only validates tokens

## Authentication Flow

### Admin Login:

1. Admin visits `/login` page
2. Enters credentials and submits
3. Frontend calls `auth-service/api/auth/sign-in`
4. Better Auth validates and creates JWT with:
   - `sub`: user ID
   - `email`: admin email
   - `name`: admin's name
   - `role`: ADMIN
   - `iss`: "portfolio-auth" (issuer)
   - `aud`: "portfolio-api" (audience)
5. Frontend stores session
6. Admin redirected to `/admin/dashboard`

### Accessing Admin Pages:

1. User navigates to `/admin/*` route
2. Middleware checks if authenticated
3. If not authenticated → redirect to `/login`
4. If authenticated → allow access

### Making API Calls:

1. Frontend makes request to backend API
2. Adds header: `Authorization: Bearer <JWT_TOKEN>`
3. Backend validates JWT and processes request

## Token Lifecycle

### JWT Expiration and Refresh

**Access Token (JWT):**

- **Expiration**: 1 hour (configured in `auth-service/src/lib/auth/auth.ts`)
- **Issuer**: `portfolio-auth`
- **Audience**: `portfolio-api`
- **Storage**: Retrieved via `authClient.token()` on-demand for API requests
- **Usage**: Included in `Authorization: Bearer <token>` header for backend API calls

**Session Management:**

- **Session Duration**: 7 days (configured in Better Auth)
- **Session Storage**: Stored in `auth-db` `session` table
- **Session Validation**: Frontend middleware checks session cookie presence
- **Session Refresh**: Automatic if session is less than 1 day from expiry

**Token Refresh Flow:**

1. Frontend calls `authClient.token()` to get current JWT
2. If token is expired or near expiry, Better Auth automatically refreshes
3. New token is returned for use in API requests
4. No explicit refresh endpoint needed - handled by Better Auth client

**Logout Flow:**

1. Frontend calls `authClient.signOut()` or `POST /api/auth/sign-out`
2. Session is deleted from `session` table in `auth-db`
3. Session cookie is cleared
4. Short-lived access tokens (JWT) remain valid until expiration (up to 1 hour)
5. Since JWTs are stateless, they cannot be immediately revoked
6. Backend validates JWT expiration on each request to prevent use of expired tokens

**Session Revocation Mechanism:**

- **Stateful Sessions**: Better Auth maintains session records in the database
- **Revocation Method**: Deleting session from `session` table prevents new token generation
- **JWT Limitation**: Existing JWTs remain valid until expiration (stateless nature)
- **Trade-off**: Short token lifetime (1h) limits exposure window if session is revoked
- **Best Practice**: Use short-lived tokens + session validation for balance between security and performance

## Key Points

✅ **Single Frontend App** = Public pages + Admin panel in one
✅ **Middleware Protection** = `/admin/*` routes require authentication
✅ **Better Auth** = Handles all password/auth logic
✅ **JWT Tokens** = Secure identity passing between services
✅ **Two Databases**:

- `auth-db`: User accounts, sessions
- `app-db`: Portfolio data

## Environment Variables

- `BETTER_AUTH_SECRET`: Secret for Better Auth operations
- `AUTH_JWT_SECRET`: Shared secret for JWT (auth-service ↔ backend)

## Why This Setup?

1. **Simpler**: Single app easier to deploy than separate apps
2. **Security**: Passwords never leave auth-service
3. **UX**: Admin can view public pages from same app
4. **Standard**: JWT is industry standard
