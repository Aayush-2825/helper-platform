import { and, eq, gte, isNull, lt } from "drizzle-orm";
import { db } from "@/db";
import { helperKycDocument, helperProfile } from "@/db/schema";
import { enqueueHelperNotification } from "@/lib/notifications/helper-events";

export async function runDocExpiryCron() {
  const now = new Date();

  const dayStartUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const dayMs = 24 * 60 * 60 * 1000;
  const expiringSoonStart = new Date(dayStartUtc.getTime() + 7 * dayMs);
  const expiringSoonEnd = new Date(dayStartUtc.getTime() + 8 * dayMs);

  const expiringSoon = await db
    .select({
      documentType: helperKycDocument.documentType,
      expiresAt: helperKycDocument.expiresAt,
      userId: helperProfile.userId,
    })
    .from(helperKycDocument)
    .innerJoin(helperProfile, eq(helperProfile.id, helperKycDocument.helperProfileId))
    .where(
      and(
        isNull(helperKycDocument.supersededAt),
        eq(helperKycDocument.status, "approved"),
        gte(helperKycDocument.expiresAt, expiringSoonStart),
        lt(helperKycDocument.expiresAt, expiringSoonEnd),
      ),
    );

  const expiringSoonByUser = new Map<string, { docTypes: Set<string>; earliestExpiry: Date | null }>();
  for (const doc of expiringSoon) {
    const existing = expiringSoonByUser.get(doc.userId) ?? {
      docTypes: new Set<string>(),
      earliestExpiry: null,
    };

    existing.docTypes.add(doc.documentType);
    if (doc.expiresAt && (!existing.earliestExpiry || doc.expiresAt < existing.earliestExpiry)) {
      existing.earliestExpiry = doc.expiresAt;
    }

    expiringSoonByUser.set(doc.userId, existing);
  }

  for (const [userId, payload] of expiringSoonByUser.entries()) {
    await enqueueHelperNotification({
      helperUserId: userId,
      event: "doc_expiring_soon",
      meta: {
        docTypes: Array.from(payload.docTypes),
        expiresAt: payload.earliestExpiry?.toISOString(),
      },
    });
  }

  const expired = await db
    .select({
      profileId: helperProfile.id,
      userId: helperProfile.userId,
      documentType: helperKycDocument.documentType,
    })
    .from(helperKycDocument)
    .innerJoin(helperProfile, eq(helperProfile.id, helperKycDocument.helperProfileId))
    .where(
      and(
        isNull(helperKycDocument.supersededAt),
        eq(helperKycDocument.status, "approved"),
        lt(helperKycDocument.expiresAt, now),
        eq(helperProfile.isActive, true),
      ),
    );

  const expiredByProfile = new Map<string, { userId: string; docTypes: Set<string> }>();
  for (const doc of expired) {
    const existing = expiredByProfile.get(doc.profileId) ?? { userId: doc.userId, docTypes: new Set<string>() };
    existing.docTypes.add(doc.documentType);
    expiredByProfile.set(doc.profileId, existing);
  }

  for (const [profileId, payload] of expiredByProfile.entries()) {
    await db
      .update(helperProfile)
      .set({
        verificationStatus: "resubmission_required",
        isActive: false,
        blockResubmission: false,
        videoKycStatus: "not_required",
        updatedAt: new Date(),
      })
      .where(eq(helperProfile.id, profileId));

    await enqueueHelperNotification({
      helperUserId: payload.userId,
      event: "doc_expired",
      meta: {
        docTypes: Array.from(payload.docTypes),
      },
    });
  }

  return {
    warned: expiringSoon.length,
    warnedUsers: expiringSoonByUser.size,
    suspended: expired.length,
    suspendedProfiles: expiredByProfile.size,
  };
}
