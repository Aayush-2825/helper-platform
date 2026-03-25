import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { MailCheck } from "lucide-react";
import { auth } from "@/lib/auth/server";
import { getHomeRouteForRole } from "@/lib/auth/roles";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default async function CheckEmailPage() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect(getHomeRouteForRole((session.user as { role?: string }).role));
  }

  return (
    <div className="auth-shell">
      <Card className="surface-card-strong gradient-outline reveal-up w-full max-w-md border-none">
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            Verification required
          </Badge>
          <CardTitle>Check your email</CardTitle>
          <CardDescription>We sent a verification link to your inbox.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex justify-center rounded-xl bg-secondary/60 p-4">
            <MailCheck className="text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Click the link in your email to activate your account. If you cannot find it, check your spam folder and
            try again.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/auth/signin" className={buttonVariants({ className: "w-full" })}>
            Back to sign in
          </Link>
          <Link href="/auth/signup" className={buttonVariants({ variant: "outline", className: "w-full" })}>
            Sign up again
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
