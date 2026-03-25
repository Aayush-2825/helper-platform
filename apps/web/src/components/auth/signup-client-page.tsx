"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Chrome } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { showFormError } from "@/lib/ui/form-feedback";
import { signUpSchema, type SignUpFormValues } from "@/lib/validation/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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
      <Card className="surface-card-strong gradient-outline reveal-up w-full max-w-md border-none">
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>Book services quickly and manage orders in one place.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleEmailSignUp} noValidate>
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
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {form.formState.isSubmitting ? "Creating account..." : "Sign up"}
              </Button>

              <FieldSeparator>Or continue with</FieldSeparator>

              <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignUp} disabled={isLoading}>
                <Chrome data-icon="inline-start" />
                Continue with Google
              </Button>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
