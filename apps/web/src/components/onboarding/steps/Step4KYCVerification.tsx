"use client";

import { UseFormReturn, FieldValues, Controller } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { FileUploadField } from "../FileUploadField";
import { AlertCircle, ShieldCheck } from "lucide-react";

interface Step4KYCVerificationProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  isIndividual: boolean;
}

/**
 * Step 4: KYC & Verification
 * Collect government ID, selfie, address proof (individual)
 * Business registration, GST, owner ID (agency)
 */
export function Step4KYCVerification<T extends FieldValues>({
  form,
  isIndividual,
}: Step4KYCVerificationProps<T>) {
  const { control, formState } = form;
  const { errors } = formState;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gstNumber = form.watch("gstNumber" as any);

  const ID_TYPES = [
    { value: "aadhar", label: "Aadhar Card" },
    { value: "pan", label: "PAN Card" },
    { value: "driving_license", label: "Driving License" },
    { value: "passport", label: "Passport" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          <ShieldCheck className="inline h-6 w-6 mr-2 text-green-600" />
          Identity Verification
        </h1>
        <p className="mt-2 text-gray-600">
          Help us verify your identity to build trust with customers
        </p>
      </div>

      <div className="rounded-lg bg-green-50 border border-green-200 p-4">
        <div className="flex gap-3">
          <ShieldCheck className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-green-900">
              Verified badge increases job chances by 3x
            </p>
            <p className="text-xs text-green-700 mt-1">
              Your documents are encrypted and reviewed securely
            </p>
          </div>
        </div>
      </div>

      {isIndividual ? (
        <>
          <Controller
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={"idDocumentType" as any}
            render={({ field, fieldState: { error } }) => (
              <div>
                <Label htmlFor="idDocumentType">Government ID Type</Label>
                <select
                  id="idDocumentType"
                  {...field}
                  className="w-full mt-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">Select ID type...</option>
                  {ID_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {error?.message && (
                  <p className="mt-1 text-xs text-red-500">{error.message}</p>
                )}
              </div>
            )}
          />

          <Controller
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={"idDocumentNumber" as any}
            render={({ field, fieldState: { error } }) => (
              <FormField
                {...field}
                id="idDocumentNumber"
                placeholder="1234 5678 9012"
                label="Document Number"
                error={error?.message}
                helperText="The unique identifier on your document"
                required
              />
            )}
          />

          <FileUploadField
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={"idDocumentUrl" as any}
            label="ID Document (Front & Back or Single Page)"
            accept="image/*,application/pdf"
            maxSize={5}
            hint="Clear photos showing all visible text and security features"
          />

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-sm text-blue-900">
              <AlertCircle className="inline h-4 w-4 mr-2" />
              <strong>Optional:</strong> Upload a selfie holding your ID for instant verification
            </p>
          </div>

          <FileUploadField
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={"addressProofUrl" as any}
            label="Address Proof (Optional)"
            accept="image/*,application/pdf"
            maxSize={5}
            hint="Recent document with your name and address"
          />
        </>
      ) : (
        <>
          <FileUploadField
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={"businessRegistrationUrl" as any}
            label="Business Registration Document"
            accept="image/*,application/pdf"
            maxSize={5}
            required
            hint="Company registration certificate, LLC, or partnership deed"
          />

          <Controller
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={"gstNumber" as any}
            render={({ field, fieldState: { error } }) => (
              <FormField
                {...field}
                id="gstNumber"
                placeholder="29ABCDE1234F1Z5"
                label="GST Number (Optional)"
                error={error?.message}
                helperText="15-character GST number if registered"
              />
            )}
          />

          {gstNumber && (
            <FileUploadField
              control={control}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              name={"gstDocumentUrl" as any}
              label="GST Certificate"
              accept="image/*,application/pdf"
              maxSize={5}
              hint="GST registration certificate or acknowledgment"
            />
          )}

          <Controller
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={"ownerIdDocumentType" as any}
            render={({ field }) => (
              <div>
                <Label htmlFor="ownerIdDocumentType">Owner/Manager ID Type</Label>
                <select
                  id="ownerIdDocumentType"
                  {...field}
                  className="w-full mt-2 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="">Select ID type...</option>
                  {ID_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          />

          <FileUploadField
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={"ownerIdDocumentUrl" as any}
            label="Owner/Manager ID Document"
            accept="image/*,application/pdf"
            maxSize={5}
            required
            hint="Clear photos of the owner's government-issued ID"
          />

          <Controller
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={"workerDeclarationAgreed" as any}
            render={({ field }) => (
              <label className="flex items-start space-x-3 rounded-lg border border-gray-200 p-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="mt-1 rounded"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    I certify that all workers on my team have verified their identity
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    We will verify this during onboarding completion
                  </p>
                </div>
              </label>
            )}
          />
          {errors.workerDeclarationAgreed && (
            <p className="text-xs text-red-500">
              {errors.workerDeclarationAgreed.message as string}
            </p>
          )}
        </>
      )}

      <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
        <p className="text-xs text-gray-700">
          <strong>Timeline:</strong> Verification typically completes within 24-48 hours. You will receive updates via email.
        </p>
      </div>
    </div>
  );
}
