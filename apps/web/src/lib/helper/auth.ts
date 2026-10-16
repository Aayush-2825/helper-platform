import { eq } from "drizzle-orm";
import { db } from "@/db";
import { helperProfile, user } from "@/db/schema";

/**
 * Checks whether the current user is authorized as a helper or admin.
 * If the user's session role is stale, falls back to database lookup and self-heals
 * the user's role to 'helper' if they have an active helper profile.
 */
export async function isAuthorizedHelper(userId: string, sessionRole?: string | null): Promise<boolean> {
  if (sessionRole === "helper" || sessionRole === "admin") {
    return true;
  }

  try {
    const dbUser = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: { role: true },
    });

    if (dbUser?.role === "helper" || dbUser?.role === "admin") {
      return true;
    }

    const profile = await db.query.helperProfile.findFirst({
      where: eq(helperProfile.userId, userId),
      columns: { id: true },
    });

    if (profile) {
      if (dbUser && dbUser.role !== "helper" && dbUser.role !== "admin") {
        await db.update(user).set({ role: "helper", updatedAt: new Date() }).where(eq(user.id, userId));
      }
      return true;
    }
  } catch (error) {
    console.error("[isAuthorizedHelper] Error verifying helper status:", error);
  }

  return false;
}
