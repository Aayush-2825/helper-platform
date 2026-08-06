"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chrome, Sparkles } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { showFormError } from "@/lib/ui/form-feedback";
import { signUpSchema, type SignUpFormValues } from "@/lib/validation/auth";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@repo/ui/components/ui/field";
import { Input } from "@repo/ui/components/ui/input";

export function SignUpClientPage() {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isLoading = form.formState.isSubmitting || googleLoading;

  const handleEmailSignUp = form.handleSubmit(async (values) => {
    setFormError("");

    try {
      const { error: signUpError } = await authClient.signUp.email({
        email: values.email,
        password: values.password,
        name: values.name,
        callbackURL: "/auth/verify-email",
      });

      if (signUpError) {
        setFormError(showFormError("Sign-up failed", signUpError, "Unable to create account."));
        return;
      }

      router.push("/auth/check-email");
    } catch (error) {
      setFormError(showFormError("Sign-up failed", error, "An unexpected error occurred."));
    }
  });

  const handleGoogleSignUp = async () => {
    setFormError("");
    setGoogleLoading(true);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (error) {
      setFormError(showFormError("Google sign-up failed", error, "Google sign-up failed."));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground">Book services quickly and manage orders in one place</p>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Sign up</CardTitle>
            <CardDescription>Enter your details to get started</CardDescription>
          </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleEmailSignUp} noValidate aria-busy={isLoading}>
            <FieldGroup>
              {formError ? (
                <Alert variant="destructive">
                  <AlertTitle>Sign-up failed</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="name"
                      placeholder="John Doe"
                      aria-invalid={fieldState.invalid}
                      className="h-11"
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

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
                      autoComplete="new-password"
                      placeholder="********"
                      aria-invalid={fieldState.invalid}
                      className="h-11"
                    />
                    <FieldDescription>At least 8 characters.</FieldDescription>
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="password"
                      autoComplete="new-password"
                      placeholder="********"
                      aria-invalid={fieldState.invalid}
                      className="h-11"
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                {form.formState.isSubmitting ? "Creating account..." : "Sign up"}
              </Button>

              <FieldSeparator className="my-6" />

              <Button
                type="button"
                variant="outline"
                className="h-11 w-full gap-2"
                onClick={handleGoogleSignUp}
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
            Already have an account?{" "}
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        By signing up, you agree to our{" "}
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
