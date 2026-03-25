/**
 * Centralized Type Exports
 * Import all onboarding-related types from here
 */

// ============= SCHEMA TYPES =============
export type {
  RoleSelectionInput,
  BasicInfoIndividual,
  BasicInfoAgency,
  BasicInfo,
  ServiceDetailsIndividual,
  ServiceDetailsAgency,
  ServiceDetails,
  PricingAvailability,
  KycIndividual,
  KycAgency,
  Kyc,
  BankPayout,
  FinalSubmit,
  CompleteOnboarding,
} from "@/lib/schemas/helper-onboarding";

export {
  HELPER_TYPES,
  SERVICE_CATEGORIES,
  PRICING_TYPES,
  ID_DOCUMENT_TYPES,
  BUSINESS_DOCUMENT_TYPES,
} from "@/lib/schemas/helper-onboarding";

// ============= COMPONENT PROPS =============

import { UseFormReturn, FieldValues } from "react-hook-form";
import { CompleteOnboarding } from "@/lib/schemas/helper-onboarding";

export interface OnboardingWizardProps {
  onSuccess?: (data: CompleteOnboarding) => void | Promise<void>;
  onCancel?: () => void;
}

export interface StepComponentProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  isIndividual?: boolean;
}

// ============= FORM UTILITIES =============
export type {
  FileValidationOptions,
  CloudStorageConfig,
} from "@/lib/storage/file-upload";

export {
  validateFile,
  generateFilePreview,
  uploadFile,
  uploadToCloudinary,
  uploadToS3,
  compressImage,
  FileManifest,
} from "@/lib/storage/file-upload";

// ============= HOOK TYPES =============
export type {
  UseOnboardingFormOptions,
} from "@/lib/hooks/useOnboardingForm";

export {
  useOnboardingForm,
  getStoredOnboardingDraft,
  clearOnboardingDraft,
} from "@/lib/hooks/useOnboardingForm";

// ============= API TYPES =============

export interface OnboardingSubmissionRequest {
  // Step 0
  helperType: "individual" | "agency";

  // Step 1
  fullName?: string;
  businessName?: string;
  ownerName?: string;
  phone: string;
  email?: string;
  businessAddress?: string;
  city: string;
  profilePhotoUrl?: string;
  logoUrl?: string;

  // Step 2
  primaryCategory: string;
  yearsExperience: number;
  bio?: string;
  languages: string[];
  serviceRadiusKm: number;
  numberOfWorkers?: number;
  workerTypesOffered?: string[];
  canAssignJobsInternally?: boolean;

  // Step 3
  pricingType: "fixed" | "hourly" | "negotiable";
  basePrice?: number;
  isOnline: boolean;
  workingHours: { start: string; end: string };
  availableDays: string[];

  // Step 4
  idDocumentType?: string;
  idDocumentNumber?: string;
  idDocumentUrl?: string;
  selfieUrl?: string;
  addressProofUrl?: string;
  businessRegistrationUrl?: string;
  gstNumber?: string;
  gstDocumentUrl?: string;
  ownerIdDocumentType?: string;
  ownerIdDocumentUrl?: string;
  workerDeclarationAgreed?: boolean;

  // Step 5
  accountHolderName?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  upiId?: string;

  // Step 6
  agreedToTerms: boolean;
  agreedToCommission: boolean;
}

export interface OnboardingSubmissionResponse {
  id: string;
  status: "pending" | "approved" | "rejected";
  message: string;
  error?: string;
}

// ============= VERIFICATION STATUS =============

export enum VerificationStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  RESUBMISSION_REQUIRED = "resubmission_required",
}

export enum AvailabilityStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  BUSY = "busy",
}

// ============= HELPER TYPES =============

export interface HelperProfileData {
  id: string;
  userId: string;
  organizationId?: string | null;
  primaryCategory: string;
  headline?: string | null;
  bio?: string | null;
  yearsExperience: number;
  serviceCity: string;
  serviceRadiusKm: number;
  verificationStatus: VerificationStatus;
  availabilityStatus: AvailabilityStatus;
  isActive: boolean;
  averageRating: number;
  totalRatings: number;
  completedJobs: number;
  qualityScore: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface KYCDocumentData {
  id: string;
  helperProfileId: string;
  documentType: string;
  documentNumber?: string | null;
  fileUrl: string;
  status: VerificationStatus;
  uploadedAt?: Date;
  verifiedAt?: Date;
}

export interface PayoutDetailsData {
  id: string;
  helperProfileId: string;
  accountHolderNameEncrypted: string;
  bankAccountNumberEncrypted: string;
  bankAccountNumberMasked: string;
  ifscCodeEncrypted: string;
  upiIdEncrypted?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============= FORM STATE =============

export interface OnboardingFormState {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  isDirty: boolean;
  isValid: boolean;
  isSaving: boolean;
  lastSavedAt?: Date;
  hasStoredData: boolean;
  errors: Record<string, string>;
}

// ============= PROGRESS DATA =============

export interface OnboardingProgress {
  stepNumber: number;
  stepTitle: string;
  stepDescription: string;
  completionPercentage: number;
  isCurrentStep: boolean;
  isCompleted: boolean;
  isSkipped: boolean;
}

// ============= UPLOAD EVENTS =============

export enum UploadStatus {
  IDLE = "idle",
  UPLOADING = "uploading",
  SUCCESS = "success",
  ERROR = "error",
}

export interface UploadEvent {
  status: UploadStatus;
  progress: number; // 0-100
  file?: File;
  error?: string;
  url?: string;
}

// ============= CONFIGURATION =============

export interface OnboardingConfig {
  enableAutoSave: boolean;
  autoSaveInterval: number;
  maxFileSize: number;
  allowedFileTypes: string[];
  enableOfflineMode: boolean;
  storageKey: string;
  analyticsEnabled: boolean;
}

export const DEFAULT_CONFIG: OnboardingConfig = {
  enableAutoSave: true,
  autoSaveInterval: 500,
  maxFileSize: 5,
  allowedFileTypes: ["image/*", "application/pdf"],
  enableOfflineMode: true,
  storageKey: "helper_onboarding_draft",
  analyticsEnabled: false,
};

// ============= VALIDATION RESULTS =============

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  timestamp: Date;
}

// ============= EXPORT ALL =============

export * from "@/lib/schemas/helper-onboarding";
export * from "@/lib/hooks/useOnboardingForm";
export * from "@/lib/storage/file-upload";

