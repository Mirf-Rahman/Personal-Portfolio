#!/bin/sh
set -e

echo "🚀 Starting backend initialization..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
until pg_isready -h ${POSTGRES_HOST} -U ${POSTGRES_USER} -d ${POSTGRES_DB}; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"

# Run Drizzle schema push to sync tables
echo "📦 Syncing database schema..."
npx drizzle-kit push --config=./drizzle.config.ts || {
  echo "⚠️  Schema push failed or no changes needed, continuing..."
}

# Run seed script
echo "🌱 Running seed script..."
npm run db:seed || {
  echo "⚠️  Seed failed, continuing to start server..."
}

echo "✅ Backend initialization complete!"

# Start the application
echo "🎬 Starting Next.js server..."
exec npm start
