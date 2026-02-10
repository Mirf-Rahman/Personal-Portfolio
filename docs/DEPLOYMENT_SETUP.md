# Complete Deployment Setup Guide

This guide walks you through getting all required secrets and configuring your Personal Portfolio project for deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [DigitalOcean Spaces Setup](#digitalocean-spaces-setup)
3. [Environment Variables Guide](#environment-variables-guide)
4. [Development Setup](#development-setup)
5. [Production Deployment Checklist](#production-deployment-checklist)
6. [Cleaning Up Old MinIO Data](#cleaning-up-old-minio-data)

---

## Prerequisites

Before starting, ensure you have:
- A DigitalOcean account (sign up at https://www.digitalocean.com)
- Access to your project repository
- Basic understanding of environment variables

---

## DigitalOcean Spaces Setup

### Step 1: Create a DigitalOcean Space

1. **Log in to DigitalOcean:**
   - Go to https://cloud.digitalocean.com
   - Sign in to your account

2. **Navigate to Spaces:**
   - Click **Manage** in the top navigation
   - Select **Spaces** from the dropdown
   - Or go directly to: https://cloud.digitalocean.com/spaces

3. **Create a New Space:**
   - Click the **Create a Space** button
   - Configure the Space:
     - **Name:** `portfolio-files` (must be globally unique - add your name/initials if taken)
     - **Region:** Choose closest to your users (e.g., `nyc3`, `sfo3`, `ams3`)
     - **CDN:** ✅ **Enable CDN** (recommended for faster file delivery)
     - **File Listing:** ❌ **Disable** (for security - prevents public directory browsing)
   - Click **Create a Space**

4. **Note Your Space Details:**
   - **Space Name:** `mirf-portfolio-files` (or whatever you named it)
   - **Region:** e.g., `nyc3`
   - **Origin Endpoint:** `{region}.digitaloceanspaces.com` (e.g., `nyc3.digitaloceanspaces.com`)
     - Full origin URL: `https://mirf-portfolio-files.nyc3.digitaloceanspaces.com`
   - **CDN Endpoint:** `https://{space-name}.{region}.cdn.digitaloceanspaces.com`
     - Example: `https://mirf-portfolio-files.nyc3.cdn.digitaloceanspaces.com`

### Step 2: Generate Access Keys

1. **Navigate to Your Space Settings:**
   - Go to **Spaces** in the left sidebar (or https://cloud.digitalocean.com/spaces)
   - Click on your Space name: **`mirf-portfolio-files`**
   - Click on the **Settings** tab at the top
   - Scroll down to find the **Access Keys** section

2. **Open the Create Access Key Modal:**
   - In the **Access Keys** section, you'll see:
     - Description text: "Create a granular access key for this specific bucket..."
     - A blue **Create Access Key** button on the right
   - **Click the "Create Access Key" button** - this opens a modal dialog

3. **Configure the Access Key Modal (STEP-BY-STEP):**

   **Step 3a: Select Access Scope**
   - You'll see two radio button options:
     - ✅ **Limited Access** (SELECT THIS ONE - it should already be selected)
       - Description: "Grant access to specific buckets..."
       - This is the secure option - only gives access to your specific bucket
     - ❌ **Full Access** (DO NOT SELECT THIS)
       - This would give access to ALL buckets - not needed and less secure

   **Step 3b: Select Bucket and Permissions (CRITICAL STEP)**
   - You'll see a section: **"Select the buckets and permissions"**
   - There's a search bar labeled "Select a bucket"
   - Below it, you'll see your bucket: **`mirf-portfolio-files`**
   - **Check the checkbox** next to `mirf-portfolio-files` (it should already be checked)
   - **⚠️ CRITICAL: Look for the "Permissions" dropdown** to the right of the bucket name
     - It will likely show **"Read"** by default
     - **You MUST change this to "Read & Write" or "Read/Write"**
     - Click the dropdown and select **"Read/Write"** or **"Read & Write"**
     - This is ESSENTIAL - without write permissions, you cannot upload files!
     - The dropdown options are typically:
       - ❌ Read (read-only - NOT sufficient for uploads)
       - ✅ Read/Write (SELECT THIS - allows uploads and downloads)
       - ❌ Read/Write/Delete (optional - allows deletion too, but Read/Write is enough)

   **Step 3c: Name Your Access Key**
   - Find the section: **"Give this access key a name*"**
   - There's an input field (it may have an auto-generated name like `key-1769131457689`)
   - **Delete the auto-generated name** and type: `portfolio-backend`
   - Or use any descriptive name you prefer (e.g., `portfolio-upload-key`, `backend-files`)
   - The name can only contain: letters, numbers, dashes (-), and periods (.)
   - Example valid names: `portfolio-backend`, `my-portfolio.key`, `backend123`

4. **Create the Access Key:**
   - Review your settings:
     - ✅ Limited Access selected
     - ✅ `mirf-portfolio-files` bucket checked
     - ✅ Permissions set to **Read/Write** (or Read/Write/Delete)
     - ✅ Name entered (e.g., `portfolio-backend`)
   - Click the blue **"Create Access Key"** button at the bottom right
   - The modal will close and you'll see a success message

5. **⚠️ CRITICAL - Copy Your Keys IMMEDIATELY:**
   - After clicking "Create Access Key", a new screen or modal will appear showing:
     - **Access Key:** Starts with `DO...` (e.g., `DO1234567890ABCDEF`)
     - **Secret Key:** A long random string (e.g., `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...`)
   - **⚠️ THE SECRET KEY IS SHOWN ONLY ONCE - COPY IT NOW!**
   - **Action Steps:**
     1. Click the **copy icon** next to the Access Key (or select and copy manually)
     2. Paste it somewhere safe (password manager, secure note)
     3. Click the **copy icon** next to the Secret Key (or select and copy manually)
     4. Paste it somewhere safe immediately
     5. **Verify both keys are copied** before closing the page
   - **If you close this page without copying the Secret Key, you'll need to:**
     - Delete the access key
     - Create a new one
     - Copy the secret key this time

6. **Store Keys Securely:**
   - **Access Key:** `DO...` (you can see this anytime in Space Settings)
   - **Secret Key:** `long-random-string` (shown only once - you just copied it)
   - **Recommended Storage:**
     - Password manager (1Password, LastPass, Bitwarden, etc.)
     - Secure note-taking app
     - Encrypted file (never commit to Git!)
   - **What NOT to do:**
     - ❌ Don't save in a plain text file
     - ❌ Don't email it to yourself
     - ❌ Don't commit to Git (already in `.gitignore`, but double-check)
     - ❌ Don't share in screenshots or chat

7. **Verify Your Access Key:**
   - Go back to **Spaces** → **`mirf-portfolio-files`** → **Settings** → **Access Keys**
   - You should see your new key listed with the name you gave it (e.g., `portfolio-backend`)
   - The Access Key will be visible, but the Secret Key will show as hidden (****)
   - You can see when it was created
   - You can delete or regenerate it if needed (but you'll lose the secret key if you regenerate)

---

## Environment Variables Guide

### Understanding Environment Variables

Environment variables are configuration values that your application reads at runtime. They're stored in a `.env` file (never committed to Git).

### Complete Environment Variables List

#### 1. Authentication Secrets (REQUIRED)

**AUTH_JWT_SECRET**
- **Purpose:** Secret key for signing JWT tokens between auth-service and backend
- **How to Generate:**
  ```bash
  openssl rand -base64 32
  ```
- **Example:** `aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE1fG3hI5jK7lM9nO1pQ3`
- **Security:** Must be at least 32 characters, use strong random value

**BETTER_AUTH_SECRET**
- **Purpose:** Secret for encrypting Better Auth sessions
- **How to Generate:**
  ```bash
  openssl rand -base64 32
  ```
- **Example:** `xY9zA7bC5dE3fG1hI9jK7lM5nO3pQ1rS9tU7vW5xY3zA1bC9dE7fG5hI3jK1`
- **Security:** Must be at least 32 characters, use strong random value

**Note:** These should be DIFFERENT values. Never reuse the same secret for both.

#### 2. DigitalOcean Spaces Configuration (REQUIRED)

**SPACES_ENDPOINT**
- **Purpose:** DigitalOcean Spaces API endpoint (origin endpoint)
- **Format:** `{region}.digitaloceanspaces.com`
- **Example:** `nyc3.digitaloceanspaces.com`
- **How to Get:** From your Space settings page - it's the "origin endpoint" (e.g., `https://mirf-portfolio-files.nyc3.digitaloceanspaces.com`)
- **Note:** Use just the domain part: `nyc3.digitaloceanspaces.com` (without `https://`)

**SPACES_ACCESS_KEY**
- **Purpose:** Your Spaces access key (Access Key ID)
- **Format:** Starts with `DO...`
- **Example:** `DO1234567890ABCDEF`
- **How to Get:** From your Space Settings → Access Keys section (created in Step 2)

**SPACES_SECRET_KEY**
- **Purpose:** Your Spaces secret access key
- **Format:** Long random string
- **Example:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
- **How to Get:** From your Space Settings → Access Keys section (created in Step 2, shown only once!)

**SPACES_BUCKET**
- **Purpose:** Name of your DigitalOcean Space
- **Format:** Your Space name (lowercase, no spaces)
- **Example:** `portfolio-files`
- **How to Get:** The name you gave your Space when creating it

**SPACES_REGION**
- **Purpose:** Region where your Space is located
- **Format:** Region code
- **Example:** `nyc3`, `sfo3`, `ams3`, `sgp1`, `fra1`
- **How to Get:** From your Space details page

**SPACES_CDN_URL**
- **Purpose:** CDN URL for serving files (recommended for faster delivery)
- **Format:** `https://{bucket}.{region}.cdn.digitaloceanspaces.com`
- **Example:** `https://mirf-portfolio-files.nyc3.cdn.digitaloceanspaces.com`
- **How to Get:** From your Space settings page - it's the "CDN endpoint" (shown when CDN is enabled)

**SPACES_FOLDER_PREFIX**
- **Purpose:** Folder prefix to separate dev/prod files in same bucket
- **Development:** `dev`
- **Production:** `""` (empty string) or `prod`
- **Example (dev):** `dev`
- **Example (prod):** `` (empty)

#### 3. CORS Configuration (REQUIRED for production)

**CORS_ORIGINS**
- **Purpose:** Allowed origins for API requests
- **Development:** `http://localhost:3000`
- **Production:** `https://yourdomain.com` (comma-separated if multiple)
- **Example (dev):** `http://localhost:3000`
- **Example (prod):** `https://yourportfolio.com,https://www.yourportfolio.com`

#### 4. Service URLs (REQUIRED for production)

**BETTER_AUTH_URL**
- **Purpose:** Public URL of your auth service
- **Development:** `http://localhost:3001`
- **Production:** `https://auth.yourportfolio.com` or `https://yourportfolio.com/api/auth`
- **Example (prod):** `https://api.yourportfolio.com`

**FRONTEND_URL**
- **Purpose:** Public URL of your frontend
- **Development:** `http://localhost:3000`
- **Production:** `https://yourportfolio.com`
- **Example (prod):** `https://yourportfolio.com`

**NEXT_PUBLIC_API_URL**
- **Purpose:** Public URL of your backend API (used by frontend)
- **Development:** `http://localhost:8080`
- **Production:** `https://api.yourportfolio.com`
- **Example (prod):** `https://api.yourportfolio.com`

**NEXT_PUBLIC_AUTH_SERVICE_URL**
- **Purpose:** Public URL of your auth service (used by frontend)
- **Development:** `http://localhost:3001`
- **Production:** `https://auth.yourportfolio.com` or same as BETTER_AUTH_URL
- **Example (prod):** `https://api.yourportfolio.com`

#### 5. Database Configuration (Managed by DigitalOcean in production)

**DATABASE_URL**
- **Purpose:** PostgreSQL connection string
- **Development:** `postgres://app_user:app_pass@app-db:5432/portfolio_app`
- **Production:** Provided by DigitalOcean Managed Database
- **Format:** `postgres://user:password@host:port/database`

---

## Development Setup

### Step 1: Copy Environment Template

```bash
cp .env.example .env
```

### Step 2: Generate Secrets

```bash
# Generate AUTH_JWT_SECRET
openssl rand -base64 32

# Generate BETTER_AUTH_SECRET (different from above!)
openssl rand -base64 32
```

### Step 3: Configure .env File

Edit `.env` and fill in all values:

```env
# Authentication Secrets
AUTH_JWT_SECRET=<paste-first-generated-secret>
BETTER_AUTH_SECRET=<paste-second-generated-secret>

# CORS
CORS_ORIGINS=http://localhost:3000

# Service URLs (Development)
BETTER_AUTH_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001

# DigitalOcean Spaces
# Get these from: Spaces → mirf-portfolio-files → Settings → Access Keys
SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
SPACES_ACCESS_KEY=DO1234567890ABCDEF  # Copy from Access Keys modal (starts with DO...)
SPACES_SECRET_KEY=your-secret-key-here  # Copy from Access Keys modal (shown only once!)
SPACES_BUCKET=mirf-portfolio-files
SPACES_REGION=nyc3
SPACES_CDN_URL=https://mirf-portfolio-files.nyc3.cdn.digitaloceanspaces.com
SPACES_FOLDER_PREFIX=dev
```

### Step 4: Verify Setup

```bash
# Start services
docker compose up -d

# Check logs
docker compose logs backend

# Test file upload (after logging in as admin)
curl -X POST http://localhost:8080/api/files \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test-image.jpg"
```

---

## Production Deployment Checklist

### Pre-Deployment

- [ ] **DigitalOcean Spaces:**
  - [ ] Space created with CDN enabled
  - [ ] Access Keys generated and saved securely (from Space Settings → Access Keys)
  - [ ] Bucket name noted (e.g., `mirf-portfolio-files`)
  - [ ] Region selected (e.g., `nyc3`)
  - [ ] Origin endpoint noted (e.g., `nyc3.digitaloceanspaces.com`)
  - [ ] CDN endpoint noted (e.g., `https://mirf-portfolio-files.nyc3.cdn.digitaloceanspaces.com`)

- [ ] **Secrets Generated:**
  - [ ] `AUTH_JWT_SECRET` generated (32+ characters)
  - [ ] `BETTER_AUTH_SECRET` generated (32+ characters, different from AUTH_JWT_SECRET)
  - [ ] Both stored securely

- [ ] **Domain Configuration:**
  - [ ] Domain purchased/configured
  - [ ] DNS records set up
  - [ ] SSL certificates ready (DigitalOcean handles this)

- [ ] **Database:**
  - [ ] DigitalOcean Managed PostgreSQL created
  - [ ] Connection string obtained
  - [ ] Database migrations ready

### Environment Variables for Production

Create a `.env.prod` file (or configure in DigitalOcean App Platform):

```env
# Authentication Secrets
AUTH_JWT_SECRET=<your-production-jwt-secret>
BETTER_AUTH_SECRET=<your-production-auth-secret>

# CORS (Production domains)
CORS_ORIGINS=https://yourportfolio.com,https://www.yourportfolio.com

# Service URLs (Production)
BETTER_AUTH_URL=https://api.yourportfolio.com
FRONTEND_URL=https://yourportfolio.com
NEXT_PUBLIC_API_URL=https://api.yourportfolio.com
NEXT_PUBLIC_AUTH_SERVICE_URL=https://api.yourportfolio.com

# DigitalOcean Spaces (Production)
SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
SPACES_ACCESS_KEY=<your-production-access-key>
SPACES_SECRET_KEY=<your-production-secret-key>
SPACES_BUCKET=mirf-portfolio-files
SPACES_REGION=nyc3
SPACES_CDN_URL=https://mirf-portfolio-files.nyc3.cdn.digitaloceanspaces.com
SPACES_FOLDER_PREFIX=  # Empty for production, or use "prod"

# Database (DigitalOcean Managed)
DATABASE_URL=postgres://user:password@host:port/database
```

### DigitalOcean App Platform Configuration

1. **Create App:**
   - Go to DigitalOcean App Platform
   - Create new app from GitHub repository
   - Select your repository

2. **Configure Services:**
   - **Frontend Service:**
     - Build command: `cd frontend/app && npm ci && npm run build`
     - Run command: `cd frontend/app && npm start`
     - Environment variables: All `NEXT_PUBLIC_*` variables

   - **Backend Service:**
     - Build command: `cd backend && npm ci && npm run build`
     - Run command: `cd backend && npm start`
     - Environment variables: All backend variables (except `NEXT_PUBLIC_*`)

   - **Auth Service:**
     - Build command: `cd auth-service && npm ci && npm run build`
     - Run command: `cd auth-service && npm start`
     - Environment variables: All auth-service variables

3. **Add Managed Database:**
   - Add PostgreSQL database component
   - Note the connection string
   - Update `DATABASE_URL` in environment variables

4. **Set Environment Variables:**
   - Add all environment variables from `.env.prod`
   - Mark secrets as "Encrypted" in DigitalOcean
   - Verify all variables are set

5. **Deploy:**
   - Review configuration
   - Deploy app
   - Monitor deployment logs

### Post-Deployment

- [ ] **Verify Services:**
  - [ ] Frontend loads at production URL
  - [ ] Backend API responds at `/api/health`
  - [ ] Auth service responds at `/api/health`
  - [ ] Can log in as admin

- [ ] **Test File Upload:**
  - [ ] Log in to admin panel
  - [ ] Upload a test image
  - [ ] Verify file appears in Spaces bucket
  - [ ] Verify CDN URL works

- [ ] **Security Check:**
  - [ ] All secrets are encrypted
  - [ ] CORS is configured correctly
  - [ ] HTTPS is enabled
  - [ ] Admin password changed from default

---

## Cleaning Up Old MinIO Data

The `data/minio` directory contains old MinIO data that's no longer needed. You can safely delete it:

### Option 1: Delete via Command Line

```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force .\data\minio

# Linux/Mac
rm -rf ./data/minio
```

### Option 2: Delete via File Explorer

1. Navigate to your project directory
2. Open the `data` folder
3. Delete the `minio` folder

### Option 3: Keep for Migration (Optional)

If you have existing files in MinIO that you want to migrate to Spaces:

1. **List files in MinIO:**
   ```bash
   docker compose exec minio mc ls minio/portfolio-files
   ```

2. **Download files:**
   ```bash
   docker compose exec minio mc cp --recursive minio/portfolio-files ./backup/
   ```

3. **Upload to Spaces:**
   - Use the Spaces web interface
   - Or write a migration script using the AWS SDK

4. **Update database URLs:**
   - Update any `imageUrl` or `fileUrl` fields in your database
   - Replace MinIO URLs with Spaces CDN URLs

---

## Troubleshooting

### Spaces Connection Issues

**Error: "Missing required Spaces environment variables"**
- Check that all `SPACES_*` variables are set in `.env`
- Verify variable names match exactly (case-sensitive)

**Error: "Access Denied" or "403 Forbidden"**
- Verify your Access Keys are correct (Access Key and Secret Key)
- **Check that permissions are set to "Read/Write" (not just "Read")**
  - Go to Spaces → Your Space → Settings → Access Keys
  - Find your key and verify it has Write permissions
  - If it only has Read, delete it and create a new one with Read/Write
- Check that the key was created for this specific bucket (`mirf-portfolio-files`)
- Ensure the bucket name matches exactly in your `.env` file
- Verify the keys haven't been revoked or deleted
- Make sure you copied the Secret Key correctly (no extra spaces, all characters)

**Error: "Bucket not found"**
- Verify `SPACES_BUCKET` matches your Space name exactly
- Check that the Space exists in the correct region

### File Upload Issues

**Error: "Invalid file type"**
- Check that file type is in allowed list (images, PDFs)
- Verify `Content-Type` header is correct

**Error: "File size exceeds maximum"**
- Images: Max 10MB
- PDFs: Max 5MB
- Compress or resize files if needed

### CDN URL Not Working

**Files upload but CDN URL returns 404:**
- Verify CDN is enabled on your Space
- Check that `SPACES_CDN_URL` is correct
- Wait a few minutes for CDN propagation
- Try accessing the file directly via Spaces endpoint first

---

## Security Best Practices

1. **Never commit `.env` files to Git**
   - Already in `.gitignore`, but double-check

2. **Use different secrets for dev and prod**
   - Generate separate secrets for each environment

3. **Rotate secrets periodically**
   - Change secrets every 3-6 months
   - Or immediately if compromised

4. **Use bucket-specific access keys**
   - Create access keys from your Space Settings (not general API tokens)
   - Keys created from Space Settings are automatically scoped to that bucket
   - Don't use "Full Access" Personal Access Tokens for Spaces

5. **Enable CDN but disable file listing**
   - CDN for performance
   - Disable listing for security

6. **Monitor Spaces usage**
   - Check DigitalOcean dashboard regularly
   - Set up billing alerts

---

## Quick Reference: All Required Variables

```env
# Authentication (2 secrets)
AUTH_JWT_SECRET=<32+ char random string>
BETTER_AUTH_SECRET=<32+ char random string>

# CORS (1 variable)
CORS_ORIGINS=<comma-separated URLs>

# Service URLs (4 variables)
BETTER_AUTH_URL=<auth service URL>
FRONTEND_URL=<frontend URL>
NEXT_PUBLIC_API_URL=<backend API URL>
NEXT_PUBLIC_AUTH_SERVICE_URL=<auth service URL>

# DigitalOcean Spaces (7 variables)
SPACES_ENDPOINT=<region>.digitaloceanspaces.com  # Origin endpoint (domain only, no https://)
SPACES_ACCESS_KEY=<DO... access key>  # From Space Settings → Access Keys
SPACES_SECRET_KEY=<secret key>  # From Space Settings → Access Keys (shown once!)
SPACES_BUCKET=<space name>  # Your Space name (e.g., mirf-portfolio-files)
SPACES_REGION=<region code>  # Region code (e.g., nyc3)
SPACES_CDN_URL=https://<bucket>.<region>.cdn.digitaloceanspaces.com  # CDN endpoint
SPACES_FOLDER_PREFIX=<dev|prod|empty>  # Folder prefix for dev/prod separation

# Database (1 variable - managed in production)
DATABASE_URL=<postgres connection string>
```

**Total: 15 environment variables** (plus optional Google OAuth if used)

---

## Need Help?

- **DigitalOcean Spaces Docs:** https://docs.digitalocean.com/products/spaces/
- **AWS SDK Docs:** https://docs.aws.amazon.com/sdk-for-javascript/v3/
- **Project Issues:** Check GitHub Issues or create a new one

---

**Last Updated:** January 2025
