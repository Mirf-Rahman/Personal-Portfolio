// Better Auth catch-all handler at /api/ba/* 
// This path has no sibling routes, avoiding the Next.js App Router conflict
// where catch-all routes don't match when specific sibling routes exist.
// The middleware rewrites /api/auth/* (non-custom) requests to /api/ba/*
export { GET, POST } from "@/app/api/auth/[...all]/route";
