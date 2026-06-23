"use client";

import { useState } from "react";
import { authClient } from "@repo/auth/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SocialButtons from "./social-buttons";

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

  const handleSocialSignIn = async (provider: "github" | "google") => {
    setLoading(true);
    await authClient.signIn.social({
      provider,
      callbackURL: "/dashboard",
    });
  };

  return (
    <>
      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      <form onSubmit={handleEmailSignIn}>
        <div className="form-group">
          <label className="form-label" htmlFor="signin-email">
            Email
          </label>
          <input
            id="signin-email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="signin-password">
            Password
          </label>
          <input
            id="signin-password"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          id="signin-submit-btn"
        >
          {loading ? <div className="spinner" /> : "Sign In"}
        </button>
      </form>

      <div className="divider">
        <span className="divider-text">Or continue with</span>
      </div>

      <SocialButtons onSocialAuth={handleSocialSignIn} disabled={loading} />

      <div className="auth-footer">
        Don&apos;t have an account? <Link href="/sign-up">Sign up</Link>
      </div>
    </>
  );
}
