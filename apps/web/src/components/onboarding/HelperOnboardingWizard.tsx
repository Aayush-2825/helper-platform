"use client";

import { useState } from "react";
import { useOnboardingForm, clearOnboardingDraft } from "@/lib/hooks/useOnboardingForm";
import { completeOnboardingSchema, CompleteOnboarding } from "@/lib/schemas/helper-onboarding";
import { Step0RoleSelection } from "./steps/Step0RoleSelection";
import { Step1BasicInfo } from "./steps/Step1BasicInfo";
import { Step2ServiceDetails } from "./steps/Step2ServiceDetails";
import { Step3PricingAvailability } from "./steps/Step3PricingAvailability";
import { Step5BankPayout } from "./steps/Step5BankPayout";
import { Step6FinalReview } from "./steps/Step6FinalReview";
import { Button } from "@/components/ui/button";
import { Save, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Step4KYCVerification } from "./steps/Step4KYCVerification";
import { FieldPath } from "react-hook-form";

const TOTAL_STEPS = 7; // 0-6

type OnboardingFieldPath = FieldPath<CompleteOnboarding>;

function getStepFieldPaths(step: number, isIndividual: boolean): OnboardingFieldPath[] {
  switch (step) {
    case 0:
      return ["helperType"];
    case 1:
      return isIndividual
        ? ["fullName", "phone", "city"]
        : ["businessName", "ownerName", "phone", "email", "businessAddress", "city"];
    case 2:
      return isIndividual
        ? ["primaryCategory", "yearsExperience", "serviceRadiusKm"]
        : [
            "primaryCategory",
            "yearsExperience",
            "serviceRadiusKm",
            "numberOfWorkers",
            "workerTypesOffered",
          ];
    case 3:
      return ["pricingType", "workingHours.start", "workingHours.end", "availableDays"];
    case 4:
      return isIndividual
        ? ["idDocumentType", "idDocumentNumber", "idDocumentUrl"]
        : [
            "businessRegistrationUrl",
            "ownerIdDocumentType",
            "ownerIdDocumentUrl",
            "workerDeclarationAgreed",
          ];
    case 5:
      return ["accountHolderName", "bankAccountNumber", "ifscCode"];
    case 6:
      return ["agreedToTerms", "agreedToCommission"];
    default:
      return [];
  }
}

function getStepTitle(step: number): string {
  const titles = [
    "Choose Your Role",
    "Basic Information",
    "Your Services",
    "Pricing & Availability",
    "Identity Verification",
    "Payout Details",
    "Review & Submit",
  ];
  return titles[step] || "";
}

interface HelperOnboardingWizardProps {
  onSuccess?: (data: CompleteOnboarding) => void;
  onCancel?: () => void;
}

/**
 * Main Helper Onboarding Wizard Component
 * Orchestrates multi-step form with localStorage persistence
 * Mobile-first design with progress tracking
 */
export function HelperOnboardingWizard({
  onSuccess,
  onCancel,
}: HelperOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with auto-save to localStorage
  const form = useOnboardingForm<CompleteOnboarding>({
    schema: completeOnboardingSchema,
    mode: "onChange",
    defaultValues: {
      currentStep: 0,
      completedSteps: [],
      helperType: "individual",
      pricingType: "fixed",
      isOnline: false,
      canAssignJobsInternally: true,
      phoneVerified: false,
      agreedToTerms: false,
      agreedToCommission: false,
      workingHours: { start: "09:00", end: "18:00" },
      availableDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      languages: ["english"],
      serviceRadiusKm: 8,
      yearsExperience: 0,
    },
  });

  const isIndividual = form.watch("helperType") === "individual";
  const watchedValues = form.watch();

  const validateStep = async (step: number, shouldFocus = false) => {
    const fields = getStepFieldPaths(step, isIndividual);
    return form.trigger(fields, { shouldFocus });
  };

  // Validate and move to next step
  const goToNextStep = async () => {
    let isValid = false;

    // Validate current step
    switch (currentStep) {
      case 0:
        isValid = await validateStep(0, true);
        break;
      case 1:
        isValid = await validateStep(1, true);
        break;
      case 2:
        isValid = await validateStep(2, true);
        break;
      case 3:
        isValid = await validateStep(3, true);
        break;
      case 4:
        isValid = await validateStep(4, true);
        break;
      case 5:
        isValid = await validateStep(5, true);
        break;
      case 6:
        isValid = await validateStep(6, true);
        break;
      default:
        isValid = true;
    }

    if (isValid) {
      if (currentStep < TOTAL_STEPS - 1) {
        setCurrentStep(currentStep + 1);
        // Auto-save the fact that this step is completed
        const completedSteps = new Set(watchedValues.completedSteps || []);
        completedSteps.add(currentStep);
        form.setValue("completedSteps", Array.from(completedSteps));
        form.saveToStorage(form.getValues());
      }
    } else {
      toast.error("Please fill all required fields");
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    for (let step = 0; step < TOTAL_STEPS; step++) {
      const isStepValid = await validateStep(step, false);

      if (!isStepValid) {
        if (step !== currentStep) {
          setCurrentStep(step);
        }

        // Wait for step UI to render, then focus first invalid field in that step.
        setTimeout(() => {
          void validateStep(step, true);
        }, 0);

        toast.error(`Please fix errors in ${getStepTitle(step)}`);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const formData = form.getValues();

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(formData);
      } else {
        // Default: log and show success
        console.log("Onboarding data:", formData);
        toast.success("✓ Application submitted successfully! You'll hear from us soon.");
        
        // Clear localStorage after successful submit
        clearOnboardingDraft();
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "Are you sure? Your progress is saved. You can continue later whenever you want."
      )
    ) {
      if (onCancel) onCancel();
    }
  };

  const progressPercentage = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
      {/* Header with Progress */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-4 sm:px-6 lg:px-8">
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">
                  {getStepTitle(currentStep)}
                </h2>
                <p className="text-xs text-gray-500">
                  Step {currentStep + 1} of {TOTAL_STEPS}
                </p>
              </div>
              <div className="text-sm font-medium text-gray-600">
                {progressPercentage}%
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-blue-500 to-blue-600 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Step Indicators */}
          <div className="hidden sm:flex gap-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className="flex-1 h-1 rounded-full overflow-hidden bg-gray-100">
                <div
                  className={`h-full transition-all ${
                    i < currentStep
                      ? "bg-blue-500"
                      : i === currentStep
                      ? "bg-blue-600"
                      : "bg-gray-100"
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Mobile Step Counter */}
          <div className="sm:hidden text-center text-xs text-gray-500">
            {currentStep + 1} / {TOTAL_STEPS}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Form Container */}
        <div className="bg-white rounded-lg">
          {currentStep === 0 && <Step0RoleSelection form={form} />}
          {currentStep === 1 && (
            <Step1BasicInfo form={form} />
          )}
          {currentStep === 2 && (
            <Step2ServiceDetails form={form} isIndividual={isIndividual} />
          )}
          {currentStep === 3 && <Step3PricingAvailability form={form} />}
          {currentStep === 4 && (
            <Step4KYCVerification form={form} isIndividual={isIndividual} />
          )}
          {currentStep === 5 && <Step5BankPayout form={form} />}
          {currentStep === 6 && (
            <Step6FinalReview form={form} isIndividual={isIndividual} />
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          {currentStep === 0 ? (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={goToPreviousStep}
              className="w-full sm:w-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}

          {currentStep === TOTAL_STEPS - 1 ? (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          ) : (
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => form.saveToStorage(form.getValues())}
                className="flex-1 sm:flex-none"
                title="Save progress to browser"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                onClick={goToNextStep}
                className="flex-1 sm:flex-none"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Save Status */}
        {form.hasStoredData && (
          <div className="mt-4 text-center text-xs text-gray-500">
            ✓ Progress auto-saved to your browser
          </div>
        )}
      </div>

      {/* Floating Help Badge */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6">
        <button
          onClick={() => toast.info("Need help? Contact support@helperplatform.com")}
          className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-colors"
          title="Help & Support"
        >
          ?
        </button>
      </div>
    </div>
  );
}
