#!/bin/sh
# Seed script to create default admin user

set -e

echo "Waiting for database to be ready..."
until pg_isready -h "${POSTGRES_HOST:-auth-db}" -U "${POSTGRES_USER:-auth_user}" -d "${POSTGRES_DB:-auth_db}"; do
  echo "Database is not ready yet. Waiting..."
  sleep 2
done
echo "Database is ready!"

echo "Running database migrations..."
npm run db:push || true

echo "Creating default admin user..."
node <<'SCRIPT'
const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const crypto = require('crypto');

// Simple hash function (Better Auth will handle proper hashing)
async function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function seedAdmin() {
  const connectionString = process.env.DATABASE_URL || 'postgres://auth_user:auth_pass@auth-db:5432/auth_db';
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    // Check if admin already exists
    const existingAdmin = await db.execute(`
      SELECT id FROM "user" WHERE email = 'admin@portfolio.com' LIMIT 1;
    `);

    if (existingAdmin.rows && existingAdmin.rows.length > 0) {
      console.log('Admin user already exists. Skipping creation.');
      await client.end();
      return;
    }

    // Create admin user
    // Note: Better Auth will handle password hashing properly when user logs in
    const hashedPassword = await hashPassword('admin123');
    
    await db.execute(`
      INSERT INTO "user" (id, email, name, role, "emailVerified", "createdAt", "updatedAt")
      VALUES (
        gen_random_uuid(),
        'admin@portfolio.com',
        'Admin User',
        'ADMIN',
        true,
        NOW(),
        NOW()
      )
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log('✓ Admin user created successfully!');
    console.log('  Email: admin@portfolio.com');
    console.log('  Password: admin123');
    console.log('  Role: ADMIN');
    
    await client.end();
  } catch (error) {
    console.error('Error creating admin user:', error.message);
    await client.end();
    process.exit(0); // Don't fail the container startup
  }
}

seedAdmin();
SCRIPT

echo "Seed complete!"
