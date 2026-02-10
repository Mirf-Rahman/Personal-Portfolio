#!/bin/sh
set -e

echo "🚀 Starting backend initialization..."

# Wait for database to be ready
echo "⏳ Waiting for database..."

# Check if DATABASE_URL is set (production) or use individual vars (development)
if [ -n "$DATABASE_URL" ]; then
  echo "Using DATABASE_URL for connection"
  # Use DATABASE_URL directly with psql for connection check
  max_attempts=30
  attempt=0
  while [ $attempt -lt $max_attempts ]; do
    if psql "$DATABASE_URL" -c "SELECT 1" > /dev/null 2>&1; then
      echo "✅ Database is ready!"
      break
    fi
    attempt=$((attempt + 1))
    echo "Database is unavailable - sleeping ($attempt/$max_attempts)"
    sleep 2
  done
  
  if [ $attempt -eq $max_attempts ]; then
    echo "❌ Database connection failed after $max_attempts attempts"
    exit 1
  fi
else
  echo "Using individual environment variables for connection"
  # Build connection for local Docker development
  until pg_isready -h "${POSTGRES_HOST:-app-db}" -U "${POSTGRES_USER:-app_user}" -d "${POSTGRES_DB:-portfolio_app}"; do
    echo "Database is unavailable - sleeping"
    sleep 2
  done
  echo "✅ Database is ready!"
fi

# Run Drizzle schema push to sync tables
echo "📦 Syncing database schema..."
npx drizzle-kit push --config=./drizzle.config.ts || {
  echo "⚠️  Schema push failed or no changes needed, continuing..."
}

# Run seed script (with production optimization)
if [ "${NODE_ENV}" = "production" ]; then
  echo "🌱 Checking if database needs seeding..."
  # Check if skills table has data (quick production check)
  if [ -n "$DATABASE_URL" ]; then
    data_count=$(psql "$DATABASE_URL" -t -c "SELECT COUNT(*) FROM skills;" 2>/dev/null | tr -d ' ')
    if [ -n "$data_count" ] && [ "$data_count" -gt 0 ]; then
      echo "✅ Database already seeded (found $data_count skills), skipping..."
    else
      echo "🌱 Running initial seed..."
      npm run db:seed || {
        echo "⚠️  Seed failed, continuing to start server..."
      }
    fi
  else
    echo "⚠️  DATABASE_URL not set in production, skipping seed check"
    npm run db:seed || {
      echo "⚠️  Seed failed, continuing to start server..."
    }
  fi
else
  # Development: always run seed (idempotent anyway)
  echo "🌱 Running seed script..."
  npm run db:seed || {
    echo "⚠️  Seed failed, continuing to start server..."
  }
fi

echo "✅ Backend initialization complete!"

# Start the application
echo "🎬 Starting Next.js server..."
exec npm start
