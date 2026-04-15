"use client";

import { useController, UseFormReturn, FieldValues, type FieldPath } from "react-hook-form";
import { Building2, UserCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface Step0RoleSelectionProps<T extends FieldValues> {
  form: UseFormReturn<T>;
}

/**
 * Step 0: Role Selection
 * Let user choose between Individual Helper or Agency/Organization
 */
export function Step0RoleSelection<T extends FieldValues>({
  form,
}: Step0RoleSelectionProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({
    control: form.control,
    name: "helperType" as FieldPath<T>,
  });
  const selectedHelperType =
    field.value === "agency" || field.value === "individual"
      ? field.value
      : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Get Started as a Helper</h1>
        <p className="mt-2 text-gray-600">Choose how you want to work with us</p>
      </div>

      <fieldset>
        <legend className="sr-only">How do you want to join?</legend>
        <RadioGroup
          value={selectedHelperType}
          onValueChange={(value) => field.onChange(value)}
          aria-label="Choose helper account type"
          aria-invalid={error ? true : undefined}
          className="grid gap-4 sm:grid-cols-2"
        >
          <label
            htmlFor="helperType-individual"
            className={cn(
              "group relative cursor-pointer rounded-lg border-2 p-6 text-left transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
              field.value === "individual"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            <RadioGroupItem
              id="helperType-individual"
              value="individual"
              className="absolute right-3 top-3 border-2 border-gray-300 data-checked:border-blue-500 data-checked:bg-blue-500"
            />
            <div
              className={cn(
                "mb-4 inline-flex rounded-full p-3",
                field.value === "individual" ? "bg-blue-100" : "bg-gray-100"
              )}
            >
              <UserCircle
                className={cn(
                  "h-6 w-6",
                  field.value === "individual" ? "text-blue-600" : "text-gray-600"
                )}
              />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">Individual Helper</h2>
            <p className="mt-2 text-sm text-gray-600">
              Work independently and accept jobs directly. Perfect for freelancers and independent service providers.
            </p>

            <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
              <span>Get Started</span>
              <span className="ml-2">&rarr;</span>
            </div>
          </label>

          <label
            htmlFor="helperType-agency"
            className={cn(
              "group relative cursor-pointer rounded-lg border-2 p-6 text-left transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
              field.value === "agency"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            )}
          >
            <RadioGroupItem
              id="helperType-agency"
              value="agency"
              className="absolute right-3 top-3 border-2 border-gray-300 data-checked:border-blue-500 data-checked:bg-blue-500"
            />
            <div
              className={cn(
                "mb-4 inline-flex rounded-full p-3",
                field.value === "agency" ? "bg-blue-100" : "bg-gray-100"
              )}
            >
              <Building2
                className={cn("h-6 w-6", field.value === "agency" ? "text-blue-600" : "text-gray-600")}
              />
            </div>

            <h2 className="text-lg font-semibold text-gray-900">Agency / Organization</h2>
            <p className="mt-2 text-sm text-gray-600">
              Manage multiple workers under your business. Assign jobs, track performance, and scale your operations.
            </p>

            <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
              <span>Get Started</span>
              <span className="ml-2">&rarr;</span>
            </div>
          </label>
        </RadioGroup>

        {error?.message ? (
          <p className="mt-2 text-xs text-red-500" role="alert">
            {error.message}
          </p>
        ) : null}
      </fieldset>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <strong>Pro Tip:</strong> You can change this later from settings.
        </p>
      </div>
    </div>
  );
}
