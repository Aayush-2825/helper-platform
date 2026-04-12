"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { showFormError, showFormSuccess } from "@/lib/ui/form-feedback";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validation/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface ResetPasswordClientPageProps {
  token?: string;
}

export function ResetPasswordClientPage({ token }: ResetPasswordClientPageProps) {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setFormError("");

    if (!token) {
      setFormError("Invalid or missing reset token.");
      return;
    }

    try {
      const { error: resetError } = await authClient.resetPassword({
        token,
        newPassword: values.password,
      });

      if (resetError) {
        setFormError(showFormError("Password reset failed", resetError, "Failed to reset password."));
        return;
      }

      setSuccess(true);
      showFormSuccess("Password updated", "Your password was reset successfully.");
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (error) {
      setFormError(showFormError("Password reset failed", error, "An unexpected error occurred."));
    }
  });

  if (!token) {
    return (
      <div className="auth-shell">
        <Card className="surface-card-strong gradient-outline reveal-up w-full max-w-md border-none">
          <CardHeader>
            <Badge variant="secondary" className="w-fit">
              Invalid link
            </Badge>
            <CardTitle>Invalid token</CardTitle>
            <CardDescription>This password reset link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/auth/forgot-password" className={buttonVariants({ className: "w-full" })}>
              Request a new link
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-shell">
        <Card className="surface-card-strong gradient-outline reveal-up w-full max-w-md border-none">
          <CardHeader>
            <Badge variant="secondary" className="w-fit">
              Password updated
            </Badge>
            <CardTitle>Password reset successful</CardTitle>
            <CardDescription>Your password has been reset. Redirecting to sign in...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-shell">
      <Card className="surface-card-strong gradient-outline reveal-up w-full max-w-md border-none">
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            Security update
          </Badge>
          <CardTitle>Set new password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              {formError ? (
                <Alert variant="destructive">
                  <AlertTitle>Password reset failed</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>New password</FieldLabel>
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

              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Resetting..." : "Reset password"}
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
