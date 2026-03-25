"use client";

import { UseFormReturn, FieldValues, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import { DollarSign, Clock, Calendar } from "lucide-react";

interface Step3PricingAvailabilityProps<T extends FieldValues> {
  form: UseFormReturn<T>;
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

  const toggleDay = (day: string) => {
    const current = Array.isArray(availableDays) ? availableDays : [];
    if (current.includes(day)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue("availableDays" as any, current.filter((d) => d !== day) as any, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue("availableDays" as any, [...current, day] as any, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  };

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
          <div>
            <Label>
              <DollarSign className="inline h-4 w-4 mr-2" />
              Pricing Model
            </Label>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
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
                <label
                  key={option.value}
                  className="flex items-center space-x-3 rounded-lg border-2 p-3 cursor-pointer transition-all"
                  style={{
                    borderColor:
                      field.value === option.value ? "#3b82f6" : "#e5e7eb",
                    backgroundColor:
                      field.value === option.value ? "#f0f9ff" : "#ffffff",
                  }}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={field.value === option.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    className="h-4 w-4"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
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
                    : "Per hour of work"
                }
                onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
              />
              <style jsx>{`
                #basePrice {
                  padding-left: 1.75rem;
                }
                #basePrice::before {
                  content: '₹';
                  position: absolute;
                  left: 0.75rem;
                  top: 50%;
                  transform: translateY(-50%);
                  color: rgb(75, 85, 99);
                }
              `}</style>
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
          <label className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={field.value || false}
              onChange={(e) => field.onChange(e.target.checked)}
              className="rounded"
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
                <label className="block text-sm text-gray-700 mb-1">
                  From
                </label>
                <input
                  {...field}
                  type="time"
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
                <label className="block text-sm text-gray-700 mb-1">
                  To
                </label>
                <input
                  {...field}
                  type="time"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                />
              </div>
            )}
          />
        </div>
      </div>

      {/* Available Days */}
      <div>
        <Label>
          <Calendar className="inline h-4 w-4 mr-2" />
          Available Days
        </Label>
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.id}
              type="button"
              onClick={() => toggleDay(day.id)}
              className={`rounded-lg border-2 py-2 px-1 text-sm font-medium transition-all text-center ${
                (availableDays as string[]).includes(day.id)
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
        {errors.availableDays && "message" in errors.availableDays && (
          <p className="mt-2 text-xs text-red-500">
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
