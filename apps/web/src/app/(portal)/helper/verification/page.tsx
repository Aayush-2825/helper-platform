import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { eq } from "drizzle-orm";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Building2,
  Clock3,
  ExternalLink,
  FileText,
  MapPin,
  ShieldCheck,
  TriangleAlert,
  XCircle,
} from "lucide-react";
import { db } from "@/db";
import { helperProfile } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function formatStatus(status: "pending" | "approved" | "rejected" | "resubmission_required") {
  switch (status) {
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "resubmission_required":
      return "Needs resubmission";
    default:
      return "Pending review";
  }
}

function getStatusBadgeVariant(status: "pending" | "approved" | "rejected" | "resubmission_required") {
  switch (status) {
    case "approved":
      return "default" as const;
    case "rejected":
      return "destructive" as const;
    case "resubmission_required":
      return "outline" as const;
    default:
      return "secondary" as const;
  }
}

function VerificationStatusIcon({
  status,
  className,
}: {
  status: "pending" | "approved" | "rejected" | "resubmission_required";
  className?: string;
}) {
  switch (status) {
    case "approved":
      return <BadgeCheck className={className} />;
    case "rejected":
      return <XCircle className={className} />;
    case "resubmission_required":
      return <TriangleAlert className={className} />;
    default:
      return <Clock3 className={className} />;
  }
}

function getVerificationAlert(status: "pending" | "approved" | "rejected" | "resubmission_required") {
  switch (status) {
    case "approved":
      return {
        icon: ShieldCheck,
        title: "Your helper profile is approved",
        description: "You can now go online, receive bookings, and manage your helper operations from the portal.",
      };
    case "rejected":
      return {
        icon: XCircle,
        title: "Your application was rejected",
        description:
          "Review the document issues below. Once the editing flow is added, this page should become the starting point for resubmission.",
      };
    case "resubmission_required":
      return {
        icon: TriangleAlert,
        title: "Resubmission required",
        description:
          "Some verification items need attention. Use the document list below to see which uploads are blocked or need replacement.",
      };
    default:
      return {
        icon: Clock3,
        title: "Verification is in progress",
        description:
          "Your onboarding is complete and our team is reviewing your documents. You can keep checking this page for live document status.",
      };
  }
}

function formatDocumentType(type: string) {
  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(date: Date | null) {
  if (!date) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function HelperVerificationPage() {
  await connection();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/signin?next=%2Fhelper%2Fverification");
  }

  const profile = await db.query.helperProfile.findFirst({
    where: eq(helperProfile.userId, session.user.id),
    columns: {
      id: true,
      primaryCategory: true,
      serviceCity: true,
      verificationStatus: true,
      availabilityStatus: true,
      yearsExperience: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      organization: {
        columns: {
          name: true,
        },
      },
      kycDocuments: {
        columns: {
          id: true,
          documentType: true,
          documentNumber: true,
          fileUrl: true,
          status: true,
          rejectionReason: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!profile) {
    redirect("/helper/onboarding");
  }

  const documents = [...profile.kycDocuments].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );

  const approvedDocuments = documents.filter((document) => document.status === "approved").length;
  const pendingDocuments = documents.filter((document) => document.status === "pending").length;
  const blockedDocuments = documents.filter(
    (document) => document.status === "rejected" || document.status === "resubmission_required"
  ).length;

  const statusAlert = getVerificationAlert(profile.verificationStatus);
  const AlertIcon = statusAlert.icon;

  return (
    <main className="grid gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">Verification</h1>
          <Badge variant={getStatusBadgeVariant(profile.verificationStatus)}>
            {formatStatus(profile.verificationStatus)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Track your helper profile review, submitted KYC documents, and the exact verification state of each file.
        </p>
      </div>

      <Alert>
        <AlertIcon className="h-4 w-4" />
        <AlertTitle>{statusAlert.title}</AlertTitle>
        <AlertDescription>{statusAlert.description}</AlertDescription>
      </Alert>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="surface-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <VerificationStatusIcon status={profile.verificationStatus} className="h-4 w-4 text-primary" />
              Profile status
            </CardTitle>
            <CardDescription>Current helper verification state</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Status:</span> {formatStatus(profile.verificationStatus)}
            </p>
            <p>
              <span className="font-medium text-foreground">Last update:</span> {formatDate(profile.updatedAt)}
            </p>
            <p>
              <span className="font-medium text-foreground">Availability:</span> {profile.availabilityStatus}
            </p>
          </CardContent>
        </Card>

        <Card className="surface-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" />
              Documents
            </CardTitle>
            <CardDescription>Actual uploaded document count</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">Uploaded:</span> {documents.length}
            </p>
            <p>
              <span className="font-medium text-foreground">Pending review:</span> {pendingDocuments}
            </p>
            <p>
              <span className="font-medium text-foreground">Approved:</span> {approvedDocuments}
            </p>
            <p>
              <span className="font-medium text-foreground">Need attention:</span> {blockedDocuments}
            </p>
          </CardContent>
        </Card>

        <Card className="surface-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-4 w-4 text-primary" />
              Service profile
            </CardTitle>
            <CardDescription>Your active helper profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="capitalize">
              <span className="font-medium text-foreground">Category:</span> {profile.primaryCategory.replace(/_/g, " ")}
            </p>
            <p>
              <span className="font-medium text-foreground">Experience:</span> {profile.yearsExperience} years
            </p>
            <p>
              <span className="font-medium text-foreground">City:</span> {profile.serviceCity || "Not set"}
            </p>
            {profile.organization?.name ? (
              <p>
                <span className="font-medium text-foreground">Organization:</span> {profile.organization.name}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </section>

      <Card className="surface-card border-none">
        <CardHeader>
          <CardTitle>Submitted Documents</CardTitle>
          <CardDescription>
            Every KYC file stored for this helper profile, with its review state and access link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No verification documents were stored for this helper profile yet.
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="rounded-lg border border-border/60 bg-background/70 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{formatDocumentType(document.documentType)}</p>
                        <Badge variant={getStatusBadgeVariant(document.status)}>{formatStatus(document.status)}</Badge>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {document.documentNumber ? (
                          <p>
                            <span className="font-medium text-foreground">Document number:</span> {document.documentNumber}
                          </p>
                        ) : null}
                        <p>
                          <span className="font-medium text-foreground">Uploaded:</span> {formatDate(document.createdAt)}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">Last reviewed:</span> {formatDate(document.updatedAt)}
                        </p>
                        {document.rejectionReason ? (
                          <p className="text-destructive">
                            <span className="font-medium">Review note:</span> {document.rejectionReason}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <Link
                      href={document.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Open file
                      <ExternalLink data-icon="inline-end" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="surface-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-primary" />
              Next step
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {profile.verificationStatus === "approved" ? (
              <p>Your account is verified. Continue to the helper dashboard and start accepting live work.</p>
            ) : (
              <p>
                Your verification is still in progress. Keep this page bookmarked to monitor document status and
                review notes.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="surface-card border-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4 text-primary" />
              Helpful links
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/account/settings" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Account settings
            </Link>
            <Link href="/helper" className={buttonVariants({ size: "sm" })}>
              Open helper portal
              <ArrowRight data-icon="inline-end" />
            </Link>
          </CardContent>
        </Card>
      </section>

      {profile.verificationStatus !== "approved" && blockedDocuments > 0 ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Some documents need attention</AlertTitle>
          <AlertDescription>
            At least one uploaded document is blocked or marked for resubmission. Review the document cards above for
            exact details.
          </AlertDescription>
        </Alert>
      ) : null}
    </main>
  );
}
