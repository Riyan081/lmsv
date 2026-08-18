"use client";

import { useState } from "react";
import { authClient } from "@repo/auth/client";
import { useRouter } from "next/navigation";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Invalid email or password");
          setLoading(false);
        },
      }
    );
  };

  return (
    <>
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm bg-red-500/10 border border-red-500/20 text-red-300">
          <span>⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleEmailSignIn}>
        <div className="mb-5">
          <label className="block text-xs font-medium mb-2" htmlFor="signin-email" style={{ color: "var(--color-text-secondary)" }}>
            Email
          </label>
          <input
            id="signin-email"
            type="email"
            className="w-full px-4 py-3 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 focus:bg-white/[0.08] transition-all placeholder:text-gray-600"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-5">
          <label className="block text-xs font-medium mb-2" htmlFor="signin-password" style={{ color: "var(--color-text-secondary)" }}>
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            className="w-full px-4 py-3 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 focus:bg-white/[0.08] transition-all placeholder:text-gray-600"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full btn-gradient py-3"
          disabled={loading}
          id="signin-submit-btn"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <div className="text-center mt-6 text-xs px-4 py-3 rounded-xl" style={{ color: "var(--color-text-muted)", background: "var(--color-bg-secondary)" }}>
        Accounts are created by your institution&apos;s administrator. Contact your admin if you don&apos;t have credentials.
      </div>
    </>
  );
}
