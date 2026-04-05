import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { booking, helperProfile, paymentTransaction } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { buildBookingReceiptPdf, ensureBookingReceipt } from "@/lib/receipts";

const categoryLabels: Record<string, string> = {
  driver: "Driver",
  electrician: "Electrician",
  plumber: "Plumber",
  cleaner: "Cleaner",
  chef: "Chef",
  delivery_helper: "Delivery Helper",
  caretaker: "Caretaker",
  security_guard: "Security Guard",
  other: "Other",
};

function formatBookingTitle(categoryId: string, subcategoryId?: string | null): string {
  const category = categoryLabels[categoryId] ?? categoryId;
  return subcategoryId ? `${category} · ${subcategoryId}` : category;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: bookingId } = await context.params;
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    const bookingRecord = await db.query.booking.findFirst({
      where: eq(booking.id, bookingId),
    });

    if (!bookingRecord) {
      return NextResponse.json({ message: "Booking not found." }, { status: 404, headers: NO_STORE_HEADERS });
    }

    const isCustomer = bookingRecord.customerId === session.user.id;
    const isAssignedHelper = bookingRecord.helperId === session.user.id;

    if (!isCustomer && !isAssignedHelper && session.user.role !== "admin") {
      const profile = await db.query.helperProfile.findFirst({
        where: eq(helperProfile.userId, session.user.id),
        columns: { id: true },
      });

      if (!profile || bookingRecord.helperProfileId !== profile.id) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: NO_STORE_HEADERS });
      }
    }

    const receipt = await ensureBookingReceipt({ bookingId });
    if (!receipt) {
      return NextResponse.json(
        { message: "Receipt is available only after payment capture." },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    const payment = receipt.paymentTransactionId
      ? await db.query.paymentTransaction.findFirst({
          where: eq(paymentTransaction.id, receipt.paymentTransactionId),
        })
      : await db.query.paymentTransaction.findFirst({
          where: eq(paymentTransaction.bookingId, bookingId),
        });

    if (!payment || payment.status !== "captured") {
      return NextResponse.json(
        { message: "Receipt is available only after payment capture." },
        { status: 409, headers: NO_STORE_HEADERS },
      );
    }

    const customerName = bookingRecord.customerName ?? "Customer";
    const helperName = bookingRecord.helperName ?? "Helper";
    const addressParts = [bookingRecord.addressLine, bookingRecord.area, bookingRecord.city, bookingRecord.state, bookingRecord.postalCode]
      .filter((part): part is string => Boolean(part && part.trim().length > 0));

    const pdf = buildBookingReceiptPdf({
      invoiceNumber: receipt.invoiceNumber ?? `HP-${bookingId.slice(0, 8).toUpperCase()}`,
      bookingId: bookingRecord.id,
      bookingTitle: formatBookingTitle(bookingRecord.categoryId, bookingRecord.subcategoryId),
      customerName,
      helperName,
      serviceAddress: addressParts.join(", "),
      paymentStatus: payment.status.replaceAll("_", " "),
      paymentMethod: payment.method,
      paymentAmount: payment.amount,
      platformFee: payment.platformFee,
      helperEarning: payment.helperEarning,
      currency: payment.currency,
      issuedAt: receipt.issuedAt,
      capturedAt: payment.capturedAt,
      providerPaymentId: payment.providerPaymentId,
    });

    const fileName = `${receipt.invoiceNumber ?? `receipt-${bookingId}`}.pdf`;
    return new NextResponse(Buffer.from(pdf), {
      status: 200,
      headers: {
        ...NO_STORE_HEADERS,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Receipt download error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}
