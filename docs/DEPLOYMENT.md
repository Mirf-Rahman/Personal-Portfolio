# Deployment Guide

Complete guide for deploying your Personal Portfolio to DigitalOcean App Platform.

---

## Prerequisites

1. **DigitalOcean Account** - [Sign up](https://cloud.digitalocean.com/registrations/new)
2. **GitHub Repository** - Code pushed to GitHub
3. **DigitalOcean API Token** - For automated deployments

---

## 🚀 DigitalOcean App Platform Deployment

### Option 1: Automated Deployment (Recommended)

#### Step 1: Set Up GitHub Secrets

In your GitHub repository, go to **Settings → Secrets and variables → Actions**:

1. Create secret: `DIGITALOCEAN_ACCESS_TOKEN`
   - Get token: https://cloud.digitalocean.com/account/api/tokens
   - Generate new token with **write** permissions
   - Copy and paste into GitHub secret

#### Step 2: Create App on DigitalOcean

1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Select **GitHub** as source
4. Choose your `Personal-Portfolio` repository
5. Select `main` branch
6. Click **Next**

#### Step 3: Configure App Spec

Use this configuration:

```yaml
name: personal-portfolio
region: nyc
services:
  - name: frontend
    github:
      repo: <your-github-username>/<your-repo-name>
      branch: main
      deploy_on_push: true
    dockerfile_path: frontend/app/Dockerfile
    source_dir: /
    http_port: 3000
    routes:
      - path: /
    envs:
      - key: NEXT_PUBLIC_API_URL
        value: ${backend.PUBLIC_URL}
      - key: NEXT_PUBLIC_AUTH_SERVICE_URL
        value: ${auth-service.PUBLIC_URL}

  - name: backend
    dockerfile_path: backend/Dockerfile
    source_dir: /
    http_port: 8080
    envs:
      - key: DATABASE_URL
        value: ${app-db.DATABASE_URL}
      - key: AUTH_JWT_SECRET
        scope: RUN_AND_BUILD_TIME
        type: SECRET
      - key: CORS_ORIGINS
        value: ${frontend.PUBLIC_URL}

  - name: auth-service
    dockerfile_path: auth-service/Dockerfile
    source_dir: /
    http_port: 3001
    envs:
      - key: DATABASE_URL
        value: ${auth-db.DATABASE_URL}
      - key: BETTER_AUTH_SECRET
        scope: RUN_AND_BUILD_TIME
        type: SECRET
      - key: BETTER_AUTH_URL
        value: ${_self.PUBLIC_URL}
      - key: CORS_ORIGINS
        value: ${frontend.PUBLIC_URL}

databases:
  - name: app-db
    engine: PG
    version: "14"
    production: true
    
  - name: auth-db
    engine: PG
    version: "14"
    production: true
```

#### Step 4: Add Environment Secrets

In DigitalOcean App Platform, go to **Settings → App-Level Environment Variables**:

Generate secrets using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add these secrets:
- `AUTH_JWT_SECRET` - Output from above command
- `BETTER_AUTH_SECRET` - Output from above command (run again for different value)

#### Step 5: Deploy

1. Click **Create Resources**
2. Wait for build and deployment (5-10 minutes)
3. App will be available at provided URL

#### Step 6: Create Admin User

Once deployed, create admin user via DigitalOcean console:

```bash
# Get auth-service container
doctl apps list
doctl apps logs <APP_ID> --type run --component auth-service

# Admin user is auto-created on first startup
# Check logs for credentials or use seed-users.sh script
```

---

### Option 2: Manual Deployment

#### 1. Build Docker Images Locally

```bash
# Build all images
docker compose build

# Tag for registry
docker tag personal-portfolio-frontend:latest your-registry/personal-portfolio-frontend:latest
docker tag personal-portfolio-backend:latest your-registry/personal-portfolio-backend:latest
docker tag personal-portfolio-auth-service:latest your-registry/personal-portfolio-auth-service:latest

# Push to registry
docker push your-registry/personal-portfolio-frontend:latest
docker push your-registry/personal-portfolio-backend:latest
docker push your-registry/personal-portfolio-auth-service:latest
```

#### 2. Pull in DigitalOcean

Configure DigitalOcean to pull from your container registry.

---

## 🔐 Security Checklist

Before going live:

- [ ] Change default admin password
- [ ] Update `AUTH_JWT_SECRET` and `BETTER_AUTH_SECRET` in production
- [ ] Set proper `CORS_ORIGINS` (your production domain)
- [ ] Enable HTTPS/SSL (DigitalOcean provides free SSL)
- [ ] Review and limit DigitalOcean API token permissions
- [ ] Set up database backups
- [ ] Configure monitoring and alerts

---

## 🌍 Custom Domain Setup

### 1. Add Domain to DigitalOcean

1. In your app, go to **Settings → Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `mirrahman.dev`)
4. Click **Add Domain**

### 2. Update DNS Records

In your domain registrar (Namecheap, GoDaddy, etc.):

**Option A: Use DigitalOcean Nameservers** (Recommended)
1. Point to DigitalOcean nameservers:
   - `ns1.digitalocean.com`
   - `ns2.digitalocean.com`
   - `ns3.digitalocean.com`

**Option B: CNAME Record**
1. Add CNAME record:
   - Name: `@` or `www`
   - Value: `<your-app>.ondigitalocean.app`

### 3. Wait for DNS Propagation

DNS changes can take 24-48 hours. Check status:
```bash
nslookup yourdomain.com
```

---

## 📊 Monitoring

### DigitalOcean Built-in Monitoring

1. Go to your app dashboard
2. Click **Insights** tab
3. Monitor:
   - Request rates
   - Response times
   - Error rates
   - Resource usage

### Custom Monitoring

Add health check endpoints in your app:
- Frontend: `/api/health`
- Backend: `/api/health`
- Auth: `/api/health`

---

## 🔄 CI/CD Pipeline

### Automatic Deployments

The DigitalOcean App Platform uses **direct GitHub integration** with `deploy_on_push: true`:

1. **Push to `main` branch** triggers automatic deployment
2. **DigitalOcean builds** the application from source code
3. **Deployment happens** automatically without manual intervention
4. **No container registry required** - DigitalOcean builds directly from GitHub

**Note**: The GitHub Actions workflow (`.github/workflows/deploy-digitalocean-main.yml`) is available for manual triggers or custom deployment workflows, but the primary deployment method uses DigitalOcean's built-in GitHub integration.

### Manual Deployment

Trigger manually via GitHub Actions:
1. Go to **Actions** tab
2. Select **Deploy to DigitalOcean**
3. Click **Run workflow**

---

## 🐛 Troubleshooting

### Build Fails

Check build logs:
```bash
doctl apps logs <APP_ID> --type build
```

Common issues:
- Missing environment variables
- Docker build context errors
- Dependency installation failures

### Runtime Errors

Check runtime logs:
```bash
doctl apps logs <APP_ID> --type run --component frontend
doctl apps logs <APP_ID> --type run --component backend
doctl apps logs <APP_ID> --type run --component auth-service
```

### Database Connection Issues

Verify:
- `DATABASE_URL` environment variables are set
- Database is running and healthy
- Connection strings are correct

### Authentication Not Working

Check:
- `BETTER_AUTH_URL` points to auth-service public URL
- `CORS_ORIGINS` includes frontend URL
- Secrets are properly set

---

## 💰 Cost Estimation

**Pricing Disclaimer**: DigitalOcean pricing may change over time. Verify current rates at [DigitalOcean Pricing](https://www.digitalocean.com/pricing).

**Estimated Costs** (verify current rates):
- **App Platform**: Basic plan starts around $12/month (3 services, 512 MB RAM each)
- **Professional Plan**: ~$24/month (more resources, recommended for production)
- **Managed PostgreSQL**: ~$15/month (database hosting)

**Total Estimated Cost**: ~$27-39/month (as of 2024, verify current pricing)

> 💡 Tip: Start with Basic Plan and scale as needed. Check [DigitalOcean's pricing page](https://www.digitalocean.com/pricing) for the most current rates.

---

## 📚 Additional Resources

- [DigitalOcean App Platform Docs](https://docs.digitalocean.com/products/app-platform/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Better Auth Docs](https://www.better-auth.com/docs)

---

## 🆘 Support

If you encounter issues:

1. Check the [troubleshooting section](#-troubleshooting)
2. Review DigitalOcean logs
3. Check GitHub Actions logs
4. Review environment variables

---

**Happy Deploying! 🚀**
