"use client";

import Link from "next/link";
import { Controller, UseFormReturn, FieldValues, type FieldPath } from "react-hook-form";
import { Check, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface Step6FinalReviewProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  isIndividual: boolean;
}

/**
 * Step 6: Final Review & Submit
 * Show summary and collect terms agreement before final submission
 */
export function Step6FinalReview<T extends FieldValues>({
  form,
  isIndividual,
}: Step6FinalReviewProps<T>) {
  const { watch, control, formState } = form;
  const { errors } = formState;
  
  const formData = watch();

  const getServiceLabel = (cat: string) => {
    const labels: Record<string, string> = {
      driver: "Driver",
      electrician: "Electrician",
      plumber: "Plumber",
      cleaner: "Cleaner",
      chef: "Chef",
      tutor: "Tutor",
      delivery_helper: "Delivery Helper",
      caretaker: "Caretaker",
      security_guard: "Security Guard",
    };
    return labels[cat] || cat;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Review & Verify
        </h1>
        <p className="mt-2 text-gray-600">
          Please review your information before submitting for verification
        </p>
      </div>

      {/* Summary Cards */}
      <div className="space-y-4">
        {/* Profile Section */}
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-900">Profile Information</h3>
          </div>
          <div className="p-4 space-y-2 text-sm">
            {isIndividual ? (
              <>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900 sm:text-right">{formData.fullName}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900 sm:text-right">+91 {formData.phone}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-gray-600">Business:</span>
                  <span className="font-medium text-gray-900 sm:text-right">{formData.businessName}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-gray-600">Owner:</span>
                  <span className="font-medium text-gray-900 sm:text-right">{formData.ownerName}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900 sm:text-right">+91 {formData.phone}</span>
                </div>
              </>
            )}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-gray-600">City:</span>
              <span className="font-medium text-gray-900 sm:text-right">{formData.city}</span>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-900">Services</h3>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-gray-600">Primary Category:</span>
              <span className="font-medium text-gray-900 sm:text-right">
                {getServiceLabel(formData.primaryCategory)}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-gray-600">Years of Experience:</span>
              <span className="font-medium text-gray-900 sm:text-right">{formData.yearsExperience} years</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-gray-600">Service Radius:</span>
              <span className="font-medium text-gray-900 sm:text-right">{formData.serviceRadiusKm} km</span>
            </div>
            {formData.bio && (
              <div>
                <span className="text-gray-600 block mb-1">Bio:</span>
                <p className="text-gray-900 italic">{formData.bio}</p>
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Availability Section */}
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-900">Pricing & Availability</h3>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-gray-600">Pricing Type:</span>
              <span className="font-medium text-gray-900 capitalize sm:text-right">{formData.pricingType}</span>
            </div>
            {formData.basePrice && (
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-600">
                  Base {formData.pricingType === "fixed" ? "Price" : "Rate"}:
                </span>
                <span className="font-medium text-gray-900 sm:text-right">₹{formData.basePrice}</span>
              </div>
            )}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-gray-600">Working Hours:</span>
              <span className="font-medium text-gray-900 sm:text-right">
                {formData.workingHours?.start} - {formData.workingHours?.end}
              </span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium sm:text-right ${formData.isOnline ? "text-green-600" : "text-gray-500"}`}>
                {formData.isOnline ? "🟢 Online" : "⚫ Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Pending Verification
              </p>
              <p className="text-xs text-amber-700 mt-1">
                Your profile will be reviewed within 24-48 hours. You will receive email updates on the status.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Agreements */}
      <div className="space-y-3">
        <Controller
          control={control}
          name={"agreedToTerms" as FieldPath<T>}
          render={({ field }) => (
            <label
              htmlFor="agreedToTerms"
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <Checkbox
                id="agreedToTerms"
                checked={Boolean(field.value)}
                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  I agree to Terms of Service and Privacy Policy
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Read our{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline">
                    terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    privacy policy
                  </Link>
                </p>
              </div>
            </label>
          )}
        />
        {errors.agreedToTerms && (
          <p className="text-xs text-red-500">{errors.agreedToTerms.message as string}</p>
        )}

        <Controller
          control={control}
          name={"agreedToCommission" as FieldPath<T>}
          render={({ field }) => (
            <label
              htmlFor="agreedToCommission"
              className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
            >
              <Checkbox
                id="agreedToCommission"
                checked={Boolean(field.value)}
                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                className="mt-1"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  I accept the commission structure (10-25% varies by service)
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Different services have different commission rates. You will see exact details in your dashboard.
                </p>
              </div>
            </label>
          )}
        />
        {errors.agreedToCommission && (
          <p className="text-xs text-red-500">{errors.agreedToCommission.message as string}</p>
        )}
      </div>

      {/* Final CTA */}
      <div className="rounded-lg bg-green-50 border border-green-200 p-4">
        <p className="text-sm text-green-900">
          <Check className="inline h-4 w-4 mr-1" />
          <strong>You are all set!</strong> Submit your application and start receiving bookings once verified.
        </p>
      </div>
    </div>
  );
}
