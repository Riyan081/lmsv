import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, twoFactor, bearer, openAPI } from "better-auth/plugins";
import prisma from "@repo/db/client";

/**
 * Core Better Auth server configuration.
 *
 * This is the shared auth instance used by both the Express API (apps/https)
 * and the Next.js frontend (apps/web). Each app mounts this via its own
 * route handler (toNodeHandler / toNextJsHandler).
 *
 * Roles: "user" (default), "premium", "admin"
 */
export const auth = betterAuth({
  // ─── Database ────────────────────────────────────────────────
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // ─── App Identity ────────────────────────────────────────────
  appName: "Todo App",

  // ─── Trusted Origins (CSRF whitelist) ────────────────────────
  trustedOrigins: process.env.TRUSTED_ORIGINS
    ? process.env.TRUSTED_ORIGINS.split(",")
    : ["http://localhost:3000", "http://localhost:3001"],

  // ─── Email & Password ───────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 256,
    // Revoke all sessions when a user resets their password
    revokeSessionsOnPasswordReset: true,
    // Password reset flow — mock email (console.log) for dev
    sendResetPassword: async ({ user, url, token }, request) => {
      console.log("──────────────────────────────────────────────");
      console.log("📧 PASSWORD RESET EMAIL");
      console.log(`   To: ${user.email}`);
      console.log(`   URL: ${url}`);
      console.log("──────────────────────────────────────────────");
    },
  },

  // ─── Email Verification ──────────────────────────────────────
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      console.log("──────────────────────────────────────────────");
      console.log("📧 EMAIL VERIFICATION");
      console.log(`   To: ${user.email}`);
      console.log(`   URL: ${url}`);
      console.log("──────────────────────────────────────────────");
    },
    sendOnSignUp: true,
  },

  // ─── Social Providers (OAuth) ────────────────────────────────
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  // ─── User Configuration ──────────────────────────────────────
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false, // Users cannot set their own role on sign-up
      },
    },
  },

  // ─── Session Security ────────────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // Refresh every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5-minute cache
      strategy: "jwe", // Encrypted session data in cookie
    },
  },

  // ─── OAuth Account Security ──────────────────────────────────
  account: {
    accountLinking: {
      enabled: true,
    },
    encryptOAuthTokens: true,
  },

  // ─── Rate Limiting ───────────────────────────────────────────
  rateLimit: {
    enabled: true,
    storage: "memory", // Use "secondary-storage" with Redis in production
    window: 60, // 1-minute window
    max: 100, // General limit
    customRules: {
      "/api/auth/sign-in/email": { window: 60, max: 5 },
      "/api/auth/sign-up/email": { window: 60, max: 3 },
      "/api/auth/forget-password": { window: 60, max: 3 },
    },
  },

  // ─── Plugins ─────────────────────────────────────────────────
  plugins: [
    // Admin plugin — user management, banning, listing
    admin({
      defaultRole: "user",
    }),

    // Two-Factor Authentication — TOTP + backup codes
    twoFactor({
      issuer: "Todo App",
      totpOptions: {
        digits: 6,
        period: 30,
      },
      backupCodeOptions: {
        amount: 10,
        length: 10,
        storeBackupCodes: "encrypted",
      },
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          console.log("──────────────────────────────────────────────");
          console.log("🔑 2FA OTP CODE");
          console.log(`   To: ${user.email}`);
          console.log(`   Code: ${otp}`);
          console.log("──────────────────────────────────────────────");
        },
        storeOTP: "encrypted",
      },
    }),

    // Bearer token auth for API access
    bearer(),

    // Auto-generated OpenAPI docs
    openAPI(),
  ],

  // ─── Advanced Security ───────────────────────────────────────
  advanced: {
    // Force secure cookies (in production)
    useSecureCookies: process.env.NODE_ENV === "production",
    // Custom cookie prefix
    cookiePrefix: "todo-app",
    // Default cookie attributes
    defaultCookieAttributes: {
      sameSite: "lax",
    },
    // IP tracking for rate limiting & audit
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },

  // ─── Database Hooks (Audit Logging) ──────────────────────────
  databaseHooks: {
    session: {
      create: {
        after: async (hookData: any) => {
          const data = hookData.data;
          const ctx = hookData.ctx;
          const ip = ctx?.request?.headers?.get?.("x-forwarded-for") ?? "unknown";
          const ua = ctx?.request?.headers?.get?.("user-agent") ?? "unknown";
          console.log(
            `[AUDIT] Session created: userId=${data?.userId}, ip=${ip}, ua=${String(ua).substring(0, 50)}`
          );
        },
      },
    },
    user: {
      update: {
        after: async (hookData: any) => {
          const data = hookData.data;
          const oldData = hookData.oldData;
          if (oldData?.email && oldData.email !== data?.email) {
            console.log(
              `[AUDIT] Email changed: userId=${data?.id}, old=${oldData.email}, new=${data?.email}`
            );
          }
        },
      },
    },
    account: {
      create: {
        after: async (hookData: any) => {
          const data = hookData.data;
          console.log(
            `[AUDIT] Account linked: userId=${data?.userId}, provider=${data?.providerId}`
          );
        },
      },
    },
  },
});

// ─── Type Exports ────────────────────────────────────────────────
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
