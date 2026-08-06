"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { showFormError, showFormSuccess } from "@/lib/ui/form-feedback";
import { twoFactorVerifySchema, type TwoFactorFormValues } from "@/lib/validation/auth";
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/ui/field";
import { Input } from "@repo/ui/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ui/toggle-group";

export function TwoFactorVerifyClientPage() {
  const router = useRouter();
  const [formError, setFormError] = useState("");

  const form = useForm<TwoFactorFormValues>({
    resolver: zodResolver(twoFactorVerifySchema),
    defaultValues: {
      method: "totp",
      code: "",
      trustDevice: false,
    },
  });

  const method = useWatch({
    control: form.control,
    name: "method",
  });

  const isSubmitting = form.formState.isSubmitting;

  const handleSubmit = form.handleSubmit(async (values) => {
    setFormError("");

    try {
      const response =
        values.method === "totp"
          ? await authClient.twoFactor.verifyTotp({
              code: values.code,
              trustDevice: values.trustDevice,
            })
          : await authClient.twoFactor.verifyBackupCode({
              code: values.code,
              trustDevice: values.trustDevice,
            });

      if (response.error) {
        setFormError(showFormError("Verification failed", response.error, "Invalid verification code."));
        return;
      }

      showFormSuccess("Verification complete", "Two-factor authentication was verified.");
      router.push("/dashboard");
    } catch (error) {
      setFormError(showFormError("Verification failed", error, "An unexpected error occurred."));
    }
  });

  return (
    <div className="auth-shell">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Two-factor authentication</h1>
          <p className="text-muted-foreground">Enter your verification code to continue</p>
        </div>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl">Verify your identity</CardTitle>
            <CardDescription>Enter the code from your authenticator app or backup code</CardDescription>
          </CardHeader>

        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} noValidate aria-busy={isSubmitting}>
            <FieldGroup>
              {formError ? (
                <Alert variant="destructive">
                  <AlertTitle>Verification failed</AlertTitle>
                  <AlertDescription>{formError}</AlertDescription>
                </Alert>
              ) : null}

              <Controller
                name="method"
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor="verificationMethod">Verification method</FieldLabel>
                    <ToggleGroup
                      id="verificationMethod"
                      multiple={false}
                      variant="outline"
                      className="w-full"
                      aria-label="Verification method"
                      value={field.value ? [field.value] : []}
                      onValueChange={(values) => {
                        const nextValue = values[0];
                        if (nextValue === "totp" || nextValue === "backup") {
                          field.onChange(nextValue);
                          form.setValue("code", "", { shouldValidate: true });
                        }
                      }}
                    >
                      <ToggleGroupItem value="totp" className="h-11 flex-1">
                        Authenticator app
                      </ToggleGroupItem>
                      <ToggleGroupItem value="backup" className="h-11 flex-1">
                        Backup code
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </Field>
                )}
              />

              <Controller
                name="code"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>{method === "totp" ? "6-digit code" : "Backup code"}</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="text"
                      inputMode={method === "totp" ? "numeric" : "text"}
                      maxLength={method === "totp" ? 6 : 24}
                      placeholder={method === "totp" ? "000000" : "XXXX-XXXX-XXXX"}
                      aria-invalid={fieldState.invalid}
                      className="text-center tracking-wider h-11"
                      onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        const nextValue =
                          method === "totp"
                            ? event.target.value.replace(/\D/g, "").slice(0, 6)
                            : event.target.value.toUpperCase();
                        field.onChange(nextValue);
                      }}
                    />
                    {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                  </Field>
                )}
              />

              <Controller
                name="trustDevice"
                control={form.control}
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <Checkbox
                      id="trustDevice"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                    />
                    <FieldLabel htmlFor="trustDevice" className="font-normal">
                      Trust this device for 30 days
                    </FieldLabel>
                  </Field>
                )}
              />

              <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify"}
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
