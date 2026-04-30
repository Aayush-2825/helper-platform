import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/lib/auth/server";
import HelperVerificationClientPage from "./verification-client";

export default async function HelperVerificationPage() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/signin?next=%2Fhelper%2Fverification");
  }

  return <HelperVerificationClientPage />;
}
