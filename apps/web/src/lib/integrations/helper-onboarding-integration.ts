/**
 * INTEGRATION GUIDE - Helper Onboarding System
 * 
 * This file demonstrates how to integrate the helper onboarding system
 * with your existing Better Auth setup and database.
 */

// ============= STEP 1: SETUP ROUTE PROTECTION =============

import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

/**
 * Middleware to protect onboarding routes
 * Can redirect unauthenticated users to login
 */
export async function getAuthSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  return session;
}

// ============= STEP 2: ENHANCED API ROUTE =============

/**
 * Enhanced POST /api/helpers/onboarding
 * Complete implementation with file handling and KYC storage
 */

import { NextRequest, NextResponse } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { helperProfile, helperKycDocument, user, organization, member } from "@/db/schema";
import { uploadFile, FileManifest } from "@/lib/storage/file-upload";
import { encryptBankDetails } from "@/lib/security/encryption"; // You'll need to add this

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.helperType || !data.primaryCategory) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // ===== TRANSACTION START =====
    let organizationId: string | null = null;

    // Create organization for agency
    if (data.helperType === "agency") {
      try {
        const result = await db
          .insert(organization)
          .values({
            id: crypto.randomUUID(),
            name: data.businessName,
            slug: generateSlug(data.businessName),
            logo: data.logoUrl || null,
            metadata: JSON.stringify({
              businessAddress: data.businessAddress,
              gstNumber: data.gstNumber || null,
              numberOfWorkers: data.numberOfWorkers,
            }),
          })
          .returning();

        organizationId = result[0]?.id || null;

        // Add session user as owner of organization
        if (organizationId) {
          await db.insert(member).values({
            id: crypto.randomUUID(),
            organizationId,
            userId: session.user.id,
            role: "owner",
            createdAt: new Date(),
          });
        }
      } catch (error) {
        console.error("Organization creation error:", error);
        throw new Error("Failed to create organization");
      }
    }

    // Create or update helper profile
    try {
      const profileId = crypto.randomUUID();
      const result = await db
        .insert(helperProfile)
        .values({
          id: profileId,
          userId: session.user.id,
          organizationId,
          primaryCategory: data.primaryCategory,
          headline: data.bio?.substring(0, 100) || null,
          bio: data.bio || null,
          yearsExperience: data.yearsExperience || 0,
          serviceCity: data.city,
          serviceRadiusKm: data.serviceRadiusKm || 8,
          verificationStatus: "pending",
          availabilityStatus: data.isOnline ? "online" : "offline",
        })
        .returning();

      const createdProfile = result[0];

      // ===== HANDLE FILE UPLOADS =====
      const fileManifest = FileManifest.load();

      try {
        // Upload ID document (both individual and agency)
        if (data.idDocumentFile) {
          const uploadResult = await uploadFile(
            data.idDocumentFile,
            "kyc",
            `helpers/${createdProfile.id}/kyc`
          );

          await db.insert(helperKycDocument).values({
            id: crypto.randomUUID(),
            helperProfileId: createdProfile.id,
            documentType: data.idDocumentType || "aadhar",
            documentNumber: data.idDocumentNumber || null,
            fileUrl: uploadResult.url,
            status: "pending",
          });

          fileManifest.add("idDocument", uploadResult.url, uploadResult.id);
        }

        // Upload additional KYC documents
        if (data.addressProofFile && data.helperType === "individual") {
          const uploadResult = await uploadFile(
            data.addressProofFile,
            "kyc",
            `helpers/${createdProfile.id}/kyc`
          );

          await db.insert(helperKycDocument).values({
            id: crypto.randomUUID(),
            helperProfileId: createdProfile.id,
            documentType: "address_proof",
            documentNumber: null,
            fileUrl: uploadResult.url,
            status: "pending",
          });
        }

        // Upload business documents for agency
        if (data.businessRegistrationFile && data.helperType === "agency") {
          const uploadResult = await uploadFile(
            data.businessRegistrationFile,
            "document",
            `agencies/${organizationId}/kyc`
          );

          await db.insert(helperKycDocument).values({
            id: crypto.randomUUID(),
            helperProfileId: createdProfile.id,
            documentType: "business_registration",
            documentNumber: null,
            fileUrl: uploadResult.url,
            status: "pending",
          });
        }

        // Clear manifest after successful upload
        fileManifest.clear();
      } catch (uploadError) {
        console.error("File upload error:", uploadError);
        // Don't fail the entire request if file upload fails
        // User can upload documents later
      }

      // ===== STORE PAYOUT DETAILS (ENCRYPTED) =====
      try {
        if (data.bankAccountNumber) {
          void encryptBankDetails({
            accountHolderName: data.accountHolderName,
            bankAccountNumber: data.bankAccountNumber,
            ifscCode: data.ifscCode,
            upiId: data.upiId || null,
          });

          // Store in your payout_details table
          // await db.insert(payoutDetails).values({
          //   id: crypto.randomUUID(),
          //   helperProfileId: createdProfile.id,
          //   accountHolderNameEncrypted: encrypted.accountHolderName,
          //   bankAccountNumberEncrypted: encrypted.bankAccountNumber,
          //   ifscCodeEncrypted: encrypted.ifscCode,
          //   upiIdEncrypted: encrypted.upiId,
          //   bankAccountNumberMasked: `****${data.bankAccountNumber.slice(-4)}`,
          // });
        }
      } catch (error) {
        console.error("Payout details error:", error);
        // Bank details can be added later
      }

      // ===== UPDATE USER INFO =====
      try {
        await db
          .update(user)
          .set({
            name: data.fullName || data.businessName || session.user.name,
            phone: data.phone,
            updatedAt: new Date(),
          })
          .where(eq(user.id, session.user.id));
      } catch (error) {
        console.error("User update error:", error);
      }

      // ===== TRIGGER VERIFICATION WORKFLOW =====
      try {
        // Send verification email
        await sendVerificationEmail({
          email: session.user.email!,
          profileId: createdProfile.id,
          helperType: data.helperType,
        });

        // Queue verification task (using Bull, RabbitMQ, etc.)
        // await verificationQueue.add({
        //   profileId: createdProfile.id,
        //   documents: [/* list of document IDs */],
        // });
      } catch (error) {
        console.error("Verification workflow error:", error);
      }

      return NextResponse.json(
        {
          id: createdProfile.id,
          status: "pending",
          message:
            "Application submitted successfully. Verification in progress.",
        },
        { status: 201 }
      );
    } catch (error) {
      console.error("Profile creation error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Onboarding submission error:", error);
    return NextResponse.json(
      {
        message: "Server error during onboarding submission",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ============= STEP 3: VERIFICATION EMAIL TEMPLATE =============

async function sendVerificationEmail(_options: {
  email: string;
  profileId: string;
  helperType: string;
}) {
  void _options;
  // Using Resend (from your dependencies)
  // const { Resend } = require("resend");
  // const resend = new Resend(process.env.RESEND_API_KEY);

  // await resend.emails.send({
  //   from: "noreply@helperplatform.com",
  //   to: options.email,
  //   subject: "Verify Your Helper Profile",
  //   html: renderVerificationEmail({
  //     profileId: options.profileId,
  //     helperType: options.helperType,
  //   }),
  // });
}

// ============= STEP 4: HELPER UTILITIES =============

function generateSlug(text: string): string {
  const timestamp = Date.now();
  return `${text
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 20)}-${timestamp}`;
}

// ============= STEP 5: DATABASE QUERIES =============

/**
 * Get helper profile by user ID
 */
export async function getHelperProfile(userId: string) {
  try {
    return await db
      .select()
      .from(helperProfile)
      .where(eq(helperProfile.userId, userId))
      .limit(1);
  } catch (error) {
    console.error("Error fetching helper profile:", error);
    return null;
  }
}

/**
 * Get KYC documents for helper
 */
export async function getHelperKycDocuments(profileId: string) {
  try {
    return await db
      .select()
      .from(helperKycDocument)
      .where(
        and(
          eq(helperKycDocument.helperProfileId, profileId),
          isNull(helperKycDocument.supersededAt),
        ),
      );
  } catch (error) {
    console.error("Error fetching KYC documents:", error);
    return [];
  }
}

/**
 * Update verification status
 */
export async function updateVerificationStatus(
  profileId: string,
  status: "pending" | "approved" | "rejected" | "resubmission_required"
) {
  try {
    return await db
      .update(helperProfile)
      .set({
        verificationStatus: status,
        updatedAt: new Date(),
      })
      .where(eq(helperProfile.id, profileId))
      .returning();
  } catch (error) {
    console.error("Error updating verification status:", error);
    return null;
  }
}

// ============= STEP 6: ENCRYPTION UTILITY (Create this file) =============

/**
 * Create src/lib/encryption.ts
 * 
 * import crypto from "crypto";
 * 
 * const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-32-chars-long!!!!";
 * const ALGORITHM = "aes-256-gcm";
 * 
 * export function encryptBankDetails(data: {
 *   accountHolderName: string;
 *   bankAccountNumber: string;
 *   ifscCode: string;
 *   upiId: string | null;
 * }) {
 *   return {
 *     accountHolderName: encrypt(data.accountHolderName),
 *     bankAccountNumber: encrypt(data.bankAccountNumber),
 *     ifscCode: encrypt(data.ifscCode),
 *     upiId: data.upiId ? encrypt(data.upiId) : null,
 *   };
 * }
 * 
 * export function decryptBankDetails(encrypted: {
 *   accountHolderName: string;
 *   bankAccountNumber: string;
 *   ifscCode: string;
 *   upiId?: string | null;
 * }) {
 *   return {
 *     accountHolderName: decrypt(encrypted.accountHolderName),
 *     bankAccountNumber: decrypt(encrypted.bankAccountNumber),
 *     ifscCode: decrypt(encrypted.ifscCode),
 *     upiId: encrypted.upiId ? decrypt(encrypted.upiId) : null,
 *   };
 * }
 * 
 * function encrypt(text: string): string {
 *   const iv = crypto.randomBytes(16);
 *   const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
 *   let encrypted = cipher.update(text, "utf-8", "hex");
 *   encrypted += cipher.final("hex");
 *   const authTag = cipher.getAuthTag();
 *   return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
 * }
 * 
 * function decrypt(encrypted: string): string {
 *   const [iv, authTag, encryptedText] = encrypted.split(":");
 *   const decipher = crypto.createDecipheriv(
 *     ALGORITHM,
 *     Buffer.from(ENCRYPTION_KEY),
 *     Buffer.from(iv, "hex")
 *   );
 *   decipher.setAuthTag(Buffer.from(authTag, "hex"));
 *   let decrypted = decipher.update(encryptedText, "hex", "utf-8");
 *   decrypted += decipher.final("utf-8");
 *   return decrypted;
 * }
 */

// ============= STEP 7: ENVIRONMENT VARIABLES =============

/**
 * Add to .env.local:
 * 
 * # File Upload
 * NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
 * NEXT_PUBLIC_CLOUDINARY_PRESET=your_upload_preset
 * 
 * # Encryption
 * ENCRYPTION_KEY=your-32-character-encryption-key-here
 * 
 * # Email
 * RESEND_API_KEY=your_resend_api_key
 * FROM_EMAIL=noreply@helperplatform.com
 */

// ============= STEP 8: DATABASE MIGRATIONS =============

/**
 * If you need additional tables for payout_details, verification_audit, etc.
 * 
 * Run: npx drizzle-kit generate --name add_payout_details
 * 
 * Then create migration with:
 * 
 * export const payoutDetails = pgTable("payout_details", {
 *   id: text("id").primaryKey(),
 *   helperProfileId: text("helper_profile_id")
 *     .notNull()
 *     .references(() => helperProfile.id, { onDelete: "cascade" }),
 *   accountHolderNameEncrypted: text("account_holder_name_encrypted").notNull(),
 *   bankAccountNumberEncrypted: text("bank_account_number_encrypted").notNull(),
 *   bankAccountNumberMasked: text("bank_account_number_masked").notNull(),
 *   ifscCodeEncrypted: text("ifsc_code_encrypted").notNull(),
 *   upiIdEncrypted: text("upi_id_encrypted"),
 *   createdAt: timestamp("created_at").defaultNow().notNull(),
 *   updatedAt: timestamp("updated_at")
 *     .defaultNow()
 *     .$onUpdate(() => new Date())
 *     .notNull(),
 * });
 */

