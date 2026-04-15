"use client";

import { UseFormReturn, FieldValues, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { DollarSign, Clock, Calendar } from "lucide-react";

interface Step3PricingAvailabilityProps<T extends FieldValues> {
  form: UseFormReturn<T>;
}

function readNestedErrorMessage(errorValue: unknown): string | null {
  if (!errorValue || typeof errorValue !== "object") {
    return null;
  }

  const maybeMessage = (errorValue as { message?: unknown }).message;
  return typeof maybeMessage === "string" && maybeMessage.length > 0
    ? maybeMessage
    : null;
}

const DAYS_OF_WEEK = [
  { id: "monday", label: "Mon" },
  { id: "tuesday", label: "Tue" },
  { id: "wednesday", label: "Wed" },
  { id: "thursday", label: "Thu" },
  { id: "friday", label: "Fri" },
  { id: "saturday", label: "Sat" },
  { id: "sunday", label: "Sun" },
];

/**
 * Step 3: Pricing & Availability
 * Set pricing type, base price, working hours, and available days
 */
export function Step3PricingAvailability<T extends FieldValues>({
  form,
}: Step3PricingAvailabilityProps<T>) {
  const { control, watch, formState, setValue } = form;
  const { errors } = formState;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pricingType = watch("pricingType" as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const availableDays = (watch("availableDays" as any) || []) as string[];
  const workingHoursErrors = errors.workingHours as
    | { start?: unknown; end?: unknown }
    | undefined;
  const startTimeError = readNestedErrorMessage(workingHoursErrors?.start);
  const endTimeError = readNestedErrorMessage(workingHoursErrors?.end);
  const startTimeErrorId = "workingHoursStart-error";
  const endTimeErrorId = "workingHoursEnd-error";
  const availableDaysErrorId = "availableDays-error";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Pricing & Availability
        </h1>
        <p className="mt-2 text-gray-600">
          Set your rates and when you&apos;re available to work
        </p>
      </div>

      {/* Pricing Type */}
      <Controller
        control={control}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name={"pricingType" as any}
        render={({ field }) => (
          <fieldset>
            <legend className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <DollarSign className="h-4 w-4" />
              Pricing Model
            </legend>
            <ToggleGroup
              multiple={false}
              variant="outline"
              className="mt-3 grid w-full gap-3 sm:grid-cols-3"
              value={typeof field.value === "string" ? [field.value] : []}
              onValueChange={(values) => {
                const nextValue = values[0];
                if (nextValue) {
                  field.onChange(nextValue);
                }
              }}
            >
              {[
                {
                  value: "fixed",
                  label: "Fixed Price",
                  desc: "Charge a set price per job",
                },
                {
                  value: "hourly",
                  label: "Hourly Rate",
                  desc: "Charge per hour worked",
                },
                {
                  value: "negotiable",
                  label: "Negotiable",
                  desc: "Discuss price with customer",
                },
              ].map((option) => (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="h-auto min-h-11 w-full flex-col items-start gap-1 rounded-lg border-2 border-gray-200 px-3 py-3 text-left data-pressed:border-blue-500 data-pressed:bg-blue-50"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {option.label}
                  </span>
                  <span className="text-xs text-gray-500">{option.desc}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </fieldset>
        )}
      />

      {/* Base Price - shown for fixed or hourly */}
      {(pricingType === "fixed" || pricingType === "hourly") && (
        <Controller
          control={control}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          name={"basePrice" as any}
          render={({ field, fieldState: { error } }) => (
            <div>
              <FormField
                {...field}
                id="basePrice"
                type="number"
                placeholder={pricingType === "fixed" ? "500" : "300"}
                min="0"
                label={`Base ${pricingType === "fixed" ? "Price" : "Hourly Rate"} (Optional)`}
                error={error?.message}
                helperText={
                  pricingType === "fixed"
                    ? "You can adjust per job based on requirements"
                    : "Per hour of work in INR"
                }
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          )}
        />
      )}

      {/* Online Status */}
      <Controller
        control={control}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name={"isOnline" as any}
        render={({ field }) => (
          <label
            htmlFor="isOnline"
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
          >
            <Checkbox
              id="isOnline"
              checked={field.value || false}
              onCheckedChange={(checked) => field.onChange(Boolean(checked))}
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Go Online Now</p>
              <p className="text-xs text-gray-500">
                Make your profile visible and start receiving job requests
              </p>
            </div>
          </label>
        )}
      />

      {/* Working Hours */}
      <div className="space-y-3">
        <Label>
          <Clock className="inline h-4 w-4 mr-2" />
          Working Hours
        </Label>
        <div className="grid gap-3 sm:grid-cols-2">
          <Controller
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={"workingHours.start" as any}
            render={({ field }) => (
              <div>
                <label htmlFor="workingHoursStart" className="mb-1 block text-sm text-gray-700">
                  From
                </label>
                <Input
                  id="workingHoursStart"
                  {...field}
                  type="time"
                  value={typeof field.value === "string" ? field.value : ""}
                  aria-invalid={Boolean(startTimeError)}
                  aria-describedby={startTimeError ? startTimeErrorId : undefined}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
            )}
          />
          <Controller
            control={control}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            name={"workingHours.end" as any}
            render={({ field }) => (
              <div>
                <label htmlFor="workingHoursEnd" className="mb-1 block text-sm text-gray-700">
                  To
                </label>
                <Input
                  id="workingHoursEnd"
                  {...field}
                  type="time"
                  value={typeof field.value === "string" ? field.value : ""}
                  aria-invalid={Boolean(endTimeError)}
                  aria-describedby={endTimeError ? endTimeErrorId : undefined}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
            )}
          />
        </div>
        {startTimeError && (
          <p id={startTimeErrorId} className="text-xs text-red-500" role="alert">
            {startTimeError}
          </p>
        )}
        {endTimeError && (
          <p id={endTimeErrorId} className="text-xs text-red-500" role="alert">
            {endTimeError}
          </p>
        )}
      </div>

      {/* Available Days */}
      <div>
        <Label>
          <Calendar className="inline h-4 w-4 mr-2" />
          Available Days
        </Label>
        <ToggleGroup
          multiple
          variant="outline"
          aria-invalid={Boolean(errors.availableDays && "message" in errors.availableDays)}
          aria-describedby={errors.availableDays && "message" in errors.availableDays ? availableDaysErrorId : undefined}
          className="mt-3 grid w-full grid-cols-4 gap-2 sm:grid-cols-7"
          value={availableDays}
          onValueChange={(values) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setValue("availableDays" as any, values as any, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
          }}
        >
          {DAYS_OF_WEEK.map((day) => (
            <ToggleGroupItem
              key={day.id}
              value={day.id}
              className="min-h-11 w-full rounded-lg border-2 border-gray-200 px-1 py-2 text-center text-sm font-medium text-gray-700 data-pressed:border-blue-500 data-pressed:bg-blue-50 data-pressed:text-blue-700"
            >
              {day.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        {errors.availableDays && "message" in errors.availableDays && (
          <p id={availableDaysErrorId} className="mt-2 text-xs text-red-500" role="alert">
            {(errors.availableDays.message as string)}
          </p>
        )}
      </div>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
        <p className="text-sm text-amber-900">
          💡 <strong>Tip:</strong> You can update these anytime from your profile settings to match your actual availability.
        </p>
      </div>
    </div>
  );
}
