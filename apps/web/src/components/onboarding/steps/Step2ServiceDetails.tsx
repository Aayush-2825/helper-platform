"use client";

import { UseFormReturn, FieldValues, Controller, type FieldPath } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import { ServiceSelector } from "../ServiceSelector";
import { Textarea } from "@/components/ui/textarea";
import { Briefcase, Clock, Globe } from "lucide-react";

interface Step2ServiceDetailsProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  isIndividual: boolean;
}

/**
 * Step 2: Service Details
 * Service categories, experience, bio, languages, service radius
 */
export function Step2ServiceDetails<T extends FieldValues>({
  form,
  isIndividual,
}: Step2ServiceDetailsProps<T>) {
  const { control } = form;

  const languages = [
    "English",
    "Hindi",
    "Marathi",
    "Tamil",
    "Telugu",
    "Kannada",
    "Bengali",
    "Punjabi",
    "Gujarati",
    "Urdu",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          What services do you offer?
        </h1>
        <p className="mt-2 text-gray-600">
          Tell us about your expertise and availability
        </p>
      </div>

      {/* Primary Category - always required */}
      <ServiceSelector
        control={control}
        name={"primaryCategory" as FieldPath<T>}
        label="Primary Service Category"
        multi={false}
        hint="Select the main service you provide. You can add more later."
      />

      {/* For Agency: Multiple service types */}
      {!isIndividual && (
        <ServiceSelector
          control={control}
          name={"workerTypesOffered" as FieldPath<T>}
          label="Worker Types You Offer"
          multi={true}
          hint="Select all the service types your team can provide."
        />
      )}

      {/* Years of Experience */}
      <Controller
        control={control}
        name={"yearsExperience" as FieldPath<T>}
        render={({ field, fieldState: { error } }) => (
          <div>
            <FormField
              {...field}
              id="yearsExperience"
              type="number"
              placeholder="5"
              min="0"
              max="70"
              label={
                <>
                  <Clock className="inline h-4 w-4 mr-2" />
                  Years of Experience
                </>
              }
              error={error?.message}
              required
              onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
            />
          </div>
        )}
      />

      {/* Bio / Description */}
      <Controller
        control={control}
        name={"bio" as FieldPath<T>}
        render={({ field }) => (
          <div>
            <Label htmlFor="bio">Bio / Description (Optional)</Label>
            <Textarea
              id="bio"
              placeholder="Tell customers about your experience, specialties, and what makes you unique... (500 chars max)"
              maxLength={500}
              {...field}
              value={typeof field.value === "string" ? field.value : ""}
            />
            <p className="mt-1 text-xs text-gray-500">
              {field.value?.length || 0}/500 characters
            </p>
          </div>
        )}
      />

      {/* Languages */}
      <Controller
        control={control}
        name={"languages" as FieldPath<T>}
        render={({ field, fieldState: { error } }) => (
          <div>
            <Label>
              <Globe className="inline h-4 w-4 mr-2" />
              Languages Spoken
            </Label>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {languages.map((lang) => (
                <label
                  key={lang}
                  className="flex items-center space-x-2 rounded-lg border border-gray-200 p-2 cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    value={lang.toLowerCase()}
                    checked={
                      Array.isArray(field.value) &&
                      (field.value as string[]).includes(lang.toLowerCase())
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      const currentValue = Array.isArray(field.value)
                        ? (field.value as string[])
                        : [];
                      const newLanguages = e.target.checked
                        ? [...currentValue, value]
                        : currentValue.filter((l: string) => l !== value);
                      field.onChange(newLanguages);
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{lang}</span>
                </label>
              ))}
            </div>
            {error && (
              <p className="mt-2 text-xs text-red-500">
                {error.message}
              </p>
            )}
          </div>
        )}
      />

      {/* Service Radius */}
      <Controller
        control={control}
        name={"serviceRadiusKm" as FieldPath<T>}
        render={({ field, fieldState: { error } }) => (
          <div>
            <FormField
              {...field}
              id="serviceRadiusKm"
              type="number"
              placeholder="8"
              min="1"
              max="50"
              label={
                <>
                  <Briefcase className="inline h-4 w-4 mr-2" />
                  Service Radius (km)
                </>
              }
              error={error?.message}
              helperText="How far are you willing to travel to serve customers?"
              required
              onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 8)}
            />
          </div>
        )}
      />

      {/* Agency-specific fields */}
      {!isIndividual && (
        <>
          <Controller
            control={control}
            name={"numberOfWorkers" as FieldPath<T>}
            render={({ field, fieldState: { error } }) => (
              <FormField
                {...field}
                id="numberOfWorkers"
                type="number"
                placeholder="5"
                min="1"
                label="Number of Workers"
                error={error?.message}
                helperText="How many workers does your agency have?"
                onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
              />
            )}
          />

          <Controller
            control={control}
            name={"canAssignJobsInternally" as FieldPath<T>}
            render={({ field }) => (
              <label className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={field.value || false}
                  onChange={(e) => field.onChange(e.target.checked)}
                  className="rounded"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Allow internal job assignment
                  </p>
                  <p className="text-xs text-gray-500">
                    Assign jobs to your workers directly without them accepting
                  </p>
                </div>
              </label>
            )}
          />
        </>
      )}
    </div>
  );
}
