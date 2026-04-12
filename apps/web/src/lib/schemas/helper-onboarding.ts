import { z } from "zod";

// ============= ENUMS & CONSTANTS =============

export const HELPER_TYPES = {
  INDIVIDUAL: "individual",
  AGENCY: "agency",
} as const;

export const SERVICE_CATEGORIES = [
  "driver",
  "electrician",
  "plumber",
  "cleaner",
  "chef",
  "tutor",
  "delivery_helper",
  "caretaker",
  "security_guard",
] as const;

export const PRICING_TYPES = ["fixed", "hourly", "negotiable"] as const;

export const ID_DOCUMENT_TYPES = ["aadhar", "pan", "driving_license", "passport"] as const;

export const BUSINESS_DOCUMENT_TYPES = ["registration", "gst", "other"] as const;

// ============= STEP 0: ROLE SELECTION =============

export const roleSelectionSchema = z.object({
  helperType: z.enum([HELPER_TYPES.INDIVIDUAL, HELPER_TYPES.AGENCY]),
});

export type RoleSelectionInput = z.infer<typeof roleSelectionSchema>;

// ============= STEP 1: BASIC INFORMATION =============

export const basicInfoIndividualSchema = z.object({
  helperType: z.literal(HELPER_TYPES.INDIVIDUAL),
  fullName: z.string().min(2, "Full name required").max(100),
  phone: z.string().regex(/^[0-9]{10}$/, "Valid 10-digit phone required"),
  phoneVerified: z.boolean().default(false),
  email: z.string().email("Valid email required").optional().or(z.literal("")),
  city: z.string().min(2, "City is required").max(50),
  profilePhotoUrl: z.string().url("Invalid photo URL").optional(),
  profilePhotoFile: z.instanceof(File).optional(),
});

export const basicInfoAgencySchema = z.object({
  helperType: z.literal(HELPER_TYPES.AGENCY),
  businessName: z.string().min(2, "Business name required").max(100),
  ownerName: z.string().min(2, "Owner name required").max(100),
  phone: z.string().regex(/^[0-9]{10}$/, "Valid 10-digit phone required"),
  phoneVerified: z.boolean().default(false),
  email: z.string().email("Valid email required"),
  businessAddress: z.string().min(5, "Address required").max(200),
  city: z.string().min(2, "City required").max(50),
  logoUrl: z.string().url("Invalid logo URL").optional(),
  logoFile: z.instanceof(File).optional(),
});

export const basicInfoSchema = z.union([basicInfoIndividualSchema, basicInfoAgencySchema]);

export type BasicInfoIndividual = z.infer<typeof basicInfoIndividualSchema>;
export type BasicInfoAgency = z.infer<typeof basicInfoAgencySchema>;
export type BasicInfo = z.infer<typeof basicInfoSchema>;

// ============= STEP 2: SERVICE DETAILS =============

const baseServiceDetailsSchema = {
  primaryCategory: z
    .enum(SERVICE_CATEGORIES)
    .refine((val) => val !== undefined, "Select a service category"),
  yearsExperience: z.coerce
    .number()
    .min(0, "Must be 0 or more")
    .max(70, "Invalid years")
    .default(0),
  bio: z.string().max(500, "Bio too long (500 chars max)").optional(),
  languages: z.array(z.string()).min(1, "Select at least one language").default(["english"]),
  serviceRadiusKm: z.coerce.number().min(1, "Minimum 1 km").max(50, "Maximum 50 km").default(8),
};

export const serviceDetailsIndividualSchema = z.object({
  helperType: z.literal(HELPER_TYPES.INDIVIDUAL),
  ...baseServiceDetailsSchema,
});

export const serviceDetailsAgencySchema = z.object({
  helperType: z.literal(HELPER_TYPES.AGENCY),
  ...baseServiceDetailsSchema,
  numberOfWorkers: z.coerce
    .number()
    .min(1, "At least 1 worker")
    .max(1000, "Invalid number")
    .optional(),
  workerTypesOffered: z.array(z.enum(SERVICE_CATEGORIES)).min(1, "Select worker types"),
  canAssignJobsInternally: z.boolean().default(true),
});

export const serviceDetailsSchema = z.union([
  serviceDetailsIndividualSchema,
  serviceDetailsAgencySchema,
]);

export type ServiceDetailsIndividual = z.infer<typeof serviceDetailsIndividualSchema>;
export type ServiceDetailsAgency = z.infer<typeof serviceDetailsAgencySchema>;
export type ServiceDetails = z.infer<typeof serviceDetailsSchema>;

// ============= STEP 3: PRICING & AVAILABILITY =============

export const pricingAvailabilitySchema = z.object({
  helperType: z.enum([HELPER_TYPES.INDIVIDUAL, HELPER_TYPES.AGENCY]),
  pricingType: z.enum(PRICING_TYPES),
  basePrice: z.coerce
    .number()
    .min(0, "Price must be positive")
    .optional()
    .or(z.literal("")),
  isOnline: z.boolean().default(false),
  workingHours: z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  }),
  availableDays: z.array(z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]))
    .min(1, "Select at least one day"),
});

export type PricingAvailability = z.infer<typeof pricingAvailabilitySchema>;

// ============= STEP 4: KYC & VERIFICATION =============

export const kycIndividualSchema = z.object({
  helperType: z.literal(HELPER_TYPES.INDIVIDUAL),
  idDocumentType: z.enum(ID_DOCUMENT_TYPES),
  idDocumentNumber: z.string().min(5, "Invalid document number").max(20),
  idDocumentUrl: z.string().url("Invalid document URL"),
  idDocumentFile: z.instanceof(File).optional(),
  selfieUrl: z.string().url("Invalid selfie URL").optional(),
  selfieFile: z.instanceof(File).optional(),
  addressProofUrl: z.string().url("Invalid address proof URL").optional(),
  addressProofFile: z.instanceof(File).optional(),
});

export const kycAgencySchema = z.object({
  helperType: z.literal(HELPER_TYPES.AGENCY),
  businessRegistrationUrl: z.string().url("Invalid registration document URL"),
  businessRegistrationFile: z.instanceof(File).optional(),
  gstNumber: z.string().regex(/^[0-9A-Z]{15}$/, "Invalid GST number").optional().or(z.literal("")),
  gstDocumentUrl: z.string().url().optional().or(z.literal("")),
  gstDocumentFile: z.instanceof(File).optional(),
  ownerIdDocumentType: z.enum(ID_DOCUMENT_TYPES),
  ownerIdDocumentUrl: z.string().url("Invalid owner ID URL"),
  ownerIdDocumentFile: z.instanceof(File).optional(),
  workerDeclarationAgreed: z.boolean().refine((val) => val === true, "You must agree to worker verification declaration"),
});

export const kycSchema = z.union([kycIndividualSchema, kycAgencySchema]);

export type KycIndividual = z.infer<typeof kycIndividualSchema>;
export type KycAgency = z.infer<typeof kycAgencySchema>;
export type Kyc = z.infer<typeof kycSchema>;

// ============= STEP 5: BANK & PAYOUT DETAILS =============

export const bankPayoutSchema = z.object({
  helperType: z.enum([HELPER_TYPES.INDIVIDUAL, HELPER_TYPES.AGENCY]),
  accountHolderName: z.string().min(2, "Name required").max(100),
  bankAccountNumber: z.string()
    .regex(/^[0-9]{9,18}$/, "Valid account number required"),
  ifscCode: z.string()
    .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Valid IFSC code required (e.g., SBIN0001234)"),
  upiId: z.string()
    .regex(/^[a-zA-Z0-9.-]{3,}@[a-zA-Z]{3,}$/, "Valid UPI ID (e.g., user@upi)")
    .optional()
    .or(z.literal("")),
});

export type BankPayout = z.infer<typeof bankPayoutSchema>;

// ============= STEP 6: FINAL REVIEW & SUBMIT =============

export const finalSubmitSchema = z.object({
  helperType: z.enum([HELPER_TYPES.INDIVIDUAL, HELPER_TYPES.AGENCY]),
  agreedToTerms: z.boolean().refine((val) => val === true, "You must agree to terms"),
  agreedToCommission: z.boolean().refine((val) => val === true, "You must agree to commission terms"),
});

export type FinalSubmit = z.infer<typeof finalSubmitSchema>;

// ============= COMPLETE ONBOARDING FORM =============

export const completeOnboardingSchema = z.object({
  // Step 0
  helperType: z.enum([HELPER_TYPES.INDIVIDUAL, HELPER_TYPES.AGENCY]),

  // Step 1: Basic Info
  fullName: z.string().optional(), // Individual
  businessName: z.string().optional(), // Agency
  ownerName: z.string().optional(), // Agency
  phone: z.string(),
  phoneVerified: z.boolean().default(false),
  email: z.string().email().optional(),
  businessAddress: z.string().optional(),
  city: z.string(),
  profilePhotoUrl: z.string().optional(),
  logoUrl: z.string().optional(),

  // Step 2: Services
  primaryCategory: z.enum(SERVICE_CATEGORIES),
  yearsExperience: z.number().default(0),
  bio: z.string().optional(),
  languages: z.array(z.string()).default(["english"]),
  serviceRadiusKm: z.number().default(8),
  numberOfWorkers: z.number().optional(),
  workerTypesOffered: z.array(z.enum(SERVICE_CATEGORIES)).optional(),
  canAssignJobsInternally: z.boolean().default(true),

  // Step 3: Pricing & Availability
  pricingType: z.enum(PRICING_TYPES),
  basePrice: z.number().optional(),
  isOnline: z.boolean().default(false),
  workingHours: z.object({
    start: z.string(),
    end: z.string(),
  }),
  availableDays: z.array(z.string()),

  // Step 4: KYC
  idDocumentType: z.string().optional(),
  idDocumentNumber: z.string().optional(),
  idDocumentUrl: z.string().optional(),
  selfieUrl: z.string().optional(),
  addressProofUrl: z.string().optional(),
  businessRegistrationUrl: z.string().optional(),
  gstNumber: z.string().optional(),
  gstDocumentUrl: z.string().optional(),
  ownerIdDocumentType: z.string().optional(),
  ownerIdDocumentUrl: z.string().optional(),
  workerDeclarationAgreed: z.boolean().default(false),

  // Step 5: Bank
  accountHolderName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  upiId: z.string().optional(),

  // Step 6: Final
  agreedToTerms: z.boolean().default(false),
  agreedToCommission: z.boolean().default(false),

  // Meta
  currentStep: z.number().default(0),
  completedSteps: z.array(z.number()).default([]),
  lastSavedAt: z.date().optional(),
});

export type CompleteOnboarding = z.infer<typeof completeOnboardingSchema>;
