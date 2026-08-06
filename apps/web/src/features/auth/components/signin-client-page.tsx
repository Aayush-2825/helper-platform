"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chrome, Lock, Sparkles } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { showFormError } from "@/lib/ui/form-feedback";
import { signInSchema, type SignInFormValues } from "@/lib/validation/auth";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@repo/ui/components/ui/field";
import { Input } from "@repo/ui/components/ui/input";

interface SignInClientPageProps {
  nextPath?: string;
}

export function SignInClientPage({ nextPath }: SignInClientPageProps) {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const callbackURL = nextPath && nextPath.startsWith("/") ? nextPath : "/dashboard";

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const isLoading = form.formState.isSubmitting || googleLoading;

  const handleEmailSignIn = form.handleSubmit(async (values) => {
    setFormError("");

    try {
      const { error: signInError } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        callbackURL,
      });

      if (signInError) {
        setFormError(showFormError("Sign-in failed", signInError, "Unable to sign in."));
        return;
      }

      router.push(callbackURL);
    } catch (error) {
      setFormError(showFormError("Sign-in failed", error, "An unexpected error occurred."));
    }
  });

  const handleGoogleSignIn = async () => {
    setFormError("");
    setGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });
    } catch (error) {
      setFormError(showFormError("Google sign-in failed", error, "Google sign-in failed."));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">Sign in to continue booking trusted services</p>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleEmailSignIn} noValidate aria-busy={isLoading}>
              <FieldGroup>
                {formError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Sign-in failed</AlertTitle>
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                ) : null}

                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        aria-invalid={fieldState.invalid}
                        className="h-11"
                      />
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />

                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="password"
                        autoComplete="current-password"
                        placeholder="********"
                        aria-invalid={fieldState.invalid}
                        className="h-11"
                      />
                      {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                    </Field>
                  )}
                />

                <div className="flex justify-end">
                  <Link href="/auth/forgot-password" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                  {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
                </Button>

                <FieldSeparator className="my-6" />

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full gap-2"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <Chrome className="h-4 w-4" />
                  Continue with Google
                </Button>
              </FieldGroup>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col items-center gap-4 pt-6">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="font-medium text-primary hover:underline">
                Sign up for free
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
