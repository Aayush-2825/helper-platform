"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { showFormError, showFormSuccess } from "@/lib/ui/form-feedback";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validation/auth";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Button, buttonVariants } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/ui/field";
import { Input } from "@repo/ui/components/ui/input";

export function ForgotPasswordClientPage() {
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setFormError("");

    try {
      const { error: resetError } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        setFormError(showFormError("Reset request failed", resetError, "Unable to send reset link."));
        return;
      }

      setSubmittedEmail(values.email);
      setSuccess(true);
      showFormSuccess("Reset link sent", `A password reset link was sent to ${values.email}.`);
    } catch (error) {
      setFormError(showFormError("Reset request failed", error, "An unexpected error occurred."));
    }
  });

  const isSubmitting = form.formState.isSubmitting;

  if (success) {
    return (
      <div className="auth-shell">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5">
              <KeyRound className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
            <p className="text-muted-foreground">We&apos;ve sent a password reset link to <strong>{submittedEmail}</strong></p>
          </div>

          <Card className="border-border/60 shadow-lg">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                The link expires in 30 minutes. If you don&apos;t see the email, check your spam folder.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Link href="/auth/signin" className={buttonVariants({ className: "h-11 w-full" })}>
                Back to sign in
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
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Reset your password</h1>
          <p className="text-muted-foreground">Enter your email address and we&apos;ll send you a reset link</p>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Forgot password</CardTitle>
            <CardDescription>We&apos;ll send you a link to reset your password</CardDescription>
          </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
            <FieldGroup>
              {formError ? (
                <Alert variant="destructive">
                  <AlertTitle>Reset request failed</AlertTitle>
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

              <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-4 pt-6">
          <Link href="/auth/signin" className="text-sm font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}
