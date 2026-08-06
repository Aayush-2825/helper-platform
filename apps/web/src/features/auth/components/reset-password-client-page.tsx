"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { showFormError, showFormSuccess } from "@/lib/ui/form-feedback";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/validation/auth";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Button, buttonVariants } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/ui/field";
import { Input } from "@repo/ui/components/ui/input";

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

  const isSubmitting = form.formState.isSubmitting;

  if (!token) {
    return (
      <div className="auth-shell">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-destructive/20 to-destructive/5">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Invalid link</h1>
            <p className="text-muted-foreground">This password reset link is invalid or has expired</p>
          </div>

          <Card className="border-border/60 shadow-lg">
            <CardFooter className="flex flex-col gap-4">
              <Link href="/auth/forgot-password" className={buttonVariants({ className: "h-11 w-full" })}>
                Request a new link
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-shell">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5">
              <ShieldCheck className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Password updated</h1>
            <p className="text-muted-foreground">Your password has been reset successfully</p>
          </div>

          <Card className="border-border/60 shadow-lg">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">Redirecting to sign in...</p>
            </CardContent>
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
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Set new password</h1>
          <p className="text-muted-foreground">Enter your new password below</p>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Reset password</CardTitle>
            <CardDescription>Choose a secure password for your account</CardDescription>
          </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
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

              <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
                {isSubmitting ? "Resetting..." : "Reset password"}
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
