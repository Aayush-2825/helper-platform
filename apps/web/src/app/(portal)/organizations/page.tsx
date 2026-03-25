"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Building2, UserPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth/client";
import { useSession } from "@/lib/auth/session";
import { showFormError, showFormSuccess } from "@/lib/ui/form-feedback";
import {
  createOrganizationSchema,
  inviteMemberSchema,
  normalizeOrganizationSlug,
  type CreateOrganizationFormValues,
  type InviteMemberFormValues,
} from "@/lib/validation/organization";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  metadata?: Record<string, unknown>;
}

export default function Organizations() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [formError, setFormError] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");

  const createForm = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  const inviteForm = useForm<InviteMemberFormValues>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (!loading && !session) {
      router.push("/auth/signin");
    }
  }, [loading, router, session]);

  const handleCreateOrganization = createForm.handleSubmit(async (values) => {
    setFormError("");

    const normalizedSlug = normalizeOrganizationSlug(values.name, values.slug);

    if (!normalizedSlug) {
      setFormError("Provide a valid slug or organization name.");
      return;
    }

    try {
      const { data, error } = await authClient.organization.create({
        name: values.name,
        slug: normalizedSlug,
      });

      if (error) {
        setFormError(showFormError("Organization creation failed", error, "Failed to create organization."));
        return;
      }

      setOrganizations((current) => [...current, data as Organization]);
      createForm.reset();
      setFormError("");
      showFormSuccess("Organization created", `${values.name} is ready to use.`);
    } catch (error) {
      setFormError(showFormError("Organization creation failed", error, "An unexpected error occurred."));
    }
  });

  const handleSetActive = async (org: Organization) => {
    try {
      await authClient.organization.setActive({
        organizationId: org.id,
      });
      setSelectedOrg(org);
      setInviteError("");
      setInviteSuccess("");
      showFormSuccess("Active organization updated", `${org.name} is now active.`);
    } catch (error) {
      setFormError(showFormError("Organization selection failed", error, "Failed to set active organization."));
    }
  };

  const handleInviteMember = inviteForm.handleSubmit(async (values) => {
    setInviteError("");
    setInviteSuccess("");

    if (!selectedOrg) {
      setInviteError("No organization selected.");
      return;
    }

    try {
      const { error } = await authClient.organization.inviteMember({
        email: values.email,
        role: "member",
      });

      if (error) {
        setInviteError(showFormError("Invite failed", error, "Failed to send invitation."));
        return;
      }

      inviteForm.reset();
      setInviteSuccess("Invitation sent successfully.");
      showFormSuccess("Invitation sent", `An invite was sent to ${values.email}.`);
    } catch (error) {
      setInviteError(showFormError("Invite failed", error, "An unexpected error occurred."));
    }
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <p className="text-sm text-muted-foreground">Loading organizations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 py-6 sm:p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="surface-card reveal-up flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 />
            </div>
            <div>
              <p className="text-sm font-semibold">Organization management</p>
              <p className="text-xs text-muted-foreground">Create teams and invite members to collaborate</p>
            </div>
          </div>
          <Link href="/dashboard" className={buttonVariants({ size: "sm", variant: "ghost" })}>
            Back to dashboard
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="surface-card-strong reveal-up border-none">
            <CardHeader>
              <CardTitle>Create organization</CardTitle>
              <CardDescription>Create a new workspace for your team.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOrganization} noValidate>
                <FieldGroup>
                  {formError ? (
                    <Alert variant="destructive">
                      <AlertTitle>Organization creation failed</AlertTitle>
                      <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                  ) : null}

                  <Controller
                    name="name"
                    control={createForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Organization name</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          placeholder="Acme Corp"
                          aria-invalid={fieldState.invalid}
                        />
                        {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                      </Field>
                    )}
                  />

                  <Controller
                    name="slug"
                    control={createForm.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Slug (URL-friendly)</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          placeholder="acme-corp"
                          aria-invalid={fieldState.invalid}
                        />
                        <FieldDescription>Leave blank to auto-generate from the name.</FieldDescription>
                        {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                      </Field>
                    )}
                  />

                  <Button type="submit" disabled={createForm.formState.isSubmitting}>
                    {createForm.formState.isSubmitting ? "Creating..." : "Create organization"}
                    <ArrowRight data-icon="inline-end" />
                  </Button>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>

          {selectedOrg && (
            <Card className="surface-card reveal-up delay-1 border-none">
              <CardHeader>
                <CardTitle>Invite members</CardTitle>
                <CardDescription>Active organization: {selectedOrg.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInviteMember} noValidate>
                  <FieldGroup>
                    {inviteError ? (
                      <Alert variant="destructive">
                        <AlertTitle>Invite failed</AlertTitle>
                        <AlertDescription>{inviteError}</AlertDescription>
                      </Alert>
                    ) : null}

                    {inviteSuccess ? (
                      <Alert>
                        <AlertTitle>Invitation sent</AlertTitle>
                        <AlertDescription>{inviteSuccess}</AlertDescription>
                      </Alert>
                    ) : null}

                    <Controller
                      name="email"
                      control={inviteForm.control}
                      render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                          <FieldLabel htmlFor={field.name}>Email address</FieldLabel>
                          <Input
                            {...field}
                            id={field.name}
                            type="email"
                            autoComplete="email"
                            placeholder="user@example.com"
                            aria-invalid={fieldState.invalid}
                          />
                          {fieldState.invalid ? <FieldError errors={[fieldState.error]} /> : null}
                        </Field>
                      )}
                    />

                    <Button type="submit" disabled={inviteForm.formState.isSubmitting}>
                      {inviteForm.formState.isSubmitting ? "Sending..." : "Send invitation"}
                      <UserPlus data-icon="inline-end" />
                    </Button>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          )}

          {!selectedOrg && (
            <Card className="surface-card reveal-up delay-1 border-none">
              <CardHeader>
                <CardTitle>Invite members</CardTitle>
                <CardDescription>Select an organization below to invite people.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Once you choose an active organization, this panel will unlock member invitations.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="surface-card reveal-up delay-2 border-none">
          <CardHeader>
            <CardTitle>Your organizations</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {organizations.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/70 py-8 text-center">
                <p className="text-sm text-muted-foreground">You haven&apos;t created any organizations yet.</p>
              </div>
            ) : (
              organizations.map((org) => (
                <Button
                  key={org.id}
                  type="button"
                  variant={selectedOrg?.id === org.id ? "secondary" : "outline"}
                  className="h-auto w-full justify-between rounded-xl p-3 text-left"
                  onClick={() => handleSetActive(org)}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-foreground">{org.name}</span>
                    <span className="text-xs text-muted-foreground">/{org.slug}</span>
                  </div>
                  {selectedOrg?.id === org.id ? <Badge>Active</Badge> : null}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

