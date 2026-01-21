// Better Auth client for frontend authentication
import { createAuthClient } from "better-auth/react";

const AUTH_SERVICE_URL = 
  typeof window !== 'undefined' 
    ? process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001'
    : process.env.AUTH_SERVICE_URL || 'http://auth-service:3001';

export const authClient = createAuthClient({
  baseURL: AUTH_SERVICE_URL,
});

// Helper to check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await authClient.getSession();
    return !!session.data?.user;
  } catch {
    return false;
  }
}

// Helper to check if user is admin
export async function isAdmin(): Promise<boolean> {
  try {
    const session = await authClient.getSession();
    return (session.data?.user as any)?.role === 'ADMIN';
  } catch {
    return false;
  }
}

// Helper to get current user
export async function getCurrentUser() {
  try {
    const session = await authClient.getSession();
    return session.data?.user || null;
  } catch {
    return null;
  }
}
