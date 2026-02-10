# Personal Portfolio - Complete Project Context

> **Comprehensive technical documentation for the Personal Portfolio project by Mir Faiyazur Rahman**

This document provides complete context about the project's architecture, design decisions, implementation details, and rationale.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Goals & Objectives](#goals--objectives)
3. [Architecture](#architecture)
4. [Technology Stack](#technology-stack)
5. [Services Breakdown](#services-breakdown)
6. [Database Schema](#database-schema)
7. [Authentication & Security](#authentication--security)
8. [File Structure](#file-structure)
9. [Development Workflow](#development-workflow)
10. [Deployment Strategy](#deployment-strategy)
11. [Key Design Decisions](#key-design-decisions)
12. [Known Issues & Future Work](#known-issues--future-work)

---

## Project Overview

### What Is This Project?

A **full-stack personal portfolio website** with an integrated content management system (CMS). The project serves two primary functions:

1. **Public Portfolio** - Showcases Mir Faiyazur Rahman's:
   - Projects with descriptions, technologies, links
   - Skills and expertise
   - Work experience timeline
   - Education background
   - Hobbies and interests
   - Contact information

2. **Admin Panel** - Secure CMS for managing portfolio content:
   - CRUD operations for all content types
   - File/image uploads
   - User authentication
   - Session management

### Origin

This project was bootstrapped from a **passion-jerseys e-commerce template** but has been heavily modified and simplified for portfolio use. Many e-commerce features (shopping cart, orders, multi-user roles, complex inventory) were removed.

### Current State

- **Status**: Fully operational in development
- **Deployment Target**: DigitalOcean App Platform
- **Admin**: Single admin user (credentials configured via environment variables or auto-generated)
- **Database**: PostgreSQL for both app and auth data
- **Storage**: DigitalOcean Spaces for file uploads

---

## Goals & Objectives

### Primary Goals

1. **Showcase Work** - Professional online presence to display projects and skills
2. **Easy Management** - Admin panel to update content without touching code
3. **Modern Stack** - Use cutting-edge technologies (Next.js 15, React 18, Better Auth)
4. **Deployment Ready** - Containerized and CI/CD ready for DigitalOcean
5. **Secure** - JWT authentication, session management, input validation

### Non-Goals

- Multi-user support (only need single admin)
- E-commerce features (no shopping, payment processing)
- Public user registration (admin-only access)
- Social features (comments, likes, follows)
- Complex analytics (basic monitoring only)

### Success Criteria

- ✅ Portfolio loads fast (<2s)
- ✅ Admin can log in and manage content
- ✅ Responsive on mobile/tablet/desktop
- ✅ SEO optimized
- ✅ Automated deployment via GitHub Actions
- ✅ Secure (no vulnerabilities, proper auth)

---

## Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Internet / User                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │   Frontend (Next.js 15)    │
        │   Port: 3000               │
        │   - Public Portfolio       │
        │   - Admin Panel            │
        └──────┬─────────────┬───────┘
               │             │
       ┌───────▼──────┐  ┌──▼─────────────┐
       │   Backend    │  │  Auth Service  │
       │   Port: 8080 │  │  Port: 3001    │
       │   - API      │  │  - Better Auth │
       │   - CRUD     │  │  - Sessions    │
       └──────┬───────┘  └───┬────────────┘
              │              │
       ┌──────▼──────┐  ┌───▼────────┐
       │   App DB    │  │  Auth DB   │
       │   Port: 5433│  │  Port: 5434│
       │   PostgreSQL│  │  PostgreSQL│
       └─────────────┘  └────────────┘
              │
       ┌──────▼──────────────────────┐
       │   DigitalOcean Spaces       │
       │   (S3-compatible Storage)   │
       │   CDN-enabled               │
       └─────────────────────────────┘
```

### Service Communication

1. **Frontend → Backend**: HTTP REST API calls
2. **Frontend → Auth Service**: Authentication requests via Better Auth client
3. **Backend → App DB**: Drizzle ORM queries
4. **Auth Service → Auth DB**: Better Auth internal queries
5. **Backend → DigitalOcean Spaces**: S3-compatible API for file storage via AWS SDK

### Why Microservices?

**Separation of Concerns:**
- **Frontend**: Only handles UI/UX, no business logic
- **Backend**: Business logic and data management
- **Auth Service**: Authentication isolated for security

**Scalability:**
- Each service can scale independently
- Auth service can handle multiple frontends in future

**Security:**
- Auth service isolated reduces attack surface
- Secrets compartmentalized per service

---

## Technology Stack

### Frontend: Next.js 15 (App Router)

**Why Next.js 15?**
- Server-side rendering for SEO
- App Router for better file-based routing
- Built-in image optimization
- API routes for serverless functions
- React Server Components for performance

**UI Framework: React 18**
- Concurrent rendering
- Automatic batching
- Server Components support

**Styling: Tailwind CSS**
- Utility-first CSS
- Fast development
- Small bundle size
- Customizable design system

**Component Library: Radix UI**
- Accessible by default (WAI-ARIA compliant)
- Unstyled (full control over appearance)
- Composable primitives
- TypeScript support

**Icons: Lucide React**
- 1000+ icons
- Tree-shakeable
- Consistent design language
- SVG-based (scalable, small)

**Animations: Framer Motion**
- Declarative animations
- Gestures and interactions
- Layout animations
- Production-ready

**State Management: TanStack Query**
- Server state management
- Automatic caching
- Background refetching
- Optimistic updates

### Backend: Next.js 15 API Routes

**Why Next.js for Backend?**
- Unified TypeScript codebase
- Easy deployment (same as frontend)
- API routes co-located with frontend

**Database: PostgreSQL 14**
- Robust, battle-tested
- ACID compliance
- JSON support
- Full-text search
- Open source

**ORM: Drizzle**
- Type-safe SQL
- Lightweight (no runtime overhead)
- SQL-like syntax (not magic)
- Great TypeScript inference
- Migration support

### Auth Service: Better Auth

**Why Better Auth?**
- Modern, TypeScript-first
- Built for Next.js
- JWT + session support
- Extensible plugin system
- Google OAuth ready
- Open source

**Features Used:**
- Email/password authentication
- JWT tokens
- Session management
- User roles (ADMIN)
- CORS handling

### File Storage: DigitalOcean Spaces

**Why DigitalOcean Spaces?**
- S3-compatible API (works with AWS SDK)
- Managed service (no container to maintain)
- Built-in CDN for fast file delivery
- Cost-effective for small to medium projects
- Direct integration with DigitalOcean ecosystem
- No local storage needed

### DevOps

**Docker & Docker Compose:**
- Consistent development environment
- Easy local setup
- Production parity
- Service orchestration

**CI/CD: GitHub Actions:**
- Automated testing
- Docker image builds
- DigitalOcean deployment
- Triggered on push to main

**Deployment: DigitalOcean App Platform:**
- Managed Kubernetes
- Auto-scaling
- HTTPS/SSL included
- Database backups
- Monitoring dashboard

---

## Services Breakdown

### 1. Frontend Service

**Path:** `frontend/app/`

**Purpose:** User-facing application with public portfolio and admin panel

**Port:** 3000

**Key Files:**
```
frontend/app/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── page.tsx             # Public homepage
│   │   ├── login/page.tsx       # Admin login
│   │   ├── admin/
│   │   │   ├── layout.tsx       # Admin sidebar
│   │   │   ├── dashboard/       # Admin dashboard
│   │   │   ├── projects/        # Manage projects
│   │   │   ├── skills/          # Manage skills
│   │   │   └── ...              # Other admin pages
│   │   └── layout.tsx           # Root layout
│   ├── components/              # Reusable components
│   │   └── ui/                  # Radix UI components
│   ├── lib/
│   │   ├── api.ts               # Backend API client
│   │   ├── auth-client.ts       # Better Auth client
│   │   └── utils.ts             # Helper functions
│   └── middleware.ts            # Route protection
├── public/                      # Static assets
├── package.json
├── next.config.js
├── tailwind.config.js
└── Dockerfile
```

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8080           # Backend URL
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001  # Auth service URL
```

**Build Process:**
1. Install dependencies (`npm ci`)
2. Build Next.js app (`next build`)
3. Create standalone output (Node.js server)
4. Run with `next start`

**Key Features:**
- **Public Pages**: Homepage with portfolio content
- **Admin Pages**: CRUD interfaces for content management
- **Authentication**: Login page, middleware protection
- **Responsive Design**: Mobile-first with Tailwind
- **Client-Side Routing**: Next.js Link components for fast navigation

---

### 2. Backend Service

**Path:** `backend/`

**Purpose:** REST API for portfolio data and business logic

**Port:** 8080

**Key Files:**
```
backend/
├── src/
│   ├── app/
│   │   └── api/
│   │       ├── health/route.ts           # Health endpoint
│   │       ├── projects/route.ts         # Projects CRUD
│   │       ├── skills/route.ts           # Skills CRUD
│   │       ├── experience/route.ts       # Experience CRUD
│   │       ├── education/route.ts        # Education CRUD
│   │       ├── hobbies/route.ts          # Hobbies CRUD
│   │       ├── testimonials/route.ts     # Testimonials CRUD
│   │       └── files/route.ts            # File uploads to DigitalOcean Spaces
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts                  # Drizzle client
│   │   │   └── schema.ts                 # Database schema
│   │   └── auth.ts                       # JWT verification
│   └── types/index.ts                    # TypeScript types
├── scripts/
│   └── setup-db.sh                       # DB initialization
├── drizzle.config.ts                     # Drizzle configuration
├── package.json
└── Dockerfile
```

**Database Schema (app-db):**
```typescript
// Projects
projects {
  id: uuid
  title: string
  description: text
  technologies: jsonb      // Array of tech used
  imageUrl: string         // DigitalOcean Spaces CDN URL
  projectUrl: string       // Live URL
  githubUrl: string        // Repo URL
  featured: boolean
  createdAt: timestamp
  updatedAt: timestamp
}

// Similar schema for:
// - skills
// - experience
// - education
// - hobbies
// - testimonials
// - messages (contact form)
```

**API Endpoints:**
```
GET    /api/projects       - List all projects
POST   /api/projects       - Create project (admin)
GET    /api/projects/:id   - Get single project
PUT    /api/projects/:id   - Update project (admin)
DELETE /api/projects/:id   - Delete project (admin)

# Similar for skills, experience, education, hobbies, testimonials

POST   /api/files          - Upload file to DigitalOcean Spaces (admin)
DELETE /api/files/:filename - Delete file from DigitalOcean Spaces (admin)
```

**Authorization:**
- GET endpoints: Public
- POST/PUT/DELETE: Requires valid JWT from auth-service
- JWT verified via `Authorization: Bearer <token>` header

**Environment Variables:**
```env
DATABASE_URL=postgres://...        # App database connection
AUTH_JWT_SECRET=...                # JWT verification secret
CORS_ORIGINS=http://localhost:3000 # Allowed origins
```

---

### 3. Auth Service

**Path:** `auth-service/`

**Purpose:** Authentication, user management, session handling

**Port:** 3001

**Key Files:**
```
auth-service/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── [...all]/route.ts    # Better Auth catch-all
│   │   │   │   └── admin/               # Admin user management
│   │   │   └── health/route.ts
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── auth/
│   │   │   └── auth.ts                  # Better Auth config
│   │   ├── db/
│   │   │   ├── index.ts                 # Drizzle client
│   │   │   └── schema.ts                # User/session schema
│   │   └── security/
│   │       ├── account-lockout.ts       # Login attempt tracking
│   │       ├── audit-log.ts             # Audit logging
│   │       └── session-management.ts    # Session helpers
│   └── types/index.ts
├── scripts/
│   ├── setup-db.sh                      # DB + schema setup
│   ├── seed-users.sh                    # Create admin user
│   └── start.sh                         # Startup orchestration
├── drizzle.config.ts
├── package.json
└── Dockerfile
```

**Database Schema (auth-db):**
```typescript
// User table
user {
  id: uuid
  email: string (unique)
  name: string
  password: string (hashed)
  role: enum (ADMIN, CUSTOMER)
  emailVerified: boolean
  image: string | null
  createdAt: timestamp
  updatedAt: timestamp
}

// Session table
session {
  id: string
  userId: uuid -> user.id
  token: string
  expiresAt: timestamp
  ipAddress: string
  userAgent: string
  createdAt: timestamp
}

// Login attempt table (for security)
loginAttempt {
  id: uuid
  email: string
  success: boolean
  ipAddress: string
  attemptedAt: timestamp
}
```

**Authentication Flow:**

1. **Login:**
   ```
   POST /api/auth/sign-in/email
   Body: { email, password }
   Response: { user, session, token }
   Sets cookie: better-auth.session_token
   ```

2. **Session Validation:**
   ```
   GET /api/auth/get-session
   Cookie: better-auth.session_token
   Response: { user, session } or null
   ```

3. **Logout:**
   ```
   POST /api/auth/sign-out
   Cookie: better-auth.session_token
   Response: { success: true }
   Clears cookie
   ```

**Auto-Created Admin User:**
- On first startup, `seed-users.sh` creates admin user
- Email: Set via `ADMIN_EMAIL` environment variable (defaults to `admin@portfolio.com`)
- Password: Auto-generated random password on first run (or set via `ADMIN_PASSWORD` environment variable)
- Role: `ADMIN`

**Environment Variables:**
```env
DATABASE_URL=postgres://...              # Auth database
BETTER_AUTH_SECRET=...                   # Session encryption
AUTH_JWT_SECRET=...                      # JWT signing
BETTER_AUTH_URL=http://localhost:3001    # Service URL
CORS_ORIGINS=http://localhost:3000       # Frontend URL
```

---

### 4. Database Services

**Two PostgreSQL Databases:**

#### App Database (port 5433)
- Stores portfolio content
- Projects, skills, experience, education, etc.
- Used by backend service

#### Auth Database (port 5434)
- Stores user accounts and sessions
- Used by auth-service
- Isolated for security

**Why Two Databases?**
- **Security isolation**: Auth data separate from app data
- **Scaling**: Can scale databases independently
- **Backup strategy**: Different backup policies
- **Compliance**: Easier to meet data regulations

---

### 5. DigitalOcean Spaces (File Storage)

**Purpose:** S3-compatible object storage for uploaded files

**Bucket:** `portfolio-files` (configurable via environment variables)

**Use Cases:**
- Project images
- Resume PDFs
- Profile pictures
- Any uploaded media

**Configuration:**
- **Endpoint:** `{region}.digitaloceanspaces.com` (e.g., `nyc3.digitaloceanspaces.com`)
- **Access Key:** Set via `SPACES_ACCESS_KEY` environment variable
- **Secret Key:** Set via `SPACES_SECRET_KEY` environment variable
- **Region:** Set via `SPACES_REGION` environment variable
- **CDN URL:** `https://{bucket}.{region}.cdn.digitaloceanspaces.com`

**File URLs:**
```
https://portfolio-files.nyc3.cdn.digitaloceanspaces.com/dev/project-123.jpg
```

Files are uploaded directly to Spaces via AWS SDK and served through CDN URLs. No proxy needed.

---

## Authentication & Security

### JWT Token Flow

1. User logs in at `/login`
2. Frontend sends credentials to auth-service
3. Auth-service validates, creates session, generates JWT
4. JWT stored in httpOnly cookie (`better-auth.session_token`)
5. Frontend includes cookie in all requests
6. Backend/auth-service verify JWT on protected routes

### Session Management

- **Session Duration:** Configurable (default: 30 days)
- **Refresh:** Automatic if <7 days until expiry
- **Revocation:** Delete session from `session` table
- **Multiple Devices:** Each device gets unique session

### Middleware Protection

**Frontend Middleware** (`src/middleware.ts`):
```typescript
// Protects /admin/* routes
if (pathname.startsWith('/admin')) {
  const sessionCookie = request.cookies.get('better-auth.session_token');
  if (!sessionCookie) {
    return NextResponse.redirect('/login');
  }
}
```

**Backend Authorization:**
```typescript
// Verify JWT on POST/PUT/DELETE
const token = request.headers.get('Authorization')?.replace('Bearer ', '');
const decoded = await verifyJWT(token, AUTH_JWT_SECRET);
if (!decoded || decoded.role !== 'ADMIN') {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Security Features

1. **Password Hashing:** bcrypt (10 rounds)
2. **JWT Signing:** HS256 algorithm
3. **CORS:** Restricted to frontend origin
4. **HTTPOnly Cookies:** Prevents XSS attacks
5. **Environment Secrets:** Never committed to git
6. **Docker Network:** Services isolated
7. **Input Validation:** All API inputs sanitized

### Known Security Considerations

- ⚠️ Middleware only checks cookie presence (not validating JWT server-side)
- ⚠️ Default admin password must be changed
- ⚠️ No rate limiting on login attempts currently
- ⚠️ No CSRF protection (rely on SameSite cookies)

---

## File Structure

### Root Directory

```
Personal-Portfolio/
├── .github/
│   └── workflows/              # CI/CD pipelines
│       ├── build-push.yml      # Build and push Docker images
│       ├── deploy-digitalocean-main.yml  # Auto-deploy to DO
│       ├── deploy-preview-digitalocean.yml  # PR previews
│       ├── docker-build.yml    # Test Docker builds
│       └── pr-checks.yml       # PR validation
├── auth-service/               # Authentication microservice
├── backend/                    # Backend API service
├── frontend/
│   └── app/                    # Main frontend application
├── docs/                       # Documentation
│   ├── AUTH_EXPLANATION.md     # Auth system docs
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── README.md               # Docs index
├── data/                       # Docker volumes (gitignored)
│   ├── app_db/                 # App database files
│   ├── auth_db/                # Auth database files  
├── pgadmin/                    # pgAdmin config (optional)
├── .env                        # Environment variables
├── .env.example                # Template for .env
├── .gitignore
├── docker-compose.yml          # Service orchestration
├── ADMIN_SETUP.md              # Admin user guide
├── README.md                   # Main readme
└── SETUP_GUIDE.md              # Setup instructions
```

### Ignored Directories

```gitignore
# Dependencies
**/node_modules/

# Build outputs
**/.next/
**/dist/
**/build/

# Environment
.env
.env.local

# Docker volumes
data/

# IDE
.vscode/
.idea/

# Logs
**/*.log
```

---

## Development Workflow

### Local Development Setup

1. **Clone Repository:**
   ```bash
   git clone https://github.com/Mirf-Rahman/Personal-Portfolio.git
   cd Personal-Portfolio
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Edit .env if needed (defaults work for dev)
   ```

3. **Start Services:**
   ```bash
   docker compose up -d --build
   ```

4. **Access Applications:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080
   - Auth Service: http://localhost:3001

5. **Login:**
   - URL: http://localhost:3000/login
   - Email: Check auth-service logs for auto-generated admin email (or use `ADMIN_EMAIL` env var)
   - Password: Check auth-service logs for auto-generated password (displayed once during initial setup, or use `ADMIN_PASSWORD` env var)

### Development Without Docker

**Terminal 1 - Frontend:**
```bash
cd frontend/app
npm install
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 3 - Auth Service:**
```bash
cd auth-service
npm install
npm run dev
```

Still need Docker for databases. File storage uses DigitalOcean Spaces (no local container needed).

### Making Changes

**Frontend Changes:**
1. Edit files in `frontend/app/src/`
2. Hot reload at http://localhost:3000
3. Test in browser
4. Commit changes

**Backend Changes:**
1. Edit files in `backend/src/`
2. Restart service or use nodemon
3. Test with Postman/curl
4. Update TypeScript types if needed
5. Commit changes

**Database Schema Changes:**
1. Edit `schema.ts` in backend or auth-service
2. Generate migration: `npm run db:generate`
3. Apply migration: `npm run db:push`
4. Test with real data
5. Commit schema + migration files

### Testing

**Manual Testing:**
- Test all CRUD operations in admin panel
- Test authentication flow
- Test file uploads
- Test responsive design on different devices

**No Automated Tests Yet** (future improvement)

---

## Deployment Strategy

### DigitalOcean App Platform

**Why DigitalOcean?**
- Managed Kubernetes (no server management)
- Built-in CI/CD from GitHub
- Automatic HTTPS/SSL
- Database backups included
- Monitoring dashboard
- Reasonable pricing (~$27-39/month)

### Deployment Process

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **GitHub Actions Triggered:**
   - Builds Docker images
   - Pushes to GitHub Container Registry
   - Triggers DigitalOcean deployment API

3. **DigitalOcean:**
   - Pulls new images
   - Runs database migrations
   - Rolling update (zero downtime)
   - Health checks before routing traffic

4. **Verification:**
   - Check deployment logs
   - Test live site
   - Monitor error rates

### Environment Variables in Production

**Secrets (encrypted):**
- `BETTER_AUTH_SECRET` - Generated with crypto.randomBytes(32)
- `AUTH_JWT_SECRET` - Different from BETTER_AUTH_SECRET
- Database credentials - Auto-generated by DigitalOcean

**Public:**
- `CORS_ORIGINS` - Production frontend URL
- `BETTER_AUTH_URL` - Production auth-service URL
- `NEXT_PUBLIC_API_URL` - Production backend URL

### Rollback Strategy

**If deployment fails:**
1. DigitalOcean auto-maintains previous version
2. Can rollback via console (one click)
3. Or redeploy previous Git commit

---

## Key Design Decisions

### 1. Monorepo vs Separate Repos

**Decision:** Monorepo (all services in one Git repo)

**Rationale:**
- Easier to keep services in sync
- Shared types across services
- Simpler CI/CD
- Better for small team (solo developer)

**Trade-off:**
- Larger repository
- Deploy all services together
- Could split later if needed

### 2. Next.js for Backend

**Decision:** Use Next.js API routes instead of Express/Fastify

**Rationale:**
- Unified TypeScript codebase
- Same deployment process
- Serverless-ready
- Built-in TypeScript support

**Trade-off:**
- Less flexible than pure Node.js
- Coupled to Next.js release cycle
- Could add Express later if needed

### 3. Better Auth vs NextAuth

**Decision:** Better Auth instead of NextAuth.js

**Rationale:**
- Modern, TypeScript-first
- Better DX (developer experience)
- More flexible
- Smaller bundle size
- Active development

**Trade-off:**
- Smaller community
- Fewer pre-built providers
- Documentation still evolving

### 4. Two Databases vs One

**Decision:** Separate databases for app data and auth data

**Rationale:**
- Security isolation
- Independent scaling
- Different backup policies
- Clearer separation of concerns

**Trade-off:**
- More resources
- Slightly more complex
- Worth it for security

### 5. Docker for Development

**Decision:** Docker Compose for local development

**Rationale:**
- Consistent environment across machines
- Easy onboarding for contributors
- Production parity
- No global installs needed

**Trade-off:**
- Slower than native (especially on Windows/Mac)
- Learning curve for Docker
- Disk space for images

### 6. Drizzle vs Prisma

**Decision:** Drizzle ORM instead of Prisma

**Rationale:**
- Lightweight (no runtime overhead)
- SQL-like syntax (more control)
- Better TypeScript inference
- Faster queries

**Trade-off:**
- Smaller ecosystem
- Less magical (more verbose)
- Fewer GUI tools

### 7. Admin-Only vs Multi-User

**Decision:** Single admin user only (no public registration)

**Rationale:**
- Simpler auth logic
- No user management UI needed
- No role complexity
- It's a personal portfolio (only owner needs access)

**Trade-off:**
- Can't scale to multi-user easily
- Would need refactor if requirements change

### 8. File Storage: DigitalOcean Spaces vs MinIO

**Decision:** DigitalOcean Spaces instead of self-hosted MinIO

**Rationale:**
- No container to manage (simpler architecture)
- Built-in CDN for fast file delivery
- Cost-effective for small projects
- Direct integration with DigitalOcean ecosystem
- Same S3-compatible API (easy migration if needed)
- Works in both dev and prod with folder prefixes

**Trade-off:**
- Requires internet connection (no offline development)
- Small monthly cost (~$5/month)
- Vendor lock-in to DigitalOcean (but S3-compatible, so migration is possible)

---

## Known Issues & Future Work

### Current Limitations

1. **No Automated Tests** (High Priority)
   - No unit tests
   - No integration tests
   - No E2E tests
   - Relies on manual testing
   - **Impact**: Makes security refactors risky without test coverage
   - **Next Steps**: Add unit tests for auth middleware, API routes, and critical business logic

2. **Middleware Validation** (Security Vulnerability - High Priority)
   - Only checks cookie presence
   - Doesn't validate JWT server-side
   - Could allow expired tokens through
   - **Impact**: Expired or invalid tokens may bypass authentication
   - **Next Steps**: Implement server-side JWT validation/expiry checks in the auth middleware (reference: "Middleware Validation" section)

3. **No Rate Limiting** (Security Vulnerability - High Priority)
   - Login endpoint vulnerable to brute force
   - API endpoints have no rate limits
   - **Impact**: Vulnerable to brute force attacks and API abuse
   - **Next Steps**: Add rate limiting/lockout for login and API endpoints (reference: "No Rate Limiting" section)

4. **Basic Error Handling**
   - Generic error messages
   - No error tracking service
   - Limited logging

5. **No Analytics**
   - No visitor tracking
   - No usage metrics
   - No performance monitoring

6. **SEO Not Optimized**
   - No meta tags
   - No sitemap
   - No structured data
   - No Open Graph tags

### Planned Improvements

**Short Term (Security & Stability):**
- [ ] Implement server-side JWT validation in middleware
- [ ] Add rate limiting for login and API endpoints
- [ ] Add unit tests for critical paths
- [ ] Add meta tags for SEO
- [ ] Improve error messages
- [ ] Add loading states
- [ ] Optimize images
- [ ] Add sitemap.xml

**Medium Term:**
- [ ] Add integration tests
- [ ] Improve middleware validation (full JWT verification)
- [ ] Add blog section
- [ ] Implement search
- [ ] Add CSRF protection

**Long Term:**
- [ ] Add Google Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Implement caching (Redis)
- [ ] Add email notifications
- [ ] Multi-language support

### Technical Debt

1. **Duplicate Secret** in `auth-service/src/lib/auth/auth.ts` around line 104
   - `authSecret` variable defined but duplicate inline usage
   - Should use the `authSecret` variable everywhere instead of inline `process.env.BETTER_AUTH_SECRET || process.env.AUTH_JWT_SECRET || "build-time-placeholder-secret-must-be-32-chars-min"`
   - Update all references to use the single `authSecret` variable
   - Add validation to fail fast if `authSecret` is missing at runtime

2. **ESLint Config** inconsistency
   - Backend/auth-service use basic config
   - Frontend uses Next.js config
   - Should standardize

3. **Hardcoded Values**
   - Some URLs hardcoded
   - Should use environment variables

4. **Type Safety**
   - Some `any` types used
   - Could improve type coverage

---

## FAQ

### Why not use a CMS like WordPress?

- **Learning**: Want to learn full-stack development
- **Control**: Full control over features and design
- **Performance**: Faster than WordPress
- **Modern Stack**: Use latest technologies

### Why so many microservices for a portfolio?

- **Learning**: Practice microservices architecture
- **Scalability**: Can add more features later
- **Resume**: Show full-stack capabilities
- **Reusability**: Can reuse auth-service for other projects

### Can I add a blog?

Yes! Would add:
- `blog_posts` table in app-db
- `/api/blog` endpoints in backend
- `/blog` pages in frontend
- Rich text editor in admin panel
- Markdown support

### How to add Google OAuth?

Better Auth supports it:
1. Get Google OAuth credentials
2. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   ```
3. Configure in `auth-service/src/lib/auth/auth.ts`
4. Add Google login button to login page

### How to change admin password?

**Recommended Method**: Use the admin panel password change feature (when implemented).

**Alternative Method** (if admin panel feature not available):
1. Connect to auth-db:
   ```bash
   docker compose exec auth-db psql -U auth_user -d auth_db
   ```
2. Generate bcrypt hash (10 rounds) using Node.js:
   ```javascript
   const bcrypt = require('bcryptjs');
   const hash = await bcrypt.hash('your-new-password', 10);
   console.log(hash);
   ```
3. Update password in database:
   ```sql
   UPDATE "user" 
   SET password = '<bcrypt-hash-from-step-2>',
       "updatedAt" = NOW()
   WHERE email = 'admin@portfolio.com';
   ```

**Note**: Direct database manipulation should only be used as a last resort. The recommended approach is to implement a secure password change endpoint and UI in the admin panel with current-password verification, bcrypt hashing, and CSRF protection.

### Can I host on Vercel instead?

Yes, but:
- Need separate hosting for databases
- DigitalOcean Spaces handles file storage (no separate hosting needed)
- Multi-service deployment more complex
- DigitalOcean App Platform handles all in one

---

## Contact & Support

**Project Owner:** Mir Faiyazur Rahman

**Repository:** https://github.com/Mirf-Rahman/Personal-Portfolio

**Issues:** Use GitHub Issues for bugs/features

---

**Last Updated:** January 2026
