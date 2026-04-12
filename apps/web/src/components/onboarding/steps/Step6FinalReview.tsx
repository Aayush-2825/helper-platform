"use client";

import { UseFormReturn, FieldValues, type FieldPath } from "react-hook-form";
import { Check, AlertCircle } from "lucide-react";

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
  const { watch, register, formState } = form;
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
            <h3 className="font-semibold text-gray-900">👤 Profile Information</h3>
          </div>
          <div className="p-4 space-y-2 text-sm">
            {isIndividual ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{formData.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">+91 {formData.phone}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Business:</span>
                  <span className="font-medium text-gray-900">{formData.businessName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Owner:</span>
                  <span className="font-medium text-gray-900">{formData.ownerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">+91 {formData.phone}</span>
                </div>
              </>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">City:</span>
              <span className="font-medium text-gray-900">{formData.city}</span>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b">
            <h3 className="font-semibold text-gray-900">🔧 Services</h3>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Primary Category:</span>
              <span className="font-medium text-gray-900">
                {getServiceLabel(formData.primaryCategory)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Years of Experience:</span>
              <span className="font-medium text-gray-900">{formData.yearsExperience} years</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Radius:</span>
              <span className="font-medium text-gray-900">{formData.serviceRadiusKm} km</span>
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
            <h3 className="font-semibold text-gray-900">💰 Pricing & Availability</h3>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Pricing Type:</span>
              <span className="font-medium text-gray-900 capitalize">{formData.pricingType}</span>
            </div>
            {formData.basePrice && (
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Base {formData.pricingType === "fixed" ? "Price" : "Rate"}:
                </span>
                <span className="font-medium text-gray-900">₹{formData.basePrice}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Working Hours:</span>
              <span className="font-medium text-gray-900">
                {formData.workingHours?.start} - {formData.workingHours?.end}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${formData.isOnline ? "text-green-600" : "text-gray-500"}`}>
                {formData.isOnline ? "🟢 Online" : "⚫ Offline"}
              </span>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                ⏳ Pending Verification
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
        <label className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            {...register("agreedToTerms" as FieldPath<T>)}
            className="mt-1 rounded"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              I agree to Terms of Service and Privacy Policy
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Read our{" "}
              <a href="#" className="text-blue-600 hover:underline">
                terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                privacy policy
              </a>
            </p>
          </div>
        </label>
        {errors.agreedToTerms && (
          <p className="text-xs text-red-500">{errors.agreedToTerms.message as string}</p>
        )}

        <label className="flex items-start space-x-3 rounded-lg border border-gray-200 p-4 cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            {...register("agreedToCommission" as FieldPath<T>)}
            className="mt-1 rounded"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">
              I accept the commission structure (10-25% varies by service)
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Different services have different commission rates. You will see exact details in your dashboard.
            </p>
          </div>
        </label>
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
