import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@repo/auth/middleware";
import AuthCard from "../../components/auth/auth-card";
import SignInForm from "../../components/auth/sign-in-form";

export default async function SignInPage() {
  // Server-side session check — redirect if already logged in
  const session = await getServerSession(await headers());
  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to your account to continue"
    >
      <SignInForm />
    </AuthCard>
  );
}
