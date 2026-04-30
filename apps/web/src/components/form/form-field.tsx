import { LucideIcon } from "lucide-react";
import { Check, AlertCircle } from "lucide-react";
import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  success?: boolean;
  hint?: string;
  icon?: LucideIcon;
  children: ReactNode;
}

export function FormField({
  label,
  error,
  success,
  hint,
  icon: Icon,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-foreground">
        {label}
      </label>

      <div className="relative">
        {children}
        
        {/* Success indicator */}
        {success && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-success-check">
            <Check className="h-5 w-5 text-green-500" />
          </div>
        )}

        {/* Error indicator */}
        {error && !success && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle className="h-5 w-5 text-destructive" />
          </div>
        )}

        {/* Icon indicator */}
        {Icon && !success && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-destructive font-medium flex items-center gap-1 animate-error-shake">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {/* Success message */}
      {success && !error && (
        <p className="text-xs text-green-500 font-medium flex items-center gap-1">
          <Check className="h-3 w-3" />
          Looking good!
        </p>
      )}

      {/* Hint text */}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

export function FormProgress({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-orange-500 transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step indicator */}
      <p className="text-xs text-muted-foreground text-center font-medium">
        Step {currentStep} of {totalSteps}
      </p>
    </div>
  );
}

export function PasswordStrength({ password }: { password: string }) {
  let strength: "weak" | "medium" | "strong" = "weak";
  let strengthPercent = 25;

  if (password.length >= 8) {
    strength = "medium";
    strengthPercent = 50;
  }

  if (
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  ) {
    strength = "strong";
    strengthPercent = 100;
  }

  const strengthColor = {
    weak: "text-destructive",
    medium: "text-amber-500",
    strong: "text-green-500",
  };

  return (
    <div className="space-y-2">
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            strength === "weak"
              ? "bg-destructive"
              : strength === "medium"
                ? "bg-amber-500"
                : "bg-green-500"
          }`}
          style={{ width: `${strengthPercent}%` }}
        />
      </div>
      <p className={`text-xs font-semibold ${strengthColor[strength]}`}>
        {strength === "weak" && "Weak password"}
        {strength === "medium" && "Medium strength"}
        {strength === "strong" && "Strong password"}
      </p>
    </div>
  );
}
