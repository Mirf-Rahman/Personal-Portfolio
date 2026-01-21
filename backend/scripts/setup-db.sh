#!/bin/sh
# Database initialization script for portfolio backend

set -e

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h "${POSTGRES_HOST:-app-db}" -U "${POSTGRES_USER:-app_user}" -d "${POSTGRES_DB:-portfolio_app}"; do
  echo "Database is not ready yet. Waiting..."
  sleep 2
done
echo "Database is ready!"

# Run Drizzle migrations
echo "Running database migrations..."
npm run db:push

echo "Database initialization complete!"
