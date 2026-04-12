import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactNode;
  error?: string | object;
  helperText?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helperText, required, id, icon, ...props }, ref) => {
    const inputId = id || (props.name as string);
    const errorMessage = typeof error === "string" ? error : undefined;
    const normalizedProps =
      "value" in props && props.value === undefined
        ? { ...props, value: "" }
        : props;

    return (
      <div className="flex flex-col gap-1.5">
        {(label || icon) && (
          <Label htmlFor={inputId} className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
            {icon && <span className="inline mr-2">{icon}</span>}
            {label}
          </Label>
        )}
        <Input
          ref={ref}
          id={inputId}
          className={errorMessage ? "border-red-500 focus-visible:ring-red-500/50" : ""}
          aria-invalid={!!errorMessage}
          {...normalizedProps}
        />
        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}
        {helperText && !errorMessage && <p className="text-sm text-muted-foreground">{helperText}</p>}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export { FormField };
