import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "@repo/auth/middleware";

/**
 * Sign-up page is disabled — in a real LMS, only admins create accounts.
 * Redirect anyone hitting /sign-up to /sign-in.
 */
export default async function SignUpPage() {
  const session = await getServerSession(await headers());
  if (session) {
    redirect("/dashboard");
  }
  redirect("/sign-in");
}
