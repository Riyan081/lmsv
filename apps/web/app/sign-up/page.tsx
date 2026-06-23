import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@repo/auth/middleware";
import AuthCard from "../../components/auth/auth-card";
import SignUpForm from "../../components/auth/sign-up-form";

export default async function SignUpPage() {
  // Server-side session check — redirect if already logged in
  const session = await getServerSession(await headers());
  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthCard
      title="Create an account"
      subtitle="Get started with Todo App today"
    >
      <SignUpForm />
    </AuthCard>
  );
}
