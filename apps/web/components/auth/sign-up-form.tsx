"use client";

import { useState } from "react";
import { authClient } from "@repo/auth/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await authClient.signUp.email(
      { email, password, name: email.split("@")[0] ?? email },
      {
        onSuccess: () => {
          router.push("/dashboard");
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Failed to sign up");
          setLoading(false);
        },
      }
    );
  };

  const inputClass = "w-full px-4 py-3 rounded-xl text-sm border bg-white/5 outline-none focus:border-purple-500/50 focus:bg-white/[0.08] transition-all placeholder:text-gray-600";

  return (
    <>
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm bg-red-500/10 border border-red-500/20 text-red-300">
          <span>⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleEmailSignUp}>
        <div className="mb-5">
          <label className="block text-xs font-medium mb-2" htmlFor="signup-email" style={{ color: "var(--color-text-secondary)" }}>
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            className={inputClass}
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-5">
          <label className="block text-xs font-medium mb-2" htmlFor="signup-password" style={{ color: "var(--color-text-secondary)" }}>
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            className={inputClass}
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          className="w-full btn-gradient py-3"
          disabled={loading}
          id="signup-submit-btn"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Sign Up"
          )}
        </button>
      </form>

      <div className="text-center mt-6 text-sm" style={{ color: "var(--color-text-secondary)" }}>
        Already have an account?{" "}
        <Link href="/sign-in" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
          Sign in
        </Link>
      </div>
    </>
  );
}
