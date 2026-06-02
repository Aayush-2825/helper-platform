"use client";

import { UseFormReturn, FieldValues, Controller, type FieldPath } from "react-hook-form";
import { FormField } from "@repo/ui/components/ui/form-field";
import { FileUploadField } from "../FileUploadField";
import { Phone, Mail, MapPin } from "lucide-react";

interface Step1BasicInfoProps<T extends FieldValues> {
  form: UseFormReturn<T>;
}

/**
 * Step 1: Basic Information
 * Collect personal/business information depending on helper type
 */
export function Step1BasicInfo<T extends FieldValues>({
  form,
}: Step1BasicInfoProps<T>) {
  const { control, watch } = form;
  const isIndividual = watch("helperType" as FieldPath<T>) === "individual";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isIndividual ? "Your profile details" : "Business details"}
        </h1>
        <p className="mt-2 text-gray-600">
          {isIndividual
            ? "Provide your name, contact, and a profile photo so customers can recognize you."
            : "Provide business and contact details so customers can reach your team."}
        </p>
      </div>

      <div className="space-y-4">
      {isIndividual ? (
        // Individual Fields
        <>
          <Controller
            control={control}
            name={"fullName" as FieldPath<T>}
            render={({ field, fieldState: { error } }) => (
              <FormField
                {...field}
                label="Full Name"
                placeholder="John Doe"
                error={error?.message}
                required
              />
            )}
          />

          <Controller
            control={control}
            name={"phone" as FieldPath<T>}
            render={({ field, fieldState: { error } }) => (
              <FormField
                {...field}
                label="Phone Number"
                placeholder="9876543210"
                maxLength={10}
                error={error?.message}
                icon={<Phone className="h-4 w-4" />}
                helperText="10-digit Indian mobile number."
                required
              />
            )}
          />

          <Controller
            control={control}
            name={"email" as FieldPath<T>}
            render={({ field }) => (
              <FormField
                {...field}
                label="Email (optional)"
                type="email"
                placeholder="hello@example.com"
                icon={<Mail className="h-4 w-4" />}
                helperText="Used for account recovery and important notifications"
              />
            )}
          />

          <Controller
            control={control}
            name={"city" as FieldPath<T>}
            render={({ field, fieldState: { error } }) => (
              <FormField
                {...field}
                label="City"
                placeholder="Mumbai"
                error={error?.message}
                icon={<MapPin className="h-4 w-4" />}
                required
              />
            )}
          />

          <FileUploadField
            control={control}
            name={"profilePhotoUrl" as FieldPath<T>}
            label="Profile Photo"
            accept="image/*"
            maxSize={3}
            category="image"
            hint="Upload a clear, recent headshot. Use a plain background and face-forward photo."
          />
        </>
      ) : (
        // Agency Fields
        <>
          <Controller
            control={control}
            name={"businessName" as FieldPath<T>}
            render={({ field, fieldState: { error } }) => (
              <FormField
                {...field}
                label="Business Name"
                placeholder="ABC Services Pvt. Ltd."
                error={error?.message}
                required
              />
            )}
          />

          <Controller
            control={control}
            name={"ownerName" as FieldPath<T>}
            render={({ field, fieldState: { error } }) => (
              <FormField
                {...field}
                label="Owner / Manager Name"
                placeholder="John Doe"
                error={error?.message}
                required
              />
            )}
          />

          <Controller
            control={control}
            name={"phone" as FieldPath<T>}
            render={({ field, fieldState: { error } }) => (
              <FormField
                {...field}
                label="Business Phone Number"
                placeholder="9876543210"
                maxLength={10}
                error={error?.message}
                icon={<Phone className="h-4 w-4" />}
                helperText="10-digit Indian mobile number."
                required
              />
            )}
          />

          <Controller
            control={control}
            name={"email" as FieldPath<T>}
            render={({ field, fieldState: { error } }) => (
              <FormField
                {...field}
                label="Business Email"
                type="email"
                placeholder="hello@example.com"
                error={error?.message}
                icon={<Mail className="h-4 w-4" />}
                required
              />
            )}
          />

          <Controller
            control={control}
            name={"businessAddress" as FieldPath<T>}
            render={({ field, fieldState: { error } }) => (
              <FormField
                {...field}
                label="Business Address"
                placeholder="123 Market Street, Floor 2"
                error={error?.message}
                required
              />
            )}
          />

          <Controller
            control={control}
            name={"city" as FieldPath<T>}
            render={({ field, fieldState: { error } }) => (
              <FormField
                {...field}
                label="City"
                placeholder="Mumbai"
                error={error?.message}
                icon={<MapPin className="h-4 w-4" />}
                required
              />
            )}
          />

          <FileUploadField
            control={control}
            name={"logoUrl" as FieldPath<T>}
            label="Company Logo"
            accept="image/*"
            maxSize={3}
            category="image"
            hint="Upload your company logo (optional but recommended). Min 512x512px for best quality."
          />
        </>
      )}
      </div>
    </div>
  );
}
