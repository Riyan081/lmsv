/**
 * Client-side API base URL.
 * Falls back to localhost:3001 for local development.
 * Set NEXT_PUBLIC_API_URL in .env.local to change.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
