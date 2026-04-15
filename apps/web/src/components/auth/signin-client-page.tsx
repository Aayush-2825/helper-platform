"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chrome } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { showFormError } from "@/lib/ui/form-feedback";
import { signInSchema, type SignInFormValues } from "@/lib/validation/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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
      <Card className="surface-card-strong gradient-outline reveal-up w-full max-w-md border-none">
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            Welcome back
          </Badge>
          <CardTitle>Sign in to your account</CardTitle>
          <CardDescription>Continue booking trusted services for your home or business.</CardDescription>
        </CardHeader>

        <CardContent>
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
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <div className="flex justify-end">
                <Link href="/auth/forgot-password" className="text-sm text-primary underline-offset-4 hover:underline">
                  Forgot your password?
                </Link>
              </div>

              <Button type="submit" className="min-h-11 w-full" disabled={isLoading}>
                {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
              </Button>

              <FieldSeparator>Or continue with</FieldSeparator>

              <Button type="button" variant="outline" className="min-h-11 w-full" onClick={handleGoogleSignIn} disabled={isLoading}>
                <Chrome data-icon="inline-start" />
                Continue with Google
              </Button>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
