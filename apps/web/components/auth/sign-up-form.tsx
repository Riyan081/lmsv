"use client";

import { useState } from "react";
import { authClient } from "@repo/auth/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SocialButtons from "./social-buttons";

export default function SignUpForm() {
  const [name, setName] = useState("");
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
      { email, password, name },
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

  const handleSocialSignUp = async (provider: "github" | "google") => {
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

      <form onSubmit={handleEmailSignUp}>
        <div className="form-group">
          <label className="form-label" htmlFor="signup-name">
            Full Name
          </label>
          <input
            id="signup-name"
            type="text"
            className="form-input"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="signup-email">
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            className="form-input"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="signup-password">
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          id="signup-submit-btn"
        >
          {loading ? <div className="spinner" /> : "Sign Up"}
        </button>
      </form>

      <div className="divider">
        <span className="divider-text">Or continue with</span>
      </div>

      <SocialButtons onSocialAuth={handleSocialSignUp} disabled={loading} />

      <div className="auth-footer">
        Already have an account? <Link href="/sign-in">Sign in</Link>
      </div>
    </>
  );
}
