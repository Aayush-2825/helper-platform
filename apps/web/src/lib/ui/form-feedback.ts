import { toast } from "sonner";
import { getErrorMessage } from "@/lib/core/errors";

export function showFormSuccess(title: string, description?: string) {
  toast.success(title, { description });
}

export function showFormError(title: string, errorLike: unknown, fallbackDescription: string) {
  const description = getErrorMessage(errorLike, fallbackDescription);
  toast.error(title, { description });
  return description;
}
