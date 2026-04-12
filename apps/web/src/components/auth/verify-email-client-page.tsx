"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
        <Card className="surface-card-strong gradient-outline reveal-up w-full max-w-md border-none">
          <CardHeader>
            <Badge variant="secondary" className="w-fit">
              Email verification
            </Badge>
            <CardTitle>Verifying your email</CardTitle>
            <CardDescription>Please wait while we verify your account.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6">
            <LoaderCircle className="animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="auth-shell">
        <Card className="surface-card-strong gradient-outline reveal-up w-full max-w-md border-none">
          <CardHeader>
            <Badge variant="secondary" className="w-fit">
              Verified
            </Badge>
            <CardTitle>Email verified</CardTitle>
            <CardDescription>Your email is confirmed. Redirecting to dashboard...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <CheckCircle2 className="text-primary" />
          </CardContent>
          <CardFooter>
            <Link href="/dashboard" className={buttonVariants({ className: "w-full" })}>
              Go to dashboard
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <Card className="surface-card-strong gradient-outline reveal-up w-full max-w-md border-none">
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            Verification failed
          </Badge>
          <CardTitle>Verification link expired</CardTitle>
          <CardDescription>This link is invalid or expired. Please request another verification flow.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <XCircle className="text-destructive" />
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Link href="/auth/signup" className={buttonVariants({ className: "w-full" })}>
            Sign up again
          </Link>
          <Link href="/auth/signin" className={buttonVariants({ variant: "outline", className: "w-full" })}>
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
