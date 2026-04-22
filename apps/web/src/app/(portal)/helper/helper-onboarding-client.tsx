"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { HelperOnboardingWizard } from "@/components/onboarding/HelperOnboardingWizard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { type CompleteOnboarding, clearOnboardingDraft } from "@/types/onboarding";

interface DraftState {
  step_index: number;
  payload: Partial<CompleteOnboarding>;
}

function appendFormDataValue(formData: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) {
    return;
  }

  if (value instanceof File) {
    if (value.size > 0) {
      formData.append(key, value);
    }
    return;
  }

  if (Array.isArray(value) || (typeof value === "object" && !(value instanceof Date))) {
    formData.append(key, JSON.stringify(value));
    return;
  }

  if (typeof value === "boolean" || typeof value === "number") {
    formData.append(key, String(value));
    return;
  }

  const text = String(value).trim();
  if (text.length > 0) {
    formData.append(key, text);
  }
}

function buildOnboardingFormData(data: CompleteOnboarding) {
  const formData = new FormData();

  appendFormDataValue(formData, "helperType", data.helperType);
  appendFormDataValue(formData, "fullName", data.fullName);
  appendFormDataValue(formData, "businessName", data.businessName);
  appendFormDataValue(formData, "ownerName", data.ownerName);
  appendFormDataValue(formData, "phone", data.phone);
  appendFormDataValue(formData, "email", data.email);
  appendFormDataValue(formData, "businessAddress", data.businessAddress);
  appendFormDataValue(formData, "city", data.city);
  appendFormDataValue(formData, "profilePhotoUrl", data.profilePhotoUrl);
  appendFormDataValue(formData, "logoUrl", data.logoUrl);
  appendFormDataValue(formData, "primaryCategory", data.primaryCategory);
  appendFormDataValue(formData, "yearsExperience", data.yearsExperience);
  appendFormDataValue(formData, "bio", data.bio);
  appendFormDataValue(formData, "languages", data.languages);
  appendFormDataValue(formData, "serviceRadiusKm", data.serviceRadiusKm);
  appendFormDataValue(formData, "numberOfWorkers", data.numberOfWorkers);
  appendFormDataValue(formData, "workerTypesOffered", data.workerTypesOffered);
  appendFormDataValue(formData, "canAssignJobsInternally", data.canAssignJobsInternally);
  appendFormDataValue(formData, "pricingType", data.pricingType);
  appendFormDataValue(formData, "basePrice", data.basePrice);
  appendFormDataValue(formData, "isOnline", data.isOnline);
  appendFormDataValue(formData, "workingHours", data.workingHours);
  appendFormDataValue(formData, "availableDays", data.availableDays);
  appendFormDataValue(formData, "idDocumentType", data.idDocumentType);
  appendFormDataValue(formData, "idDocumentNumber", data.idDocumentNumber);
  appendFormDataValue(formData, "idDocumentUrl", data.idDocumentUrl);
  appendFormDataValue(formData, "selfieUrl", data.selfieUrl);
  appendFormDataValue(formData, "addressProofUrl", data.addressProofUrl);
  appendFormDataValue(formData, "businessRegistrationUrl", data.businessRegistrationUrl);
  appendFormDataValue(formData, "gstNumber", data.gstNumber);
  appendFormDataValue(formData, "gstDocumentUrl", data.gstDocumentUrl);
  appendFormDataValue(formData, "ownerIdDocumentType", data.ownerIdDocumentType);
  appendFormDataValue(formData, "ownerIdDocumentUrl", data.ownerIdDocumentUrl);
  appendFormDataValue(formData, "workerDeclarationAgreed", data.workerDeclarationAgreed);
  appendFormDataValue(formData, "accountHolderName", data.accountHolderName);
  appendFormDataValue(formData, "bankAccountNumber", data.bankAccountNumber);
  appendFormDataValue(formData, "ifscCode", data.ifscCode);
  appendFormDataValue(formData, "upiId", data.upiId);
  appendFormDataValue(formData, "agreedToTerms", data.agreedToTerms);
  appendFormDataValue(formData, "agreedToCommission", data.agreedToCommission);

  return formData;
}

function getStringProp(obj: unknown, key: string): string | null {
  if (!obj || typeof obj !== "object") return null;
  const value = (obj as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

export function HelperOnboardingClientPage({ initialDraft }: { initialDraft: DraftState | null }) {
  const router = useRouter();
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  async function handleSubmit(data: CompleteOnboarding) {
    setSubmissionError(null);

    const res = await fetch("/api/helpers/onboarding", {
      method: "POST",
      body: buildOnboardingFormData(data),
    });

    const json: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      const message = getStringProp(json, "message") ?? `Request failed with status ${res.status}`;
      setSubmissionError(message);
      throw new Error(message);
    }

    clearOnboardingDraft();
    await fetch("/api/helpers/onboarding/draft", {
      method: "DELETE",
      credentials: "include",
    }).catch(() => null);

    const landingPath = getStringProp(json, "landingPath");
    if (landingPath) {
      window.location.assign(landingPath);
      return;
    }

    const id = getStringProp(json, "id");
    if (id) {
      window.location.assign(`/helper/verification-pending?id=${encodeURIComponent(id)}`);
      return;
    }

    router.refresh();
  }

  return (
    <div className="relative">
      {submissionError ? (
        <div className="sticky top-3 z-50 mx-auto max-w-2xl px-4 pt-4 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to submit onboarding</AlertTitle>
            <AlertDescription>{submissionError}</AlertDescription>
          </Alert>
        </div>
      ) : null}

      <HelperOnboardingWizard
        initialStep={initialDraft?.step_index ?? 0}
        initialPayload={initialDraft?.payload ?? undefined}
        onSuccess={handleSubmit}
        onCancel={() => {
          router.push("/account/settings");
        }}
      />
    </div>
  );
}
