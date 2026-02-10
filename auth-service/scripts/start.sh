#!/bin/sh
# Startup script that initializes DB, starts service, and seeds users

echo "🚀 Starting auth-service..."

# Step 1: Setup database schema
echo "📊 Setting up database..."
./scripts/setup-db.sh
if [ $? -ne 0 ]; then
  echo "❌ Database setup failed! Cannot start service."
  exit 1
fi

# Step 2: Start the service in background using standalone server
echo "🔧 Starting auth-service in background..."
PORT=3001 node server.js &
SERVER_PID=$!

# Step 3: Wait for service to be ready
echo "⏳ Waiting for auth-service to be ready..."
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if wget --no-verbose --tries=1 --spider http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Auth-service is ready!"
    break
  fi
  attempt=$((attempt + 1))
  if [ $((attempt % 10)) -eq 0 ]; then
    echo "   Still waiting... ($attempt/$max_attempts)"
  fi
  sleep 1
done

if [ $attempt -eq $max_attempts ]; then
  echo "⚠️  Auth-service did not start in time, but continuing..."
else
  # Step 4: Setup production admin user (if credentials provided)
  if [ "${NODE_ENV}" = "production" ] || [ "${SPRING_PROFILES_ACTIVE}" = "prod" ] || [ "${SPRING_PROFILES_ACTIVE}" = "production" ]; then
    echo "🔐 Setting up production admin user..."
    ./scripts/setup-admin.sh
    if [ $? -ne 0 ]; then
      echo "⚠️  Admin setup encountered an issue, but continuing..."
    fi
  fi
  
  # Step 5: Seed users now that service is ready (development only)
  # SECURITY: Seeding is disabled in production - see seed-users.sh for details
  if [ "${NODE_ENV}" = "production" ] || [ "${SPRING_PROFILES_ACTIVE}" = "prod" ] || [ "${SPRING_PROFILES_ACTIVE}" = "production" ]; then
    echo "⏭️  Skipping user seeding (production mode)"
    echo "   To create admin accounts: use ADMIN_EMAIL/ADMIN_PASSWORD env vars"
  else
    echo "🌱 Seeding users..."
    ./scripts/seed-users.sh
    if [ $? -ne 0 ]; then
      echo "⚠️  User seeding failed. Test users may not be available."
      echo "   You can create test users manually via the signup page"
    fi
  fi
fi

# Step 6: Keep service running in foreground
echo "✅ Setup complete!"
if [ "${NODE_ENV}" != "production" ] && [ "${SPRING_PROFILES_ACTIVE}" != "prod" ] && [ "${SPRING_PROFILES_ACTIVE}" != "production" ]; then
  echo "📝 Admin credentials available:"
  echo "   Email:    admin@portfolio.com"
  echo "   Password: admin123"
  echo "   Role:     ADMIN"
  echo ""
  echo "🔐 IMPORTANT: Change this password after first login!"
  echo ""
fi
echo "🔧 Auth-service is running..."

# Wait for server process to keep container alive
wait $SERVER_PID

