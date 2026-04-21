import { headers } from "next/headers";
import { and, desc, eq, inArray, or } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { booking, bookingStatusEvent, dispute, notificationEvent } from "@/db/schema";
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
      columns: { id: true, customerId: true, helperId: true, status: true },
    });

    if (!bookingRecord) {
      return NextResponse.json({ message: "Booking not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    const isParticipant =
      bookingRecord.customerId === session.user.id || bookingRecord.helperId === session.user.id || session.user.role === "admin";

    if (!isParticipant) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: NO_STORE_HEADERS });
    }

    if (!inArrayValue(bookingRecord.status, ["accepted", "in_progress", "completed", "disputed"])) {
      return NextResponse.json(
        { message: "Disputes can only be raised for accepted, in-progress, or completed bookings." },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    const openDispute = await db.query.dispute.findFirst({
      where: and(
        eq(dispute.bookingId, parsed.data.bookingId),
        inArray(dispute.status, ["open", "investigating"]),
      ),
      columns: { id: true },
    });

    if (openDispute) {
      return NextResponse.json(
        { message: "An active dispute already exists for this booking." },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    const defaultAgainstUserId =
      session.user.id === bookingRecord.customerId
        ? bookingRecord.helperId
        : bookingRecord.customerId;

    const now = new Date();
    const [createdDispute] = await db.transaction(async (tx) => {
      const [newDispute] = await tx
        .insert(dispute)
        .values({
          id: crypto.randomUUID(),
          bookingId: parsed.data.bookingId,
          raisedByUserId: session.user.id,
          againstUserId: parsed.data.againstUserId ?? defaultAgainstUserId ?? null,
          reasonCode: parsed.data.reasonCode,
          description: parsed.data.description,
          status: "open",
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      if (bookingRecord.status !== "disputed") {
        await tx
          .update(booking)
          .set({
            status: "disputed",
            updatedAt: now,
          })
          .where(and(eq(booking.id, bookingRecord.id), eq(booking.status, bookingRecord.status)));

        await tx.insert(bookingStatusEvent).values({
          id: crypto.randomUUID(),
          bookingId: bookingRecord.id,
          status: "disputed",
          actorUserId: session.user.id,
          note: "Dispute opened",
          metadata: {
            disputeId: newDispute.id,
            reasonCode: parsed.data.reasonCode,
          },
        });
      }

      return [newDispute];
    });

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
      columns: {
        id: true,
        bookingId: true,
        raisedByUserId: true,
        againstUserId: true,
        status: true,
      },
    });

    if (!existing) {
      return NextResponse.json({ message: "Dispute not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    if (!inArrayValue(existing.status, ["open", "investigating"])) {
      return NextResponse.json(
        { message: "Dispute is already finalized." },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    const now = new Date();
    const isFinalState = parsed.data.status === "resolved" || parsed.data.status === "rejected";

    const [updated] = await db.transaction(async (tx) => {
      const [updatedDispute] = await tx
        .update(dispute)
        .set({
          status: parsed.data.status,
          resolutionType: parsed.data.status === "resolved" ? parsed.data.resolutionType : null,
          resolutionAmount: parsed.data.status === "resolved" ? parsed.data.resolutionAmount : null,
          adminNotes: parsed.data.adminNotes,
          resolvedByUserId: isFinalState ? session.user.id : null,
          resolvedAt: isFinalState ? now : null,
          updatedAt: now,
        })
        .where(and(eq(dispute.id, parsed.data.disputeId), eq(dispute.status, existing.status)))
        .returning();

      if (!updatedDispute) {
        return [null as unknown as typeof updatedDispute];
      }

      if (isFinalState) {
        const [resolvedBooking] = await tx
          .update(booking)
          .set({
            status: "completed",
            updatedAt: now,
          })
          .where(and(eq(booking.id, existing.bookingId), eq(booking.status, "disputed")))
          .returning({ id: booking.id });

        if (resolvedBooking) {
          await tx.insert(bookingStatusEvent).values({
            id: crypto.randomUUID(),
            bookingId: existing.bookingId,
            status: "completed",
            actorUserId: session.user.id,
            note: "Dispute finalized",
            metadata: {
              disputeId: updatedDispute.id,
              disputeStatus: parsed.data.status,
              resolutionType: parsed.data.resolutionType ?? null,
              resolutionAmount: parsed.data.resolutionAmount ?? null,
            },
          });
        }
      }

      const participantIds = [...new Set([existing.raisedByUserId, existing.againstUserId].filter(Boolean))];

      const events = [
        {
          id: crypto.randomUUID(),
          userId: session.user.id,
          channel: "admin_audit",
          templateKey: "admin.dispute.status_updated",
          status: "queued",
          payload: {
            action: "dispute_status_updated",
            disputeId: updatedDispute.id,
            bookingId: updatedDispute.bookingId,
            previousStatus: existing.status,
            nextStatus: updatedDispute.status,
            resolutionType: updatedDispute.resolutionType,
            resolutionAmount: updatedDispute.resolutionAmount,
            updatedAt: now.toISOString(),
          },
        },
      ];

      for (const participantId of participantIds) {
        events.push({
          id: crypto.randomUUID(),
          userId: participantId,
          channel: "in_app",
          templateKey: "dispute.status_updated",
          status: "queued",
          payload: {
            disputeId: updatedDispute.id,
            bookingId: updatedDispute.bookingId,
            status: updatedDispute.status,
            adminNotes: updatedDispute.adminNotes,
            resolutionType: updatedDispute.resolutionType,
            resolutionAmount: updatedDispute.resolutionAmount,
          },
        });
      }

      await tx.insert(notificationEvent).values(events);

      return [updatedDispute];
    });

    if (!updated) {
      return NextResponse.json(
        { message: "Dispute was updated by another admin. Refresh and try again." },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    return NextResponse.json({ message: "Dispute updated successfully.", dispute: updated }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Disputes PATCH error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}

function inArrayValue<T extends string>(value: T, allowed: readonly T[]) {
  return allowed.includes(value);
}

