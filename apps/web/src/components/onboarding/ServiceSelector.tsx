import { useController, FieldValues, FieldPath, Control } from "react-hook-form";
import { SERVICE_CATEGORIES } from "@/lib/schemas/helper-onboarding";

import { cn } from "@/lib/utils";
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

  const isSelected = (category: string) => {
    if (Array.isArray(field.value)) {
      return field.value.includes(category);
    }
    return field.value === category;
  };

  const handleSelect = (category: string) => {
    if (multi) {
      const currentValue = Array.isArray(field.value) ? field.value : [];
      const categoryArray = Array.isArray(currentValue) ? (currentValue as string[]) : [];
      if (categoryArray.includes(category)) {
        field.onChange(categoryArray.filter((c: string) => c !== category));
      } else {
        field.onChange([...categoryArray, category]);
      }
    } else {
      field.onChange(category);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-900">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {SERVICE_CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => handleSelect(category)}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-3 transition-all",
              isSelected(category)
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            <div
              className={cn(
                "p-2 rounded-lg",
                isSelected(category)
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {SERVICE_ICONS[category]}
            </div>
            <span className="text-xs text-center font-medium text-gray-900">
              {SERVICE_LABELS[category]}
            </span>
            {multi && (
              <div
                className={cn(
                  "mt-1 flex h-4 w-4 items-center justify-center rounded border",
                  isSelected(category)
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300 bg-white"
                )}
              >
                {isSelected(category) && (
                  <svg
                    className="h-3 w-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

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
