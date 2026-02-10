#!/bin/sh
# Production admin user setup script
# Creates a secure admin user from ADMIN_EMAIL and ADMIN_PASSWORD environment variables
# This script is ONLY intended for production use to create the initial admin account

echo "🔐 Production Admin Setup Script"

# Check if we're in production
if [ "${NODE_ENV}" != "production" ]; then
  echo "⏭️  Skipping admin setup (not in production mode)"
  exit 0
fi

# Check if admin credentials are provided
if [ -z "${ADMIN_EMAIL}" ] || [ -z "${ADMIN_PASSWORD}" ]; then
  echo "⏭️  Skipping admin setup (ADMIN_EMAIL or ADMIN_PASSWORD not set)"
  echo "   To create an admin user in production:"
  echo "   1. Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables"
  echo "   2. Redeploy the application"
  exit 0
fi

# Validate DATABASE_URL is set
if [ -z "${DATABASE_URL}" ]; then
  echo "❌ ERROR: DATABASE_URL is required"
  exit 1
fi

# Helper function to escape SQL strings
escape_sql_string() {
  echo "$1" | sed "s/'/''/g"
}

# Helper function to truncate email for logging
truncate_email() {
  local email="$1"
  local local_part="${email%%@*}"
  local domain="${email#*@}"
  if [ -z "$domain" ] || [ "$domain" = "$email" ]; then
    echo "***@***"
  else
    local prefix="${local_part:0:3}"
    echo "${prefix}***@${domain}"
  fi
}

# Normalize and escape admin email
admin_email_lower=$(echo "${ADMIN_EMAIL}" | tr '[:upper:]' '[:lower:]')
admin_email_escaped=$(escape_sql_string "$admin_email_lower")
truncated_email=$(truncate_email "$ADMIN_EMAIL")

echo "Checking if admin user exists: $truncated_email"

# Check if admin user already exists
existing_user=$(psql "$DATABASE_URL" -t -c "SELECT id FROM \"user\" WHERE LOWER(email) = LOWER('$admin_email_escaped');" 2>&1)
psql_exit_code=$?

if [ $psql_exit_code -ne 0 ]; then
  echo "❌ Failed to check if admin exists: $existing_user"
  exit 1
fi

existing_user_id=$(echo "$existing_user" | tr -d ' \n')

if [ -n "$existing_user_id" ]; then
  echo "✅ Admin user already exists ($truncated_email)"
  
  # Ensure user has admin role and email is verified
  echo "   Ensuring admin role and email verification..."
  update_result=$(psql "$DATABASE_URL" -c "UPDATE \"user\" SET role = 'ADMIN', \"emailVerified\" = true, \"updatedAt\" = NOW() WHERE LOWER(email) = LOWER('$admin_email_escaped');" 2>&1)
  if [ $? -ne 0 ]; then
    echo "⚠️  Warning: Failed to update admin user: $update_result"
  else
    echo "   ✅ Admin role and verification confirmed"
  fi
  
  # Clear any failed login attempts
  clear_result=$(psql "$DATABASE_URL" -c "DELETE FROM login_attempt WHERE LOWER(email) = LOWER('$admin_email_escaped') AND success = false;" 2>&1)
  if [ $? -eq 0 ]; then
    echo "   ✅ Cleared any failed login attempts"
  fi
  
  exit 0
fi

echo "📝 Creating admin user: $truncated_email"

# Determine auth service URL
# Try localhost first (same container), then service name (different container)
AUTH_URL=""
if wget --no-verbose --tries=1 --spider http://localhost:3001/api/health > /dev/null 2>&1; then
  AUTH_URL="http://localhost:3001"
elif wget --no-verbose --tries=1 --spider http://auth-service:3001/api/health > /dev/null 2>&1; then
  AUTH_URL="http://auth-service:3001"
else
  echo "❌ ERROR: Auth service is not ready"
  exit 1
fi

echo "   Using auth service at: $AUTH_URL"

# Create user via signup API
SIGNUP_URL="${AUTH_URL}/api/auth/sign-up/email"
response=$(wget --quiet --output-document=- --server-response \
  --post-data="email=${ADMIN_EMAIL}&password=${ADMIN_PASSWORD}&name=Admin" \
  --header="Content-Type: application/x-www-form-urlencoded" \
  "$SIGNUP_URL" 2>&1)

# Extract HTTP status code
http_status=$(echo "$response" | grep 'HTTP/' | tail -1 | awk '{print $2}')

if [ -z "$http_status" ]; then
  echo "❌ Failed to create admin user (no HTTP response)"
  echo "   Response: $response"
  exit 1
fi

if [ "$http_status" != "200" ] && [ "$http_status" != "201" ]; then
  echo "❌ Failed to create admin user (HTTP $http_status)"
  echo "   This might mean:"
  echo "   - Password doesn't meet requirements (min 8 characters)"
  echo "   - Email is invalid"
  echo "   - Auth service error"
  exit 1
fi

echo "   ✅ User created successfully"

# Update user role to ADMIN and verify email
echo "   Setting admin role and verifying email..."
update_result=$(psql "$DATABASE_URL" -c "UPDATE \"user\" SET role = 'ADMIN', \"emailVerified\" = true, \"updatedAt\" = NOW() WHERE LOWER(email) = LOWER('$admin_email_escaped');" 2>&1)
if [ $? -ne 0 ]; then
  echo "❌ Failed to set admin role: $update_result"
  exit 1
fi

echo "   ✅ Admin role set"
echo "   ✅ Email verified"

# Clear any failed login attempts
clear_result=$(psql "$DATABASE_URL" -c "DELETE FROM login_attempt WHERE LOWER(email) = LOWER('$admin_email_escaped') AND success = false;" 2>&1)
if [ $? -eq 0 ]; then
  echo "   ✅ Cleared any failed login attempts"
fi

echo "✅ Admin user setup complete: $truncated_email"
echo ""
echo "🔐 You can now log in with your admin credentials at:"
echo "   ${FRONTEND_URL:-https://www.mirf-portfolio.tech}/login"
echo ""

exit 0
