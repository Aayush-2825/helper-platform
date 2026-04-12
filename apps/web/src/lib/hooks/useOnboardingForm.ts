import { useEffect, useRef, useState } from "react";
import { useForm, UseFormProps, FieldValues, UseFormReturn, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodSchema } from "zod";

const ONBOARDING_STORAGE_KEY = "helper_onboarding_draft";

export interface UseOnboardingFormOptions<T extends FieldValues> extends Omit<UseFormProps<T>, "resolver"> {
  schema: ZodSchema<T>;
  storageKey?: string;
  autoSave?: boolean;
  debounceMs?: number;
}

/**
 * Custom hook that combines React Hook Form with Zod validation and localStorage persistence
 * Automatically saves form state to localStorage on changes (non-blocking)
 * Restores form state from localStorage on mount
 */
export function useOnboardingForm<T extends FieldValues>({
  schema,
  storageKey = ONBOARDING_STORAGE_KEY,
  autoSave = true,
  debounceMs = 500,
  ...rhfOptions
}: UseOnboardingFormOptions<T>): UseFormReturn<T> & {
  saveToStorage: (data: T) => void;
  clearStorage: () => void;
  hasStoredData: boolean;
} {
  const [hasStoredData, setHasStoredData] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const formRef = useRef<UseFormReturn<T> | null>(null);

  // Initialize form with stored data or defaults
  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any) as unknown as Resolver<T>,
    ...rhfOptions,
  });
  formRef.current = form;

  // Load stored data on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsedData = JSON.parse(stored) as Partial<T>;
        form.reset(parsedData as T);
        setHasStoredData(true);
      }
    } catch (error) {
      console.warn("Failed to load onboarding draft:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save on form changes
  useEffect(() => {
    if (!autoSave || !formRef.current) return;

    const subscription = formRef.current.watch((data) => {
      // Clear existing timer
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      // Set new debounced save
      const timer = setTimeout(() => {
        try {
          const dataToSave = {
            ...data,
            lastSavedAt: new Date().toISOString(),
          };
          localStorage.setItem(storageKey, JSON.stringify(dataToSave));
          setHasStoredData(true);
        } catch (error) {
          console.warn("Failed to save onboarding draft:", error);
        }
      }, debounceMs);

      debounceTimerRef.current = timer;
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [autoSave, debounceMs, storageKey])

  // Manual save function
  const saveToStorage = (data: T) => {
    try {
      const dataToSave = {
        ...data,
        lastSavedAt: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      setHasStoredData(true);
    } catch (error) {
      console.warn("Failed to save onboarding draft:", error);
    }
  };

  // Clear storage
  const clearStorage = () => {
    try {
      localStorage.removeItem(storageKey);
      setHasStoredData(false);
      form.reset();
    } catch (error) {
      console.warn("Failed to clear onboarding draft:", error);
    }
  };

  return {
    ...form,
    saveToStorage,
    clearStorage,
    hasStoredData,
  };
}

/**
 * Utility to get stored onboarding draft without initializing form
 */
export function getStoredOnboardingDraft<T extends FieldValues>(storageKey = ONBOARDING_STORAGE_KEY): Partial<T> | null {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.warn("Failed to retrieve onboarding draft:", error);
    return null;
  }
}

/**
 * Utility to clear onboarding draft without hook
 */
export function clearOnboardingDraft(storageKey = ONBOARDING_STORAGE_KEY) {
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.warn("Failed to clear onboarding draft:", error);
  }
}
