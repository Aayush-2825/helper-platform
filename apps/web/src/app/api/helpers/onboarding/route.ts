import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { and, count, eq, gte, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  helperKycDocument,
  helperOnboardingDraft,
  helperProfile,
  notificationEvent,
  organization,
  user,
} from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { getHelperLandingPath } from "@/lib/helper/routing";
import { enqueueHelperNotification } from "@/lib/notifications/helper-events";

const PHONE_REGEX = /^[0-9]{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const UPI_REGEX = /^[a-zA-Z0-9.-]{3,}@[a-zA-Z]{3,}$/;
const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const OBJECT_KEY_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9/_\-.]{2,255}$/;
const IDEMPOTENCY_KEY_REGEX = /^[a-zA-Z0-9:_\-.]{8,200}$/;
const MAX_SUBMISSIONS_PER_HOUR = 3;
const SUPPORTED_HELPER_CATEGORIES = new Set([
  "driver",
  "electrician",
  "plumber",
  "cleaner",
  "chef",
  "delivery_helper",
  "caretaker",
  "security_guard",
  "other",
]);

type UploadValue = string | null;

type OnboardingPayload = {
  helperType?: "individual" | "agency";
  fullName?: string;
  businessName?: string;
  ownerName?: string;
  phone?: string;
  email?: string;
  businessAddress?: string;
  city?: string;
  profilePhotoUrl: UploadValue;
  logoUrl: UploadValue;
  primaryCategory?: string;
  yearsExperience?: number;
  bio?: string;
  languages: string[];
  serviceRadiusKm?: number;
  numberOfWorkers?: number;
  workerTypesOffered: string[];
  canAssignJobsInternally: boolean;
  pricingType?: string;
  basePrice?: number;
  isOnline: boolean;
  workingHours: { start: string; end: string };
  availableDays: string[];
  idDocumentType?: string;
  idDocumentNumber?: string;
  idDocumentUrl: UploadValue;
  selfieUrl: UploadValue;
  addressProofUrl: UploadValue;
  businessRegistrationUrl: UploadValue;
  gstNumber?: string;
  gstDocumentUrl: UploadValue;
  ownerIdDocumentType?: string;
  ownerIdDocumentUrl: UploadValue;
  workerDeclarationAgreed: boolean;
  dpdpConsentGiven: boolean;
  dpdpConsentAt?: string;
  dpdpConsentVersion?: string;
  accountHolderName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  upiId?: string;
  agreedToTerms: boolean;
  agreedToCommission: boolean;
};

async function getSessionOrNull() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

async function getHelperStatus(userId: string) {
  const profile = await db.query.helperProfile.findFirst({
    where: eq(helperProfile.userId, userId),
    columns: {
      id: true,
      verificationStatus: true,
      isActive: true,
      videoKycStatus: true,
    },
  });

  if (!profile) {
    return {
      hasProfile: false,
      profileId: null,
      verificationStatus: null,
      landingPath: "/helper/onboarding",
      canStartService: false,
    };
  }

  return {
    hasProfile: true,
    profileId: profile.id,
    verificationStatus: profile.verificationStatus,
    landingPath: await getHelperLandingPath(userId),
    canStartService:
      profile.verificationStatus === "approved" &&
      profile.videoKycStatus === "passed" &&
      profile.isActive,
  };
}

function canResubmitOnboarding(
  verificationStatus: "pending" | "approved" | "rejected" | "resubmission_required" | null,
) {
  return verificationStatus === "rejected" || verificationStatus === "resubmission_required";
}

function getEntry(source: FormData | Record<string, unknown>, key: string): unknown {
  return source instanceof FormData ? source.get(key) : source[key];
}

function parseText(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  return value === "true";
}

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

function parseWorkingHours(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    return {
      start: typeof record.start === "string" ? record.start : "",
      end: typeof record.end === "string" ? record.end : "",
    };
  }

  if (typeof value !== "string" || value.trim().length === 0) {
    return { start: "", end: "" };
  }

  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    return {
      start: typeof parsed.start === "string" ? parsed.start : "",
      end: typeof parsed.end === "string" ? parsed.end : "",
    };
  } catch {
    return { start: "", end: "" };
  }
}

function parseUpload(value: unknown): UploadValue {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function parseOnboardingPayload(request: NextRequest): Promise<OnboardingPayload> {
  const contentType = request.headers.get("content-type") ?? "";
  const source = contentType.includes("application/json")
    ? ((await request.json()) as Record<string, unknown>)
    : await request.formData();

  return {
    helperType: parseText(getEntry(source, "helperType")) as "individual" | "agency" | undefined,
    fullName: parseText(getEntry(source, "fullName")),
    businessName: parseText(getEntry(source, "businessName")),
    ownerName: parseText(getEntry(source, "ownerName")),
    phone: parseText(getEntry(source, "phone")),
    email: parseText(getEntry(source, "email")),
    businessAddress: parseText(getEntry(source, "businessAddress")),
    city: parseText(getEntry(source, "city")),
    profilePhotoUrl: parseUpload(getEntry(source, "profilePhotoUrl")),
    logoUrl: parseUpload(getEntry(source, "logoUrl")),
    primaryCategory: parseText(getEntry(source, "primaryCategory")),
    yearsExperience: parseNumber(getEntry(source, "yearsExperience")),
    bio: parseText(getEntry(source, "bio")),
    languages: parseStringArray(getEntry(source, "languages")),
    serviceRadiusKm: parseNumber(getEntry(source, "serviceRadiusKm")),
    numberOfWorkers: parseNumber(getEntry(source, "numberOfWorkers")),
    workerTypesOffered: parseStringArray(getEntry(source, "workerTypesOffered")),
    canAssignJobsInternally: parseBoolean(getEntry(source, "canAssignJobsInternally")),
    pricingType: parseText(getEntry(source, "pricingType")),
    basePrice: parseNumber(getEntry(source, "basePrice")),
    isOnline: parseBoolean(getEntry(source, "isOnline")),
    workingHours: parseWorkingHours(getEntry(source, "workingHours")),
    availableDays: parseStringArray(getEntry(source, "availableDays")),
    idDocumentType: parseText(getEntry(source, "idDocumentType")),
    idDocumentNumber: parseText(getEntry(source, "idDocumentNumber")),
    idDocumentUrl: parseUpload(getEntry(source, "idDocumentUrl")),
    selfieUrl: parseUpload(getEntry(source, "selfieUrl")),
    addressProofUrl: parseUpload(getEntry(source, "addressProofUrl")),
    businessRegistrationUrl: parseUpload(getEntry(source, "businessRegistrationUrl")),
    gstNumber: parseText(getEntry(source, "gstNumber")),
    gstDocumentUrl: parseUpload(getEntry(source, "gstDocumentUrl")),
    ownerIdDocumentType: parseText(getEntry(source, "ownerIdDocumentType")),
    ownerIdDocumentUrl: parseUpload(getEntry(source, "ownerIdDocumentUrl")),
    workerDeclarationAgreed: parseBoolean(getEntry(source, "workerDeclarationAgreed")),
    dpdpConsentGiven: parseBoolean(getEntry(source, "dpdpConsentGiven")),
    dpdpConsentAt: parseText(getEntry(source, "dpdpConsentAt")),
    dpdpConsentVersion: parseText(getEntry(source, "dpdpConsentVersion")),
    accountHolderName: parseText(getEntry(source, "accountHolderName")),
    bankAccountNumber: parseText(getEntry(source, "bankAccountNumber")),
    ifscCode: parseText(getEntry(source, "ifscCode"))?.toUpperCase(),
    upiId: parseText(getEntry(source, "upiId")),
    agreedToTerms: parseBoolean(getEntry(source, "agreedToTerms")),
    agreedToCommission: parseBoolean(getEntry(source, "agreedToCommission")),
  };
}

function hasUpload(value: UploadValue) {
  return Boolean(value);
}

function isValidObjectKey(value: string) {
  if (!OBJECT_KEY_REGEX.test(value)) {
    return false;
  }

  return !value.includes("://");
}

function parseTimeToMinutes(value: string) {
  const [hoursRaw, minutesRaw] = value.split(":");
  const hours = Number.parseInt(hoursRaw ?? "", 10);
  const minutes = Number.parseInt(minutesRaw ?? "", 10);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
    return null;
  }

  return hours * 60 + minutes;
}

function validateUploadReference(value: UploadValue, fieldLabel: string, errors: string[]) {
  if (!value) {
    return;
  }

  if (typeof value === "string" && !isValidObjectKey(value)) {
    errors.push(`${fieldLabel} must be a valid uploaded object key.`);
  }
}

function validateOnboardingPayload(data: OnboardingPayload) {
  const errors: string[] = [];

  if (data.helperType !== "individual" && data.helperType !== "agency") {
    errors.push("Choose whether you are applying as an individual or an agency.");
  }

  if (!data.phone || !PHONE_REGEX.test(data.phone)) {
    errors.push("Enter a valid 10-digit phone number.");
  }

  if (!data.city || data.city.length < 2) {
    errors.push("Enter your service city.");
  }

  if (!data.primaryCategory) {
    errors.push("Select a primary service category.");
  }

  if (!data.languages.length) {
    errors.push("Select at least one language.");
  }

  if (
    data.serviceRadiusKm === undefined ||
    !Number.isInteger(data.serviceRadiusKm) ||
    data.serviceRadiusKm < 1 ||
    data.serviceRadiusKm > 50
  ) {
    errors.push("Service radius must be between 1 and 50 km.");
  }

  if (data.yearsExperience === undefined || !Number.isInteger(data.yearsExperience) || data.yearsExperience < 0) {
    errors.push("Years of experience must be an integer 0 or above.");
  }

  if (!data.pricingType) {
    errors.push("Choose a pricing model.");
  }

  if (!data.availableDays.length) {
    errors.push("Select at least one available day.");
  }

  if (!TIME_REGEX.test(data.workingHours.start) || !TIME_REGEX.test(data.workingHours.end)) {
    errors.push("Choose valid working hours.");
  } else {
    const startMinutes = parseTimeToMinutes(data.workingHours.start);
    const endMinutes = parseTimeToMinutes(data.workingHours.end);
    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
      errors.push("Working hours must end after they start.");
    }
  }

  if (
    (data.pricingType === "hourly" || data.pricingType === "fixed") &&
    (data.basePrice === undefined || !Number.isInteger(data.basePrice) || data.basePrice <= 0)
  ) {
    errors.push("Base price is required for hourly/fixed pricing and must be a positive integer.");
  }

  if (!data.accountHolderName || data.accountHolderName.length < 2) {
    errors.push("Enter the account holder name for payouts.");
  }

  if (!data.bankAccountNumber || !/^[0-9]{9,18}$/.test(data.bankAccountNumber)) {
    errors.push("Enter a valid bank account number.");
  }

  if (!data.ifscCode || !IFSC_REGEX.test(data.ifscCode)) {
    errors.push("Enter a valid IFSC code.");
  }

  if (data.upiId && !UPI_REGEX.test(data.upiId)) {
    errors.push("Enter a valid UPI ID.");
  }

  if (!data.agreedToTerms || !data.agreedToCommission) {
    errors.push("Accept the terms and commission agreement before submitting.");
  }

  if (!data.dpdpConsentGiven || !data.dpdpConsentAt || !data.dpdpConsentVersion) {
    errors.push("DPDP consent is required before uploading and submitting KYC documents.");
  }

  if (data.helperType === "individual") {
    if (!data.fullName || data.fullName.length < 2) {
      errors.push("Enter your full name.");
    }
    if (!data.idDocumentType) {
      errors.push("Select a government ID type.");
    }
    if (!data.idDocumentNumber || data.idDocumentNumber.length < 5) {
      errors.push("Enter a valid government ID number.");
    }
    if (!hasUpload(data.idDocumentUrl)) {
      errors.push("Upload your government ID document before submitting.");
    }
  }

  validateUploadReference(data.idDocumentUrl, "ID document", errors);
  validateUploadReference(data.addressProofUrl, "Address proof", errors);
  validateUploadReference(data.selfieUrl, "Selfie", errors);
  validateUploadReference(data.businessRegistrationUrl, "Business registration", errors);
  validateUploadReference(data.gstDocumentUrl, "GST document", errors);
  validateUploadReference(data.ownerIdDocumentUrl, "Owner ID document", errors);
  validateUploadReference(data.profilePhotoUrl, "Profile photo", errors);
  validateUploadReference(data.logoUrl, "Logo", errors);

  if (data.helperType === "agency") {
    if (!data.businessName || data.businessName.length < 2) {
      errors.push("Enter the agency or business name.");
    }
    if (!data.ownerName || data.ownerName.length < 2) {
      errors.push("Enter the owner or manager name.");
    }
    if (!data.email || !EMAIL_REGEX.test(data.email)) {
      errors.push("Enter a valid business email.");
    }
    if (!data.businessAddress || data.businessAddress.length < 5) {
      errors.push("Enter the business address.");
    }
    if (!data.workerTypesOffered.length) {
      errors.push("Select at least one worker type for your agency.");
    }
    if (data.numberOfWorkers === undefined || data.numberOfWorkers < 1) {
      errors.push("Enter how many workers your agency has.");
    }
    if (!hasUpload(data.businessRegistrationUrl)) {
      errors.push("Upload the business registration document.");
    }
    if (!data.ownerIdDocumentType) {
      errors.push("Select the owner or manager ID type.");
    }
    if (!hasUpload(data.ownerIdDocumentUrl)) {
      errors.push("Upload the owner or manager ID document.");
    }
    if (!data.workerDeclarationAgreed) {
      errors.push("Confirm worker identity verification before submitting.");
    }
  }

  return errors;
}

async function hasSubmissionRateLimitExceeded(userId: string) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const [result] = await db
    .select({ count: count() })
    .from(notificationEvent)
    .where(
      and(
        eq(notificationEvent.userId, userId),
        eq(notificationEvent.templateKey, "helper.docs_submitted"),
        gte(notificationEvent.createdAt, oneHourAgo),
      ),
    );

  return (result?.count ?? 0) >= MAX_SUBMISSIONS_PER_HOUR;
}

async function isDuplicateIdempotencyKey(userId: string, idempotencyKey: string) {
  const existing = await db.query.notificationEvent.findFirst({
    where: and(
      eq(notificationEvent.userId, userId),
      eq(notificationEvent.templateKey, "helper.docs_submitted"),
      sql`coalesce(${notificationEvent.payload}->>'submissionIdempotencyKey', '') = ${idempotencyKey}`,
    ),
    columns: { id: true },
  });

  return Boolean(existing);
}

function persistUpload(upload: UploadValue) {
  if (!upload) {
    return null;
  }

  return isValidObjectKey(upload) ? upload : null;
}

function normalizePrimaryCategory(category: string | undefined) {
  if (!category) {
    return "other" as const;
  }

  return (SUPPORTED_HELPER_CATEGORIES.has(category) ? category : "other") as
    | "driver"
    | "electrician"
    | "plumber"
    | "cleaner"
    | "chef"
    | "delivery_helper"
    | "caretaker"
    | "security_guard"
    | "other";
}

export async function GET() {
  try {
    const session = await getSessionOrNull();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(await getHelperStatus(session.user.id), {
      status: 200,
      headers: NO_STORE_HEADERS,
    });
  } catch (error) {
    console.error("Helper onboarding status error:", error);
    return NextResponse.json(
      {
        message: "Server error while loading helper status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionOrNull();

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const idempotencyKey = request.headers.get("idempotency-key")?.trim() ?? "";
    if (!IDEMPOTENCY_KEY_REGEX.test(idempotencyKey)) {
      return NextResponse.json(
        { message: "Idempotency-Key header is required and must be valid." },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    if (await hasSubmissionRateLimitExceeded(session.user.id)) {
      return NextResponse.json(
        { message: "Submission rate limit exceeded. Please try again later." },
        { status: 429, headers: NO_STORE_HEADERS },
      );
    }

    if (await isDuplicateIdempotencyKey(session.user.id, idempotencyKey)) {
      const existing = await getHelperStatus(session.user.id);
      return NextResponse.json(
        {
          ...existing,
          message: "Duplicate submission ignored.",
          idempotentReplay: true,
        },
        { status: 200, headers: NO_STORE_HEADERS },
      );
    }

    const existingStatus = await getHelperStatus(session.user.id);
    const existingProfile = existingStatus.hasProfile
      ? await db.query.helperProfile.findFirst({
          where: eq(helperProfile.userId, session.user.id),
          columns: {
            id: true,
            organizationId: true,
            verificationStatus: true,
            blockResubmission: true,
            lastResubmittedAt: true,
          },
        })
      : null;

    if (existingStatus.hasProfile && !canResubmitOnboarding(existingStatus.verificationStatus)) {
      return NextResponse.json(existingStatus, {
        status: 200,
        headers: NO_STORE_HEADERS,
      });
    }

    if (existingProfile?.blockResubmission) {
      return NextResponse.json(
        { error: "Resubmission blocked. Contact support." },
        { status: 403, headers: NO_STORE_HEADERS },
      );
    }

    if (existingProfile?.lastResubmittedAt) {
      const hoursSince =
        (Date.now() - new Date(existingProfile.lastResubmittedAt).getTime()) / 36e5;
      if (hoursSince < 24) {
        const retryAfterDate = new Date(new Date(existingProfile.lastResubmittedAt).getTime() + 24 * 60 * 60 * 1000);
        return NextResponse.json(
          {
            error: "Too soon to resubmit",
            retryAfter: Math.floor(retryAfterDate.getTime() / 1000),
          },
          { status: 429, headers: NO_STORE_HEADERS },
        );
      }
    }

    const data = await parseOnboardingPayload(request);
    const validationErrors = validateOnboardingPayload(data);

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          message: validationErrors[0],
          errors: validationErrors,
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const profilePhotoUrl = persistUpload(data.profilePhotoUrl);
    const organizationLogoUrl = persistUpload(data.logoUrl);

    let organizationId: string | null = existingProfile?.organizationId ?? null;
    if (data.helperType === "agency") {
      const businessName = data.businessName || `${session.user.name}'s agency`;
      if (organizationId) {
        await db
          .update(organization)
          .set({
            name: businessName,
            logo: organizationLogoUrl || null,
            metadata: JSON.stringify({
              businessAddress: data.businessAddress,
              gstNumber: data.gstNumber || null,
              ownerName: data.ownerName || null,
              workerTypesOffered: data.workerTypesOffered,
              numberOfWorkers: data.numberOfWorkers ?? null,
            }),
          })
          .where(eq(organization.id, organizationId));
      } else {
        const result = await db
          .insert(organization)
          .values({
            id: crypto.randomUUID(),
            name: businessName,
            slug: `${businessName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
            logo: organizationLogoUrl || null,
            metadata: JSON.stringify({
              businessAddress: data.businessAddress,
              gstNumber: data.gstNumber || null,
              ownerName: data.ownerName || null,
              workerTypesOffered: data.workerTypesOffered,
              numberOfWorkers: data.numberOfWorkers ?? null,
            }),
          })
          .returning();

        organizationId = result[0]?.id || null;
      }
    } else {
      organizationId = null;
    }

    const createdProfile = existingProfile
      ? (
          await db
            .update(helperProfile)
            .set({
              organizationId,
              primaryCategory: normalizePrimaryCategory(data.primaryCategory),
              headline: data.bio?.substring(0, 100) || null,
              bio: data.bio || null,
              yearsExperience: data.yearsExperience || 0,
              serviceCity: data.city || null,
              serviceRadiusKm: data.serviceRadiusKm || 8,
              verificationStatus: "pending",
              availabilityStatus: "offline",
              isActive: false,
              blockResubmission: false,
              lastResubmittedAt: new Date(),
              submittedAt: new Date(),
              videoKycStatus: "pending_schedule",
              updatedAt: new Date(),
            })
            .where(eq(helperProfile.id, existingProfile.id))
            .returning({ id: helperProfile.id })
        )[0]
      : (
          await db
            .insert(helperProfile)
            .values({
              id: crypto.randomUUID(),
              userId: session.user.id,
              organizationId,
              primaryCategory: normalizePrimaryCategory(data.primaryCategory),
              headline: data.bio?.substring(0, 100) || null,
              bio: data.bio || null,
              yearsExperience: data.yearsExperience || 0,
              serviceCity: data.city || null,
              serviceRadiusKm: data.serviceRadiusKm || 8,
              verificationStatus: "pending",
              availabilityStatus: data.isOnline ? "online" : "offline",
              isActive: false,
              blockResubmission: false,
              submittedAt: new Date(),
              videoKycStatus: "pending_schedule",
            })
            .returning({ id: helperProfile.id })
        )[0];

    if (existingProfile) {
      await db
        .update(helperKycDocument)
        .set({
          supersededAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(helperKycDocument.helperProfileId, existingProfile.id),
            isNull(helperKycDocument.supersededAt),
          ),
        );
    }

    const kycUploads: Array<{
      documentType: string;
      documentNumber?: string;
      upload: UploadValue;
    }> =
      data.helperType === "agency"
        ? [
            {
              documentType: "business_registration",
              upload: data.businessRegistrationUrl,
            },
            {
              documentType: data.ownerIdDocumentType || "owner_id",
              upload: data.ownerIdDocumentUrl,
            },
            ...(data.gstDocumentUrl
              ? [
                  {
                    documentType: "gst_certificate",
                    documentNumber: data.gstNumber,
                    upload: data.gstDocumentUrl,
                  },
                ]
              : []),
          ]
        : [
            {
              documentType: data.idDocumentType || "government_id",
              documentNumber: data.idDocumentNumber,
              upload: data.idDocumentUrl,
            },
            ...(data.addressProofUrl
              ? [
                  {
                    documentType: "address_proof",
                    upload: data.addressProofUrl,
                  },
                ]
              : []),
            ...(data.selfieUrl
              ? [
                  {
                    documentType: "selfie",
                    upload: data.selfieUrl,
                  },
                ]
              : []),
          ];

    for (const document of kycUploads) {
      const storedFileUrl = persistUpload(document.upload);
      if (!storedFileUrl) {
        continue;
      }

      await db.insert(helperKycDocument).values({
        id: crypto.randomUUID(),
        helperProfileId: createdProfile.id,
        documentType: document.documentType,
        documentNumber: document.documentNumber || null,
        fileUrl: storedFileUrl,
        status: "pending",
      });
    }

    await db
      .update(user)
      .set({
        role: "helper",
        name:
          data.helperType === "agency"
            ? data.businessName || session.user.name
            : data.fullName || session.user.name,
        phone: data.phone || null,
        image: profilePhotoUrl || undefined,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id));

    await db.delete(helperOnboardingDraft).where(eq(helperOnboardingDraft.userId, session.user.id));

    await enqueueHelperNotification({
      helperUserId: session.user.id,
      event: "docs_submitted",
      meta: {
        docTypes: kycUploads.map((doc) => doc.documentType),
        submissionIdempotencyKey: idempotencyKey,
        dpdpConsentAt: data.dpdpConsentAt,
        dpdpConsentVersion: data.dpdpConsentVersion,
      },
    });

    const nextStatus = await getHelperStatus(session.user.id);

    return NextResponse.json(
      {
        ...nextStatus,
        id: createdProfile.id,
        status: "pending",
        message: existingProfile
          ? "Application resubmitted successfully. Verification is in progress."
          : "Application submitted successfully. Verification in progress.",
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Onboarding submission error:", error);
    return NextResponse.json(
      {
        message: "Server error during onboarding submission",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
