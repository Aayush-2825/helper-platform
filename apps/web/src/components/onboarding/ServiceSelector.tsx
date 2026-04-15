import { useController, FieldValues, FieldPath, Control } from "react-hook-form";
import { SERVICE_CATEGORIES } from "@/lib/schemas/helper-onboarding";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Truck,
  Zap,
  Wrench,
  Sparkles,
  ChefHat,
  BookOpen,
  Package,
  Heart,
  Shield,
} from "lucide-react";

// Map categories to icons and display names
const SERVICE_ICONS: Record<string, React.ReactNode> = {
  driver: <Truck className="h-5 w-5" />,
  electrician: <Zap className="h-5 w-5" />,
  plumber: <Wrench className="h-5 w-5" />,
  cleaner: <Sparkles className="h-5 w-5" />,
  chef: <ChefHat className="h-5 w-5" />,
  tutor: <BookOpen className="h-5 w-5" />,
  delivery_helper: <Package className="h-5 w-5" />,
  caretaker: <Heart className="h-5 w-5" />,
  security_guard: <Shield className="h-5 w-5" />,
};

const SERVICE_LABELS: Record<string, string> = {
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

interface ServiceSelectorProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  multi?: boolean;
  required?: boolean;
  hint?: string;
}

/**
 * Service category selector with visual icons and multi-select support
 */
export function ServiceSelector<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  label = "Select Service",
  multi = false,
  required = true,
  hint,
}: ServiceSelectorProps<TFieldValues, TName>) {
  const { field, fieldState } = useController({
    control,
    name,
  });
  const selectedValues = Array.isArray(field.value)
    ? (field.value as string[])
    : typeof field.value === "string" && field.value.length > 0
      ? [field.value]
      : [];

  return (
    <div className="space-y-3">
      <div>
        <Label className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
      </div>

      <ToggleGroup
        multiple={multi}
        variant="outline"
        className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3"
        value={selectedValues}
        onValueChange={(values) => {
          if (multi) {
            field.onChange(values);
            return;
          }

          field.onChange(values[0] ?? "");
        }}
      >
        {SERVICE_CATEGORIES.map((category) => {
          const isActive = selectedValues.includes(category);

          return (
            <ToggleGroupItem
              key={category}
              value={category}
              className={cn(
                "h-auto w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-gray-200 p-3 text-center",
                "data-pressed:border-blue-500 data-pressed:bg-blue-50"
              )}
            >
              <div
                className={cn(
                  "rounded-lg p-2",
                  isActive ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                )}
              >
                {SERVICE_ICONS[category]}
              </div>
              <span className="text-xs font-medium text-gray-900">
                {SERVICE_LABELS[category]}
              </span>
            </ToggleGroupItem>
          );
        })}
      </ToggleGroup>

      {hint && (
        <p className="text-xs text-gray-500">
          💡 {hint}
        </p>
      )}

      {fieldState.error && (
        <p className="text-xs text-red-500">
          {fieldState.error.message}
        </p>
      )}
    </div>
  );
}
