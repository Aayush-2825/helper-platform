"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { showFormError, showFormSuccess } from "@/lib/ui/form-feedback";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/validation/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

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

  if (success) {
    return (
      <div className="auth-shell">
        <Card className="surface-card-strong gradient-outline reveal-up w-full max-w-md border-none">
          <CardHeader>
            <Badge variant="secondary" className="w-fit">
              Email sent
            </Badge>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We&apos;ve sent a password reset link to <strong>{submittedEmail}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The link expires in 30 minutes. If you don&apos;t see the email, check your spam folder.
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/auth/signin" className={buttonVariants({ className: "w-full" })}>
              Back to sign in
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
            Account recovery
          </Badge>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
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
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending..." : "Send reset link"}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <Link href="/auth/signin" className="text-sm text-primary underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
