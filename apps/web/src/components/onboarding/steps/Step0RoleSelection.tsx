"use client";

import { useController, UseFormReturn, FieldValues } from "react-hook-form";
import { Building2, UserCircle } from "lucide-react";
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { field } = useController({
    control: form.control,
    name: "helperType" as any,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Get Started as a Helper
        </h1>
        <p className="mt-2 text-gray-600">
          Choose how you want to work with us
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Individual Card */}
        <button
          type="button"
          onClick={() => field.onChange("individual")}
          className={cn(
            "group relative rounded-lg border-2 p-6 text-left transition-all",
            field.value === "individual"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          )}
        >
          <div
            className={cn(
              "inline-flex rounded-full p-3 mb-4",
              field.value === "individual"
                ? "bg-blue-100"
                : "bg-gray-100"
            )}
          >
            <UserCircle
              className={cn(
                "h-6 w-6",
                field.value === "individual"
                  ? "text-blue-600"
                  : "text-gray-600"
              )}
            />
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            Individual Helper
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Work independently and accept jobs directly. Perfect for freelancers and independent service providers.
          </p>

          <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
            <span>Get Started</span>
            <span className="ml-2">→</span>
          </div>

          {field.value === "individual" && (
            <div className="absolute top-3 right-3">
              <div className="inline-flex items-center justify-center rounded-full bg-blue-500 h-6 w-6">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          )}
        </button>

        {/* Agency Card */}
        <button
          type="button"
          onClick={() => field.onChange("agency")}
          className={cn(
            "group relative rounded-lg border-2 p-6 text-left transition-all",
            field.value === "agency"
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          )}
        >
          <div
            className={cn(
              "inline-flex rounded-full p-3 mb-4",
              field.value === "agency"
                ? "bg-blue-100"
                : "bg-gray-100"
            )}
          >
            <Building2
              className={cn(
                "h-6 w-6",
                field.value === "agency"
                  ? "text-blue-600"
                  : "text-gray-600"
              )}
            />
          </div>

          <h2 className="text-lg font-semibold text-gray-900">
            Agency / Organization
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage multiple workers under your business. Assign jobs, track performance, and scale your operations.
          </p>

          <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
            <span>Get Started</span>
            <span className="ml-2">→</span>
          </div>

          {field.value === "agency" && (
            <div className="absolute top-3 right-3">
              <div className="inline-flex items-center justify-center rounded-full bg-blue-500 h-6 w-6">
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          )}
        </button>
      </div>

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm text-blue-900">
          ✨ <strong>Pro Tip:</strong> You can change this later from settings
        </p>
      </div>
    </div>
  );
}
