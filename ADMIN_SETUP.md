# Admin User Setup - Automatic!

## ✅ Admin User is Created Automatically

When you start Docker, an admin user is automatically created for you.

### Default Admin Credentials

- **Email**: `admin@portfolio.com`
- **Password**: `admin123`
- **Role**: `ADMIN`

🔐 **IMPORTANT**: Change this password after first login!

---

## Quick Start

### 1. Start Docker

```powershell
docker compose up -d
```

### 2. Wait for Services

Wait about 30-60 seconds for all services to start and the admin user to be seeded.

You'll see this message in the auth-service logs:
```
✅ User seeding complete!
📝 Admin User Credentials:
   Email:    admin@portfolio.com
   Password: admin123
   Role:     ADMIN
```

### 3. Login

Open your browser and go to:
```
http://localhost:3000/login
```

Login with the automatic credentials above.

---

## Troubleshooting

### Check if admin was created

```powershell
# View auth-service logs
docker compose logs auth-service | findstr "Admin"
```

### Admin user not created

If seeding failed, check:
```powershell
# Full auth-service logs
docker compose logs auth-service

# Restart auth-service to retry seeding
docker compose restart auth-service
```

### Cannot login

1. Check that auth-service is running:
   ```powershell
   docker compose ps auth-service
   ```

2. Check browser console for errors (F12)

3. Verify .env has correct settings:
   ```
   CORS_ORIGINS=http://localhost:3000
   BETTER_AUTH_URL=http://localhost:3001
   ```

---

## Production Note

⚠️ **The automatic admin seeding is DISABLED in production** for security.

In production:
1. Sign up normally via your frontend
2. Connect to auth-db
3. Run: `UPDATE "user" SET role = 'ADMIN' WHERE email = 'your-email@example.com';`
