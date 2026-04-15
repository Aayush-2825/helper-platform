"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { showFormError, showFormSuccess } from "@/lib/ui/form-feedback";
import { twoFactorVerifySchema, type TwoFactorFormValues } from "@/lib/validation/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
      <Card className="surface-card-strong gradient-outline reveal-up w-full max-w-md border-none">
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            Extra protection
          </Badge>
          <CardTitle>Two-factor authentication</CardTitle>
          <CardDescription>Enter your verification code to continue.</CardDescription>
        </CardHeader>

        <CardContent>
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
                      <ToggleGroupItem value="totp" className="min-h-11 flex-1">
                        Authenticator app
                      </ToggleGroupItem>
                      <ToggleGroupItem value="backup" className="min-h-11 flex-1">
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
                      className="text-center tracking-wider"
                      onChange={(event) => {
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

              <Button type="submit" className="min-h-11 w-full" disabled={isSubmitting}>
                {isSubmitting ? "Verifying..." : "Verify"}
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
