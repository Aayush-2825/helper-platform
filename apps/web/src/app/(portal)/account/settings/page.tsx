/* eslint-disable @next/next/no-img-element */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  CircleUserRound,
  Clock3,
  ShieldCheck,
} from "lucide-react";
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

type HelperStatus = {
  hasProfile: boolean;
  profileId: string | null;
  verificationStatus: "pending" | "approved" | "rejected" | "resubmission_required" | null;
  landingPath: string;
  canStartService: boolean;
};

export default function AccountSettings() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [twoFAOverride, setTwoFAOverride] = useState<boolean | null>(null);
  const [formError, setFormError] = useState("");
  const [helperStatus, setHelperStatus] = useState<HelperStatus | null>(null);
  const [helperStatusLoading, setHelperStatusLoading] = useState(true);
  const [helperStatusError, setHelperStatusError] = useState("");
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

  useEffect(() => {
    if (loading || !session) {
      return;
    }

    let ignore = false;

    const loadHelperStatus = async () => {
      setHelperStatusLoading(true);
      setHelperStatusError("");

      try {
        const response = await fetch("/api/helpers/onboarding", {
          method: "GET",
          cache: "no-store",
        });

        const json = (await response.json().catch(() => null)) as
          | (Partial<HelperStatus> & { message?: string })
          | null;

        if (!response.ok) {
          if (!ignore) {
            setHelperStatusError(json?.message ?? "Unable to load helper status.");
          }
          return;
        }

        if (!ignore && json) {
          setHelperStatus({
            hasProfile: Boolean(json.hasProfile),
            profileId: json.profileId ?? null,
            verificationStatus: json.verificationStatus ?? null,
            landingPath: json.landingPath ?? "/helper/onboarding",
            canStartService: Boolean(json.canStartService),
          });
        }
      } catch (error) {
        if (!ignore) {
          setHelperStatusError(error instanceof Error ? error.message : "Unable to load helper status.");
        }
      } finally {
        if (!ignore) {
          setHelperStatusLoading(false);
        }
      }
    };

    void loadHelperStatus();

    return () => {
      ignore = true;
    };
  }, [loading, session]);

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

  const helperBadge = helperStatusLoading
    ? "Loading"
    : helperStatus?.canStartService
    ? "Approved"
    : helperStatus?.verificationStatus === "pending"
    ? "Verification pending"
    : helperStatus?.verificationStatus === "resubmission_required"
    ? "Needs update"
    : helperStatus?.verificationStatus === "rejected"
    ? "Action required"
    : "Not started";

  const helperDescription = helperStatusLoading
    ? "Checking whether your account is already in the helper flow."
    : helperStatus?.canStartService
    ? "Your helper profile is approved. Open the helper workspace and start accepting service requests."
    : helperStatus?.verificationStatus === "pending"
    ? "Your helper application is under review. We will keep routing you to the verification status page until approval."
    : helperStatus?.verificationStatus === "resubmission_required"
    ? "Your helper profile needs a few updates before approval. Re-open onboarding and continue from there."
    : helperStatus?.verificationStatus === "rejected"
    ? "Your previous helper application was rejected. Review the flow again and resubmit your details."
    : "Use this account to become a helper, complete onboarding, and start offering services from the helper portal.";

  const helperActionLabel = helperStatusLoading
    ? "Loading helper flow..."
    : helperStatus?.canStartService
    ? "Start service"
    : helperStatus?.hasProfile
    ? "Continue helper flow"
    : "Become a helper";

  const helperActionHref = helperStatus?.landingPath ?? "/helper/onboarding";

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
              <p className="text-xs text-muted-foreground">Manage profile, helper access, and two-factor security</p>
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
                <Field>
                  <FieldLabel>Current role</FieldLabel>
                  <FieldDescription className="capitalize">{session.user.role ?? "user"}</FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <Card className="surface-card reveal-up delay-2 border-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Become a helper
              </CardTitle>
              <CardDescription>
                Move from customer mode into the helper flow, complete onboarding, and start service from this same
                account.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={helperStatus?.canStartService ? "default" : "secondary"}>{helperBadge}</Badge>
                {helperStatus?.canStartService ? (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Ready to take jobs
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5" />
                    We route you to the right next step automatically
                  </span>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{helperDescription}</p>

              {helperStatusError ? (
                <Alert variant="destructive">
                  <AlertTitle>Helper status unavailable</AlertTitle>
                  <AlertDescription>{helperStatusError}</AlertDescription>
                </Alert>
              ) : null}
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={helperActionHref}
                className={buttonVariants({
                  className: "w-full sm:w-auto",
                  variant: helperStatus?.canStartService ? "default" : "outline",
                })}
              >
                {helperActionLabel}
                <ArrowRight data-icon="inline-end" />
              </Link>
              <p className="text-xs text-muted-foreground">
                Customers can apply as helpers here and continue later from the same settings page.
              </p>
            </CardFooter>
          </Card>

          <Card className="surface-card-strong reveal-up delay-3 border-none">
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
                    Scan this QR code with your authenticator app (Google Authenticator, Authy, Microsoft
                    Authenticator, etc.)
                  </p>
                  <div className="flex justify-center rounded-lg bg-muted p-4">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(totpURI)}`}
                      alt="QR Code"
                      className="h-48 w-48"
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

          <Card className="surface-card reveal-up delay-4 border-none">
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
