import { headers } from "next/headers";
import { and, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { connection } from "next/server";
import { db } from "@/db";
import { bookingCandidate, helperProfile } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

function isPrerenderHangError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    (error as { digest?: string }).digest === "HANGING_PROMISE_REJECTION"
  );
}

function serializeDate(value: Date | null) {
  return value ? value.toISOString() : null;
}

function canReceiveJobs(profile: {
  verificationStatus: "pending" | "approved" | "rejected" | "resubmission_required";
  videoKycStatus: "not_required" | "pending_schedule" | "scheduled" | "passed" | "failed";
  availabilityStatus: "online" | "offline" | "busy";
  isActive: boolean;
}) {
  return (
    profile.verificationStatus === "approved" &&
    profile.videoKycStatus === "passed" &&
    profile.availabilityStatus === "online" &&
    profile.isActive
  );
}

export async function GET() {
  try {
    await connection();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    if (session.user.role !== "helper") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: NO_STORE_HEADERS });
    }

    const profile = await db.query.helperProfile.findFirst({
      where: eq(helperProfile.userId, session.user.id),
      columns: {
        id: true,
        primaryCategory: true,
        serviceCity: true,
        verificationStatus: true,
        videoKycStatus: true,
        availabilityStatus: true,
        isActive: true,
        completedJobs: true,
        averageRating: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          profile: null,
          canReceiveJobs: false,
          jobs: [],
        },
        { status: 200, headers: NO_STORE_HEADERS }
      );
    }

    const pendingCandidates = await db.query.bookingCandidate.findMany({
      where: and(
        eq(bookingCandidate.helperProfileId, profile.id),
        eq(bookingCandidate.response, "pending")
      ),
      orderBy: desc(bookingCandidate.offeredAt),
      with: {
        booking: {
          columns: {
            id: true,
            status: true,
            addressLine: true,
            area: true,
            city: true,
            state: true,
            postalCode: true,
            notes: true,
            quotedAmount: true,
            currency: true,
            requestedAt: true,
            acceptanceDeadline: true,
            scheduledFor: true,
          },
          with: {
            customer: {
              columns: {
                id: true,
                name: true,
                email: true,
              },
            },
            category: {
              columns: {
                id: true,
                slug: true,
                name: true,
              },
            },
            subcategory: {
              columns: {
                id: true,
                slug: true,
                name: true,
              },
            },
          },
        },
      },
    });

    const now = new Date();
    const expiredCandidateIds = pendingCandidates
      .filter((candidate) => candidate.expiresAt && candidate.expiresAt <= now)
      .map((candidate) => candidate.id);

    if (expiredCandidateIds.length > 0) {
      await db
        .update(bookingCandidate)
        .set({
          response: "timeout",
          respondedAt: now,
        })
        .where(inArray(bookingCandidate.id, expiredCandidateIds));
    }

    const jobs = canReceiveJobs(profile)
      ? pendingCandidates
          .filter(
            (candidate) =>
              (!candidate.expiresAt || candidate.expiresAt > now) &&
              ["requested", "matched"].includes(candidate.booking.status)
          )
          .map((candidate) => ({
            candidateId: candidate.id,
            bookingId: candidate.booking.id,
            customer: candidate.booking.customer,
            category: candidate.booking.category,
            subcategory: candidate.booking.subcategory,
            addressLine: candidate.booking.addressLine,
            area: candidate.booking.area,
            city: candidate.booking.city,
            state: candidate.booking.state,
            postalCode: candidate.booking.postalCode,
            notes: candidate.booking.notes,
            quotedAmount: candidate.booking.quotedAmount,
            currency: candidate.booking.currency,
            requestedAt: serializeDate(candidate.booking.requestedAt),
            acceptanceDeadline: serializeDate(candidate.booking.acceptanceDeadline),
            scheduledFor: serializeDate(candidate.booking.scheduledFor),
            offeredAt: serializeDate(candidate.offeredAt),
            expiresAt: serializeDate(candidate.expiresAt),
            rankScore: candidate.rankScore,
            distanceKm: candidate.distanceKm,
          }))
      : [];

    return NextResponse.json(
      {
        profile,
        canReceiveJobs: canReceiveJobs(profile),
        jobs,
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    if (!isPrerenderHangError(error)) {
      console.error("Fetch incoming jobs error:", error);
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
