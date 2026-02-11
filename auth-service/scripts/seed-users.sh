#!/bin/sh
# Seed test users using Better Auth's signup API
# This ensures passwords are properly hashed
#
# SECURITY: This script is DISABLED in production to prevent unauthorized access
# with default credentials. DO NOT run this in production environments.

# Check if running in production environment
if [ "${NODE_ENV}" = "production" ] || [ "${SPRING_PROFILES_ACTIVE}" = "prod" ] || [ "${SPRING_PROFILES_ACTIVE}" = "production" ]; then
  echo "❌ ERROR: User seeding is DISABLED in production for security reasons."
  echo "   This script creates accounts with known passwords (admin@test.com / password123)."
  echo "   To create admin accounts in production:"
  echo "   1. Sign up normally at your production site"
  echo "   2. Connect to the auth database"
  echo "   3. Run: UPDATE \"user\" SET role = 'admin' WHERE email = 'your-email@example.com';"
  exit 1
fi

# Additional safeguard: Check for production-like environment indicators
if [ -n "${DATABASE_URL}" ] && echo "${DATABASE_URL}" | grep -q "digitalocean\|amazonaws\|azure"; then
  echo "⚠️  WARNING: Detected production-like database URL. Seeding is disabled."
  echo "   If this is a development environment, set NODE_ENV=development explicitly."
  exit 1
fi

echo "🌱 Seeding test users..."

# Use DATABASE_URL for psql when set (e.g. local dev: postgres://auth_user:auth_pass@localhost:5434/auth_db)
# Otherwise use -h auth-db (Docker)
if [ -n "${DATABASE_URL}" ]; then
  USE_DATABASE_URL=1
  echo "   Using DATABASE_URL for database connection"
else
  USE_DATABASE_URL=0
  echo "   Using auth-db host (Docker)"
fi

# Validate required environment variables when not using DATABASE_URL
if [ "$USE_DATABASE_URL" = "0" ] && { [ -z "${POSTGRES_USER}" ] || [ -z "${POSTGRES_DB}" ] || [ -z "${POSTGRES_PASSWORD}" ]; }; then
  echo "⚠️  Warning: Some database environment variables are not set, using defaults"
  echo "   POSTGRES_USER=${POSTGRES_USER:-auth_user}"
  echo "   POSTGRES_DB=${POSTGRES_DB:-auth_db}"
  echo "   POSTGRES_PASSWORD is set: $([ -n "${POSTGRES_PASSWORD}" ] && echo "yes" || echo "no")"
fi

# Wait for auth-service to be ready
# Try localhost first (when running in same container), then try service name (when running separately)
echo "Waiting for auth-service to be ready..."
max_attempts=60
attempt=0
AUTH_URL=""
while [ $attempt -lt $max_attempts ]; do
  # Try 127.0.0.1 first (same container; avoid IPv6 localhost)
  if wget --no-verbose --tries=1 --spider http://127.0.0.1:3001/api/health > /dev/null 2>&1; then
    AUTH_URL="http://127.0.0.1:3001"
    echo "Auth service is ready (localhost)!"
    break
  fi
  # Try service name (different container)
  if wget --no-verbose --tries=1 --spider http://auth-service:3001/api/health > /dev/null 2>&1; then
    AUTH_URL="http://auth-service:3001"
    echo "Auth service is ready (service name)!"
    break
  fi
  attempt=$((attempt + 1))
  echo "Waiting for auth-service... ($attempt/$max_attempts)"
  sleep 1
done

if [ $attempt -eq $max_attempts ]; then
  echo "⚠️  Auth service not ready, skipping user seeding"
  echo "   You can create test users manually via the signup page"
  exit 0
fi

# Helper function to normalize and escape strings for SQL
# Takes a string, lowercases it, and escapes single quotes by doubling them
escape_sql_string() {
  echo "$1" | tr '[:upper:]' '[:lower:]' | sed "s/'/''/g"
}

# Helper function to escape SQL strings without lowercasing
# Used for roles and other values that must preserve case
escape_sql_string_preserve_case() {
  echo "$1" | sed "s/'/''/g"
}

# Run psql with either DATABASE_URL or auth-db connection
run_psql() {
  if [ "$USE_DATABASE_URL" = "1" ]; then
    psql "$DATABASE_URL" "$@"
  else
    PGPASSWORD=${POSTGRES_PASSWORD:-auth_pass} psql -h auth-db -U ${POSTGRES_USER:-auth_user} -d ${POSTGRES_DB:-auth_db} "$@"
  fi
}

# Helper function to update user in database
# Uses proper SQL escaping for variables
update_user_in_db() {
  local email_lower="$1"
  local role_escaped="$2"
  
  run_psql -c "UPDATE \"user\" SET role = '$role_escaped', \"emailVerified\" = true, \"updatedAt\" = NOW() WHERE LOWER(email) = LOWER('$email_lower');" \
    || { echo "   ❌ Failed to update user in database" >&2; return 1; }
  
  run_psql -c "DELETE FROM login_attempt WHERE LOWER(email) = LOWER('$email_lower') AND success = false;" \
    || { echo "   ❌ Failed to clear login attempts" >&2; return 1; }
}

# Function to create user via signup API and set role
create_user() {
  email=$1
  password=$2
  name=$3
  role=$4
  
  echo "Creating user: $email"
  
  # Normalize and escape email (lowercase is fine for email)
  email_lower=$(escape_sql_string "$email")
  # Escape role preserving case (backend expects uppercase roles like "ADMIN")
  role_escaped=$(escape_sql_string_preserve_case "$role")
  
  # Check if user already exists (using psql with proper escaping)
  psql_output=$(run_psql -t -c "SELECT id FROM \"user\" WHERE LOWER(email) = LOWER('$email_lower');" 2>&1)
  psql_exit_code=$?
  if [ $psql_exit_code -ne 0 ]; then
    echo "   ❌ Failed to check if user exists: $psql_output" >&2
    return 1
  fi
  existing_user=$(echo "$psql_output" | tr -d ' ')
  
  if [ -n "$existing_user" ]; then
    echo "   ⏭️  User $email already exists, updating role, verifying email, and clearing lockout..."
    update_user_in_db "$email_lower" "$role_escaped" || return 1
    echo "   ✅ Updated role to: $role"
    echo "   ✅ Email verified"
    echo "   ✅ Account unlocked"
    return 0
  fi
  
  # Create user via signup API (Better Auth uses /sign-up/email endpoint)
  # Use AUTH_URL if set, otherwise default to auth-service
  SIGNUP_URL="${AUTH_URL:-http://auth-service:3001}/api/auth/sign-up/email"
  response=$(wget --quiet --output-document=- --server-response --post-data="email=$email&password=$password&name=$name" \
    --header="Content-Type: application/x-www-form-urlencoded" \
    "$SIGNUP_URL" 2>&1)
  
  # Extract HTTP status code (wget with --server-response outputs "HTTP/X.X XXX" lines)
  # Use POSIX-compliant extraction (no grep -P or bash string slicing)
  http_status=$(echo "$response" | grep 'HTTP/' | tail -1 | awk '{print $2}')
  
  # If extraction failed, log raw response for debugging
  if [ -z "$http_status" ]; then
    echo "   ❌ Failed to parse HTTP status from response"
    echo "   Raw response (first 500 chars):"
    echo "$response" | head -c 500
    return 1
  fi
  
  if [ "$http_status" != "200" ] && [ "$http_status" != "201" ]; then
    echo "   ❌ Failed to create $email (HTTP $http_status)"
    echo "   Response: $response"
    return 1
  else
    echo "   ✅ Created: $email"
    
    # Update role and verify email directly in database (bypassing admin API for dev seeding)
    update_user_in_db "$email_lower" "$role_escaped" || return 1
    if [ "$role" != "CUSTOMER" ]; then
      echo "   ✅ Set role to: $role"
    fi
    echo "   ✅ Email verified"
    echo "   ✅ Account unlocked"
    return 0
  fi
}

# Create portfolio admin user
create_user "admin@portfolio.com" "admin123" "Admin User" "ADMIN"

echo ""
echo "✅ User seeding complete!"
echo ""
echo "📝 Admin User Credentials:"
echo "   Email:    admin@portfolio.com"
echo "   Password: admin123"
echo "   Role:     ADMIN"
echo ""
echo "🔐 IMPORTANT: Change this password after first login!"
echo ""

