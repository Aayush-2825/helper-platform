"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, CircleUserRound } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { useSession } from "@/lib/auth/session";
import { showFormError, showFormSuccess } from "@/lib/ui/form-feedback";
import { twoFactorPasswordSchema, type TwoFactorPasswordFormValues } from "@/lib/validation/account";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function AccountSettings() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [twoFAOverride, setTwoFAOverride] = useState<boolean | null>(null);
  const [formError, setFormError] = useState("");
  const [totpURI, setTotpURI] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [confirmedBackupCodes, setConfirmedBackupCodes] = useState(false);

  const sessionTwoFAEnabled = Boolean(
    (session?.user as { twoFactorEnabled?: boolean } | undefined)?.twoFactorEnabled,
  );
  const twoFAEnabled = twoFAOverride ?? sessionTwoFAEnabled;

  useEffect(() => {
    if (!loading && !session) {
      router.push("/auth/signin");
    }
  }, [loading, router, session]);

  const enableForm = useForm<TwoFactorPasswordFormValues>({
    resolver: zodResolver(twoFactorPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const disableForm = useForm<TwoFactorPasswordFormValues>({
    resolver: zodResolver(twoFactorPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const handleEnable2FA = enableForm.handleSubmit(async (values) => {
    setFormError("");

    try {
      const { data, error } = await authClient.twoFactor.enable({
        password: values.password,
      });

      if (error) {
        setFormError(showFormError("2FA action failed", error, "Failed to enable 2FA."));
        return;
      }

      setTotpURI(data?.totpURI || "");
      setBackupCodes(data?.backupCodes || []);
      setTwoFAOverride(true);
      enableForm.reset();
      showFormSuccess("Two-factor setup started", "Scan the QR code and save your backup codes.");
    } catch (error) {
      setFormError(showFormError("2FA action failed", error, "An unexpected error occurred."));
    }
  });

  const handleDisable2FA = async () => {
    if (!window.confirm("Are you sure? This will disable two-factor authentication.")) {
      return;
    }

    setFormError("");

    try {
      const password = disableForm.getValues("password");

      const { error } = await authClient.twoFactor.disable({
        password,
      });

      if (error) {
        setFormError(showFormError("2FA action failed", error, "Failed to disable 2FA."));
        return;
      }

      setTwoFAOverride(false);
      setTotpURI("");
      setBackupCodes([]);
      setConfirmedBackupCodes(false);
      disableForm.reset();
      showFormSuccess("Two-factor disabled", "Two-factor authentication has been turned off.");
    } catch (error) {
      setFormError(showFormError("2FA action failed", error, "An unexpected error occurred."));
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/signin");
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Loading account settings...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 py-6 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="surface-card reveal-up flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CircleUserRound />
            </div>
            <div>
              <p className="text-sm font-semibold">Account settings</p>
              <p className="text-xs text-muted-foreground">Manage profile and two-factor security</p>
            </div>
          </div>
          <Link href="/dashboard" className={buttonVariants({ size: "sm", variant: "ghost" })}>
            Back to dashboard
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="surface-card reveal-up delay-1 border-none">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <FieldDescription>{session.user.name}</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <FieldDescription>{session.user.email}</FieldDescription>
                  {session.user.emailVerified ? <Badge variant="secondary">Verified</Badge> : null}
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="surface-card-strong reveal-up delay-2 border-none">
            <CardHeader>
              <CardTitle>Two-factor authentication</CardTitle>
              <CardDescription>Protect your account with an additional verification step.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {formError ? (
                <Alert variant="destructive">
                  <AlertTitle>2FA action failed</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

            {!twoFAEnabled && !totpURI && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Two-factor authentication adds an extra layer of security to your account.
                </p>
                <form onSubmit={handleEnable2FA} noValidate>
                  <FieldGroup>
                    <Controller
                      name="password"
                      control={enableForm.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
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

                    <Button type="submit" className="w-full" disabled={enableForm.formState.isSubmitting}>
                      {enableForm.formState.isSubmitting ? "Setting up..." : "Enable 2FA"}
                    </Button>
                  </FieldGroup>
                </form>
              </div>
            )}

            {totpURI && !confirmedBackupCodes && (
              <div className="flex flex-col gap-4">
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
                </p>
                <div className="flex justify-center rounded-lg bg-muted p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(totpURI)}`}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                </div>

                <Alert>
                  <AlertTitle>Save your backup codes</AlertTitle>
                  <AlertDescription>
                    Keep these codes safe. You&apos;ll need them if you lose access to your authenticator app.
                  </AlertDescription>
                </Alert>

                <div className="rounded-lg border bg-background p-3 font-mono text-xs">
                  <div className="grid gap-2">
                    {backupCodes.map((code, i) => (
                      <div key={i}>{code}</div>
                    ))}
                  </div>
                </div>

                <Button
                    type="button"
                    onClick={() => {
                      setConfirmedBackupCodes(true);
                      showFormSuccess("Backup codes saved", "You can now use 2FA for sign-in verification.");
                    }}
                  >
                    I&apos;ve saved my backup codes
                </Button>
              </div>
            )}

            {confirmedBackupCodes && (
              <Alert>
                <CheckCircle2 />
                <AlertTitle>Two-factor authentication is enabled</AlertTitle>
              </Alert>
            )}

            {twoFAEnabled && (
              <>
                <Separator />
                <form
                  onSubmit={disableForm.handleSubmit(async () => {
                    await handleDisable2FA();
                  })}
                  noValidate
                >
                  <FieldGroup>
                    <Controller
                      name="password"
                      control={disableForm.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name}>Confirm password to disable 2FA</FieldLabel>
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

                    <Button type="submit" variant="destructive" disabled={disableForm.formState.isSubmitting}>
                      {disableForm.formState.isSubmitting ? "Disabling..." : "Disable 2FA"}
                    </Button>
                  </FieldGroup>
                </form>
              </>
            )}
            </CardContent>
          </Card>

          <Card className="surface-card reveal-up delay-3 border-none">
            <CardHeader>
              <CardTitle>Sign out</CardTitle>
            </CardHeader>
            <CardFooter>
              <Button onClick={handleSignOut} variant="outline" className="w-full">
                Sign out
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

