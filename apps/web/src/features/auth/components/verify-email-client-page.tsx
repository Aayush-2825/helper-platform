"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, LoaderCircle, XCircle, Mail } from "lucide-react";
import { buttonVariants } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";

export function VerifyEmailClientPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    const timer = setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  if (status === "verifying") {
    return (
      <div className="auth-shell">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
              <LoaderCircle className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Verifying your email</h1>
            <p className="text-muted-foreground">Please wait while we verify your account</p>
          </div>

          <Card className="border-border/60 shadow-lg">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">Verifying email address...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="auth-shell">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Email verified</h1>
            <p className="text-muted-foreground">Your email is confirmed successfully</p>
          </div>

          <Card className="border-border/60 shadow-lg">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">Redirecting to dashboard...</p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Link href="/dashboard" className={buttonVariants({ className: "h-11 w-full" })}>
                Go to dashboard
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5">
            <XCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Verification failed</h1>
          <p className="text-muted-foreground">This link is invalid or expired</p>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">Please request another verification flow</p>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Link href="/auth/signup" className={buttonVariants({ className: "h-11 w-full" })}>
              Sign up again
            </Link>
            <Link href="/auth/signin" className={buttonVariants({ variant: "outline", className: "h-11 w-full" })}>
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
