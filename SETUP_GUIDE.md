# Personal Portfolio - Setup Guide

This guide explains how to set up and run the Personal Portfolio project locally and in production.

## Prerequisites

- **Node.js 20+** (LTS recommended)
- **Docker** and **Docker Compose**
- **Git**
- **VS Code** (recommended IDE)

## Quick Start (Development)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Personal-Portfolio.git
cd Personal-Portfolio
```

### 2. Environment Setup

Copy the example environment file and configure:

```bash
cp .env.example .env
```

**Generate secrets** (run in terminal):
```bash
# Generate AUTH_JWT_SECRET
openssl rand -base64 32

# Generate BETTER_AUTH_SECRET
openssl rand -base64 32
```

Edit `.env` and replace placeholder values:
```env
AUTH_JWT_SECRET=<paste-first-generated-secret>
BETTER_AUTH_SECRET=<paste-second-generated-secret>
```

### 3. Start All Services

```bash
docker compose up -d
```

This starts:
- **app-db** (PostgreSQL) - Port 5433
- **auth-db** (PostgreSQL) - Port 5434
- **backend** (Next.js API) - Port 8080
- **auth-service** (Better Auth) - Port 3001
- **public-app** (Portfolio) - Port 3000
- **admin-app** (Admin Panel) - Port 3002
- **DigitalOcean Spaces** (File Storage) - Cloud-based, no local container

### 4. Configure DigitalOcean Spaces

The project uses DigitalOcean Spaces for file storage. You need to:

1. **Create a DigitalOcean Space:**
   - Log in to [DigitalOcean Control Panel](https://cloud.digitalocean.com)
   - Navigate to **Spaces** → **Create a Space**
   - Choose a unique name (e.g., `portfolio-files`)
   - Select a region (e.g., `nyc3`)
   - Enable CDN (recommended)
   - Click **Create Space**

2. **Generate API Keys:**
   - Go to **API** → **Spaces Keys**
   - Click **Generate New Key**
   - Name: `portfolio-backend`
   - Access: **Limited access** (recommended)
   - Permissions: **Read/Write/Delete** for your bucket
   - Click **Generate Key**
   - **Important:** Copy both Access Key and Secret Key immediately (secret is shown only once)

3. **Update `.env` file:**
   ```env
   SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
   SPACES_ACCESS_KEY=your-access-key-here
   SPACES_SECRET_KEY=your-secret-key-here
   SPACES_BUCKET=portfolio-files
   SPACES_REGION=nyc3
   SPACES_CDN_URL=https://portfolio-files.nyc3.cdn.digitaloceanspaces.com
   SPACES_FOLDER_PREFIX=dev
   ```

### 5. Access the Applications

| Service | URL | Description |
|---------|-----|-------------|
| Public Portfolio | http://localhost:3000 | Visitor-facing portfolio |
| Admin Panel | http://localhost:3002 | Content management |
| Backend API | http://localhost:8080 | API endpoints |
| Auth Service | http://localhost:3001 | Authentication |
| DigitalOcean Spaces | Cloud-based | File storage (configure via .env) |

---

## Development Without Docker

If you prefer running services locally without Docker:

### 1. Install Dependencies

```bash
# Install backend dependencies
cd backend && npm install

# Install auth-service dependencies
cd ../auth-service && npm install

# Install public-app dependencies
cd ../frontend/public-app && npm install

# Install admin-app dependencies
cd ../frontend/admin-app && npm install
```

### 2. Start PostgreSQL

You'll need two PostgreSQL databases running:
- `portfolio_app` (port 5433 or default 5432)
- `auth_db` (port 5434 or separate instance)

### 3. Configure Environment

Each service needs its own `.env.local`:

**backend/.env.local:**
```env
DATABASE_URL=postgres://app_user:app_pass@localhost:5433/portfolio_app
AUTH_JWT_SECRET=<your-secret>
```

**auth-service/.env.local:**
```env
DATABASE_URL=postgres://auth_user:auth_pass@localhost:5434/auth_db
BETTER_AUTH_SECRET=<your-secret>
BETTER_AUTH_JWT_SECRET=<your-jwt-secret>
BETTER_AUTH_URL=http://localhost:3001
```

### 4. Run Database Migrations

```bash
cd backend && npm run db:push
cd ../auth-service && npm run db:push
```

### 5. Start Services

Open separate terminals:

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Auth Service
cd auth-service && npm run dev

# Terminal 3 - Public App
cd frontend/public-app && npm run dev

# Terminal 4 - Admin App
cd frontend/admin-app && npm run dev
```

---

## Better Auth Configuration

The project uses [Better Auth](https://better-auth.com) for authentication.

### How It Works

1. **Admin logs in** via admin-app → auth-service
2. **Auth-service** validates credentials and issues JWT
3. **Admin-app** includes JWT in API requests
4. **Backend** validates JWT and processes requests

### JWT Claims

```json
{
  "sub": "user-id",
  "email": "admin@example.com",
  "name": "Admin Name",
  "role": "ADMIN",
  "iss": "portfolio-auth",
  "aud": "portfolio-api"
}
```

### Adding an Admin User

**Option 1: Use the Seed Script (Recommended)**

The auth-service automatically creates an admin user on first startup via `seed-users.sh`. This script properly hashes the password using Better Auth's password hashing routine.

**Option 2: Manual Database Insert (Advanced)**

If you need to manually create an admin user, you must hash the password first:

1. **Connect to auth-db:**
   ```bash
   # Using Docker
   docker compose exec auth-db psql -U auth_user -d auth_db
   
   # Or using connection string
   psql postgres://auth_user:auth_pass@localhost:5434/auth_db
   ```

2. **Generate password hash using Better Auth:**
   The password must be hashed using bcrypt (10 rounds) as used by Better Auth. You can use Node.js:
   ```javascript
   const bcrypt = require('bcryptjs');
   const hash = await bcrypt.hash('your-password', 10);
   console.log(hash);
   ```

3. **Insert admin user:**
   ```sql
   INSERT INTO "user" (
     id, 
     name, 
     email, 
     password, 
     role, 
     email_verified, 
     created_at, 
     updated_at
   )
   VALUES (
     gen_random_uuid(),
     'Admin User',
     'admin@yourdomain.com',
     '<bcrypt-hashed-password>',  -- Use hash from step 2
     'ADMIN',
     true,
     NOW(),
     NOW()
   );
   ```

**Option 3: Use Auth Service Admin Endpoint (Future)**

A dedicated admin creation endpoint may be added in the future to handle password hashing server-side.

**Important Notes:**
- Never insert plaintext passwords - always use bcrypt hashing
- The `password` field stores the bcrypt hash, not the plain password
- Required fields: `id`, `name`, `email`, `password`, `role`, `email_verified`
- The `role` field must be exactly `'ADMIN'` (case-sensitive)

---

## Production Deployment (DigitalOcean)

### Architecture

```
yourportfolio.com → public-app
admin.yourportfolio.com → admin-app
api.yourportfolio.com → backend
auth.yourportfolio.com → auth-service
```

### Environment Variables for Production

```env
# Production secrets (generate new ones!)
AUTH_JWT_SECRET=<production-jwt-secret>
BETTER_AUTH_SECRET=<production-auth-secret>

# CORS - production domains
CORS_ORIGINS=https://yourportfolio.com,https://admin.yourportfolio.com

# URLs
BETTER_AUTH_URL=https://auth.yourportfolio.com
FRONTEND_URL=https://yourportfolio.com
PUBLIC_APP_URL=https://yourportfolio.com
ADMIN_APP_URL=https://admin.yourportfolio.com

# File storage - DigitalOcean Spaces
SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
SPACES_ACCESS_KEY=<your-spaces-access-key>
SPACES_SECRET_KEY=<your-spaces-secret-key>
SPACES_BUCKET=your-portfolio-files
SPACES_REGION=nyc3
SPACES_CDN_URL=https://your-portfolio-files.nyc3.cdn.digitaloceanspaces.com
SPACES_FOLDER_PREFIX=prod
```

### Deployment Steps

1. Create DigitalOcean App Platform project
2. Connect GitHub repository
3. Configure environment variables
4. Set up managed PostgreSQL databases
5. Configure DigitalOcean Spaces for file storage
6. Set up custom domains with SSL

---

## Common Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend

# Rebuild after code changes
docker compose up -d --build

# Start with pgAdmin
docker compose --profile pgadmin up -d

# Access pgAdmin
# http://localhost:5050
# Login with PGADMIN_DEFAULT_EMAIL and PGADMIN_DEFAULT_PASSWORD

# Reset everything (including volumes)
docker compose down -v
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check if databases are running
docker compose ps

# Check database logs
docker compose logs app-db
docker compose logs auth-db
```

### Port Conflicts

If ports are already in use, modify `docker-compose.yml`:
```yaml
ports:
  - "3100:3000"  # Change host port
```

### Health Check Failures

```bash
# Check service health
curl http://localhost:8080/api/health
curl http://localhost:3001/api/health
```

---

## Project Structure

```
Personal-Portfolio/
├── frontend/
│   ├── public-app/      # Portfolio viewer (Next.js)
│   └── admin-app/       # Admin panel (Next.js)
├── backend/             # API server (Next.js)
├── auth-service/        # Authentication (Better Auth)
├── docker-compose.yml   # Development services
├── .env.example         # Environment template
└── SETUP_GUIDE.md       # This file
```
