import { NextRequest, NextResponse } from "next/server";
import { helperProfile,  organization } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { db } from "@/db";
import { NO_STORE_HEADERS } from "@/lib/http/cache";


/**
 * POST /api/helpers/onboarding
 * Handle helper onboarding submission
 * Creates helper profile and stores onboarding data
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.helperType || !data.primaryCategory || !data.phone || !data.city) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // For agency: create organization if needed
    let organizationId: string | null = null;
    if (data.helperType === "agency") {
      const result = await db
        .insert(organization)
        .values({
          id: crypto.randomUUID(),
          name: data.businessName,
          slug: `${data.businessName.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
          logo: data.logoUrl || null,
          metadata: JSON.stringify({
            businessAddress: data.businessAddress,
            gstNumber: data.gstNumber || null,
          }),
        })
        .returning();

      organizationId = result[0]?.id || null;
    }

    // Create or update helper profile
    const helperProfileData = {
      id: crypto.randomUUID(),
      userId: session.user.id,
      organizationId,
      primaryCategory: data.primaryCategory,
      headline: data.bio?.substring(0, 100) || null,
      bio: data.bio || null,
      yearsExperience: data.yearsExperience || 0,
      serviceCity: data.city,
      serviceRadiusKm: data.serviceRadiusKm || 8,
      verificationStatus: "pending" as const,
      availabilityStatus: data.isOnline ? ("online" as const) : ("offline" as const),
    };

    const result = await db
      .insert(helperProfile)
      .values(helperProfileData)
      .returning();

    const createdProfile = result[0];

    // TODO: Store KYC documents
    // TODO: Store bank/payout details securely
    // TODO: Trigger verification workflow
    // TODO: Send confirmation email

    return NextResponse.json(
      {
        id: createdProfile.id,
        status: "pending",
        message: "Application submitted successfully. Verification in progress.",
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Onboarding submission error:", error);
    return NextResponse.json(
      {
        message: "Server error during onboarding submission",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

