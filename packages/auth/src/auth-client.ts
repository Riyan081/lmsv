import { createAuthClient } from "better-auth/react";
import { twoFactorClient } from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";

/**
 * Better Auth client for React / Next.js.
 *
 * This client is configured to talk to the auth API at the backend.
 * Import this in your frontend components.
 *
 * Usage:
 *   import { authClient } from "@repo/auth/client";
 *   const { data: session } = authClient.useSession();
 */
export const authClient = createAuthClient({
  // The base URL of the auth API.
  // In Next.js, this can be relative (same origin).
  // For cross-origin (e.g. Express backend), set the full URL.
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL || "http://localhost:3000",

  plugins: [
    // 2FA client plugin — redirects to /2fa when 2FA is required
    twoFactorClient({
      onTwoFactorRedirect() {
        if (typeof window !== "undefined") {
          window.location.href = "/2fa";
        }
      },
    }),

    // Admin client plugin — user management UI
    adminClient(),
  ],
});
