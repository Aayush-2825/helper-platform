"use client";

import { UseFormReturn, FieldValues, Controller } from "react-hook-form";
import { useState } from "react";
import { FormField } from "@repo/ui/components/ui/form-field";
import { Label } from "@repo/ui/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/ui/toggle-group";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { FileUploadField } from "../FileUploadField";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import KYCChecklist from "../ui/KYCChecklist";
import KYCConsentModal from "../ui/KYCConsentModal";
import { useUploadFocus } from "../ui/UploadFocusContext";

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

  const idDocumentTypeErrorId = "idDocumentType-error";
  const ownerIdDocumentTypeErrorId = "ownerIdDocumentType-error";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dpdpConsentGiven = Boolean(form.watch("dpdpConsentGiven" as any));

  const [consentOpen, setConsentOpen] = useState(!dpdpConsentGiven);

  const handleConfirmConsent = (version: string) => {
    const timestamp = new Date().toISOString();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (form.setValue as any)("dpdpConsentGiven", true, { shouldDirty: true, shouldValidate: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (form.setValue as any)("dpdpConsentAt", timestamp, { shouldDirty: true, shouldValidate: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (form.setValue as any)("dpdpConsentVersion", version, { shouldDirty: true, shouldValidate: true });
  };

  const uploadFocus = (() => {
    try {
      return useUploadFocus();
    } catch (e) {
      return null;
    }
  })();

  return (
    <div className="space-y-6">
      <KYCConsentModal open={consentOpen} onClose={() => setConsentOpen(false)} onConfirm={handleConfirmConsent} />
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          <ShieldCheck className="mr-2 inline h-6 w-6 text-primary" />
          Identity verification
        </h1>
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
                <ToggleGroup
                  id="idDocumentType"
                  multiple={false}
                  variant="outline"
                  value={typeof field.value === "string" && field.value.length > 0 ? [field.value] : []}
                  onValueChange={(values) => field.onChange(values[0] ?? "")}
                  aria-invalid={!!error?.message}
                  aria-describedby={error?.message ? idDocumentTypeErrorId : undefined}
                  className="mt-2 grid w-full grid-cols-2 gap-2"
                >
                  {ID_TYPES.map((type) => (
                    <ToggleGroupItem
                      key={type.value}
                      value={type.value}
                      className="h-auto min-h-11 w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-medium text-foreground data-pressed:border-primary data-pressed:bg-primary/10 data-pressed:text-primary"
                    >
                      {type.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                {error?.message && (
                  <p id={idDocumentTypeErrorId} className="mt-1 text-xs text-destructive" role="alert">{error.message}</p>
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
            uploadId="id"
            label="ID Document (Front & Back or Single Page)"
            accept="image/*,application/pdf"
            maxSize={5}
            category="kyc"
          />


          <FileUploadField
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={"addressProofUrl" as any}
            uploadId="address"
            label="Address Proof (Optional)"
            accept="image/*,application/pdf"
            maxSize={5}
            category="kyc"
          />

          <div className="mt-4">
            <KYCChecklist
              items={[
                { id: "id", label: "Government ID", fileKey: form.getValues("idDocumentUrl" as any) },
                { id: "selfie", label: "Selfie with ID", fileKey: form.getValues("selfieUrl" as any), optional: true },
                { id: "address", label: "Address Proof", fileKey: form.getValues("addressProofUrl" as any), optional: true },
              ]}
                onRequestReupload={(id) => {
                  toast(`Please re-upload the document: ${id}`);
                  try {
                    uploadFocus?.focus(id);
                  } catch (e) {}
                }}
            />
          </div>
        </>
      ) : (
        <>
          <FileUploadField
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={"businessRegistrationUrl" as any}
            uploadId="businessReg"
            label="Business Registration Document"
            accept="image/*,application/pdf"
            maxSize={5}
            category="kyc"
            required
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
              uploadId="gst"
              label="GST Certificate"
              accept="image/*,application/pdf"
              maxSize={5}
              category="kyc"
            />
          )}

          <Controller
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={"ownerIdDocumentType" as any}
            render={({ field, fieldState: { error } }) => (
              <div>
                <Label htmlFor="ownerIdDocumentType">Owner/Manager ID Type</Label>
                <ToggleGroup
                  id="ownerIdDocumentType"
                  multiple={false}
                  variant="outline"
                  value={typeof field.value === "string" && field.value.length > 0 ? [field.value] : []}
                  onValueChange={(values) => field.onChange(values[0] ?? "")}
                  aria-invalid={!!error?.message}
                  aria-describedby={error?.message ? ownerIdDocumentTypeErrorId : undefined}
                  className="mt-2 grid w-full grid-cols-2 gap-2"
                >
                  {ID_TYPES.map((type) => (
                    <ToggleGroupItem
                      key={type.value}
                      value={type.value}
                      className="h-auto min-h-11 w-full rounded-lg border-2 border-border px-3 py-2 text-sm font-medium text-foreground data-pressed:border-primary data-pressed:bg-primary/10 data-pressed:text-primary"
                    >
                      {type.label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                {error?.message && (
                  <p id={ownerIdDocumentTypeErrorId} className="mt-1 text-xs text-destructive" role="alert">{error.message}</p>
                )}
              </div>
            )}
          />

          <FileUploadField
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={"ownerIdDocumentUrl" as any}
            uploadId="ownerId"
            label="Owner/Manager ID Document"
            accept="image/*,application/pdf"
            maxSize={5}
            category="kyc"
            required
          />

          <div className="mt-4">
            <KYCChecklist
              items={[
                { id: "businessReg", label: "Business Registration", fileKey: form.getValues("businessRegistrationUrl" as any) },
                { id: "ownerId", label: "Owner ID", fileKey: form.getValues("ownerIdDocumentUrl" as any) },
                { id: "gst", label: "GST Certificate", fileKey: form.getValues("gstDocumentUrl" as any), optional: true },
              ]}
              onRequestReupload={(id) => {
                toast(`Please re-upload the document: ${id}`);
                try {
                  uploadFocus?.focus(id);
                } catch (e) {}
              }}
            />
          </div>

          <Controller
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={"workerDeclarationAgreed" as any}
            render={({ field }) => (
              <label
                htmlFor="workerDeclarationAgreed"
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-3"
              >
                <Checkbox
                  id="workerDeclarationAgreed"
                  checked={field.value || false}
                  onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    I certify that all workers on my team have verified their identity
                  </p>
                </div>
              </label>
            )}
          />
          {errors.workerDeclarationAgreed && (
            <p className="text-xs text-destructive" role="alert">
              {errors.workerDeclarationAgreed.message as string}
            </p>
          )}
        </>
      )}

    </div>
  );
}
