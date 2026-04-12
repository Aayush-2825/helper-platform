import { headers } from "next/headers";
import { desc, eq, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { booking, dispute } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

const createDisputeSchema = z.object({
  bookingId: z.string().min(1),
  reasonCode: z.string().min(1),
  description: z.string().min(10),
  againstUserId: z.string().optional(),
});

const updateDisputeSchema = z.object({
  disputeId: z.string().min(1),
  status: z.enum(["investigating", "resolved", "rejected"]),
  resolutionType: z.enum(["refund_full", "refund_partial", "no_refund", "credit_note", "other"]).optional(),
  resolutionAmount: z.number().int().nonnegative().optional(),
  adminNotes: z.string().trim().min(1).optional(),
});

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const isAdmin = session.user.role === "admin";

    const disputes = isAdmin
      ? await db.query.dispute.findMany({
          orderBy: desc(dispute.createdAt),
          with: {
            booking: {
              columns: { id: true, status: true, addressLine: true, city: true, categoryId: true },
            },
            raisedByUser: {
              columns: { id: true, name: true, email: true },
            },
            againstUser: {
              columns: { id: true, name: true, email: true },
            },
          },
        })
      : await db.query.dispute.findMany({
          where: or(eq(dispute.raisedByUserId, session.user.id), eq(dispute.againstUserId, session.user.id)),
          orderBy: desc(dispute.createdAt),
        });

    return NextResponse.json({ disputes }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Disputes GET error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const body = await request.json().catch(() => null);
    const parsed = createDisputeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid dispute request.", errors: parsed.error.flatten() },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const bookingRecord = await db.query.booking.findFirst({
      where: eq(booking.id, parsed.data.bookingId),
      columns: { id: true, customerId: true, helperId: true },
    });

    if (!bookingRecord) {
      return NextResponse.json({ message: "Booking not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    const isParticipant =
      bookingRecord.customerId === session.user.id || bookingRecord.helperId === session.user.id || session.user.role === "admin";

    if (!isParticipant) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: NO_STORE_HEADERS });
    }

    const [createdDispute] = await db
      .insert(dispute)
      .values({
        id: crypto.randomUUID(),
        bookingId: parsed.data.bookingId,
        raisedByUserId: session.user.id,
        againstUserId: parsed.data.againstUserId ?? bookingRecord.helperId ?? null,
        reasonCode: parsed.data.reasonCode,
        description: parsed.data.description,
        status: "open",
      })
      .returning();

    return NextResponse.json({ message: "Dispute created successfully.", dispute: createdDispute }, { status: 201, headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Disputes POST error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateDisputeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid dispute update.", errors: parsed.error.flatten() },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    const existing = await db.query.dispute.findFirst({
      where: eq(dispute.id, parsed.data.disputeId),
      columns: { id: true },
    });

    if (!existing) {
      return NextResponse.json({ message: "Dispute not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    const now = new Date();
    const [updated] = await db
      .update(dispute)
      .set({
        status: parsed.data.status,
        resolutionType: parsed.data.resolutionType,
        resolutionAmount: parsed.data.resolutionAmount,
        adminNotes: parsed.data.adminNotes,
        resolvedByUserId: parsed.data.status === "resolved" ? session.user.id : undefined,
        resolvedAt: parsed.data.status === "resolved" ? now : undefined,
        updatedAt: now,
      })
      .where(eq(dispute.id, parsed.data.disputeId))
      .returning();

    return NextResponse.json({ message: "Dispute updated successfully.", dispute: updated }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Disputes PATCH error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}

