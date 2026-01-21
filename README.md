# Personal Portfolio

> A modern, full-stack portfolio website with admin panel by me, **Mir Faiyazur Rahman**

Portfolio website showcasing my work, skills, and experience with a secure admin panel for content management.

---

## 🚀 Features

- **Public Portfolio** - Showcase projects, skills, experience, education, and hobbies
- **Admin Panel** - Secure content management system
- **Authentication** - Better Auth integration with JWT
- **Database** - PostgreSQL with Drizzle ORM
- **File Storage** - MinIO for image and file uploads
- **Responsive Design** - Built with Next.js 15 and Tailwind CSS
- **Docker Ready** - Complete containerization for easy deployment

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **State Management:** TanStack Query

### Backend
- **API:** Next.js API Routes
- **Database:** PostgreSQL
- **ORM:** Drizzle
- **Authentication:** Better Auth
- **File Storage:** MinIO (S3-compatible)

### DevOps
- **Containerization:** Docker & Docker Compose
- **CI/CD:** GitHub Actions
- **Deployment:** DigitalOcean App Platform
- **Version Control:** Git

---

## 📋 Prerequisites

- **Node.js** 20.x or higher
- **Docker** & Docker Compose
- **Git**

---

## 🏃 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Mirf-Rahman/Personal-Portfolio.git
cd Personal-Portfolio
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

The `.env` file is pre-configured with development values. For production, update the secrets.

### 3. Start with Docker

```bash
docker compose up -d --build
```

This will start:
- Frontend (http://localhost:3000)
- Backend API (http://localhost:8080)
- Auth Service (http://localhost:3001)
- PostgreSQL databases
- MinIO storage



## 📖 Documentation

- **[Deployment Guide](docs/DEPLOYMENT.md)** - Deploy to DigitalOcean
- **[Admin Setup](ADMIN_SETUP.md)** - Admin user management
- **[Setup Guide](SETUP_GUIDE.md)** - Detailed setup instructions

---

## 🔐 Security

- JWT-based authentication
- Session management
- Environment variable validation
- Docker security best practices
- CORS configuration

---

## 🚢 Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions for DigitalOcean App Platform.

Quick deploy:
```bash
# GitHub Actions automatically deploys on push to main
git push origin main
```

---

## 🧪 Development

### Local Development (without Docker)

```bash
# Frontend
cd frontend/app
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev

# Auth Service
cd auth-service
npm install
npm run dev
```

### Build for Production

```bash
docker compose build --no-cache
```


