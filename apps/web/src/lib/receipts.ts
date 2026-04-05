import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookingReceipt, paymentTransaction } from "@/db/schema";

function buildInvoiceNumber(bookingId: string, issuedAt: Date): string {
  const year = issuedAt.getUTCFullYear();
  const month = String(issuedAt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(issuedAt.getUTCDate()).padStart(2, "0");
  return `HP-${year}${month}${day}-${bookingId.slice(0, 8).toUpperCase()}`;
}

export async function ensureBookingReceipt(input: {
  bookingId: string;
  paymentTransactionId?: string | null;
}) {
  const existingReceipt = await db.query.bookingReceipt.findFirst({
    where: eq(bookingReceipt.bookingId, input.bookingId),
  });

  const paymentTransactionRecord = input.paymentTransactionId
    ? await db.query.paymentTransaction.findFirst({
        where: eq(paymentTransaction.id, input.paymentTransactionId),
      })
    : await db.query.paymentTransaction.findFirst({
        where: and(
          eq(paymentTransaction.bookingId, input.bookingId),
          eq(paymentTransaction.status, "captured"),
        ),
        orderBy: desc(paymentTransaction.capturedAt),
      });

  if (!paymentTransactionRecord) {
    return null;
  }

  const issuedAt = existingReceipt?.issuedAt ?? paymentTransactionRecord.capturedAt ?? new Date();
  const invoiceNumber = existingReceipt?.invoiceNumber ?? buildInvoiceNumber(input.bookingId, issuedAt);

  if (!existingReceipt) {
    const [createdReceipt] = await db
      .insert(bookingReceipt)
      .values({
        id: crypto.randomUUID(),
        bookingId: input.bookingId,
        paymentTransactionId: paymentTransactionRecord.id,
        invoiceNumber,
        fileUrl: `/api/bookings/${input.bookingId}/receipt`,
        issuedAt,
      })
      .returning();

    return createdReceipt;
  }

  if (!existingReceipt.paymentTransactionId) {
    const [updatedReceipt] = await db
      .update(bookingReceipt)
      .set({
        paymentTransactionId: paymentTransactionRecord.id,
      })
      .where(eq(bookingReceipt.id, existingReceipt.id))
      .returning();

    return updatedReceipt ?? existingReceipt;
  }

  if (!existingReceipt.invoiceNumber) {
    const [updatedReceipt] = await db
      .update(bookingReceipt)
      .set({
        invoiceNumber,
      })
      .where(eq(bookingReceipt.id, existingReceipt.id))
      .returning();

    return updatedReceipt ?? existingReceipt;
  }

  return existingReceipt;
}

function escapePdfText(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildPdfStream(lines: string[]): Uint8Array {
  const sanitizedLines = lines.map((line) => escapePdfText(line));
  const contentLines = [
    "BT",
    "/F1 18 Tf",
    "50 790 Td",
    `(${sanitizedLines[0] ?? "Receipt"}) Tj`,
    "/F1 11 Tf",
    "0 -28 Td",
  ];

  for (const line of sanitizedLines.slice(1)) {
    contentLines.push(`(${line}) Tj`);
    contentLines.push("0 -16 Td");
  }

  contentLines.push("ET");

  const stream = contentLines.join("\n");
  const pdfObjects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj\n",
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n",
    `5 0 obj << /Length ${Buffer.byteLength(stream, "utf8")} >> stream\n${stream}\nendstream\nendobj\n`,
  ];

  const header = "%PDF-1.4\n";
  const xrefOffsets: number[] = [0];
  let offset = Buffer.byteLength(header, "utf8");
  const chunks = [header];

  for (const object of pdfObjects) {
    xrefOffsets.push(offset);
    chunks.push(object);
    offset += Buffer.byteLength(object, "utf8");
  }

  const xrefStart = offset;
  const xrefEntries = ["xref\n0 6\n", "0000000000 65535 f \n"];
  for (const entryOffset of xrefOffsets.slice(1)) {
    xrefEntries.push(`${entryOffset.toString().padStart(10, "0")} 00000 n \n`);
  }

  const trailer = `trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(chunks.join("") + xrefEntries.join("") + trailer, "utf8");
}

export function buildBookingReceiptPdf(input: {
  invoiceNumber: string;
  bookingId: string;
  bookingTitle: string;
  customerName: string;
  helperName: string;
  serviceAddress: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentAmount: number;
  platformFee: number;
  helperEarning: number;
  currency: string;
  issuedAt: Date;
  capturedAt: Date | null;
  providerPaymentId?: string | null;
}) {
  const lines = [
    "Helper Platform Receipt",
    `Invoice: ${input.invoiceNumber}`,
    `Booking ID: ${input.bookingId}`,
    `Service: ${input.bookingTitle}`,
    `Customer: ${input.customerName}`,
    `Helper: ${input.helperName}`,
    `Address: ${input.serviceAddress}`,
    `Payment status: ${input.paymentStatus}`,
    `Payment method: ${input.paymentMethod}`,
    `Amount paid: ${formatMoney(input.paymentAmount, input.currency)}`,
    `Platform fee: ${formatMoney(input.platformFee, input.currency)}`,
    `Helper earnings: ${formatMoney(input.helperEarning, input.currency)}`,
    `Captured at: ${input.capturedAt ? input.capturedAt.toLocaleString("en-IN") : "N/A"}`,
    `Issued at: ${input.issuedAt.toLocaleString("en-IN")}`,
    input.providerPaymentId ? `Provider payment ID: ${input.providerPaymentId}` : "",
  ].filter((line) => line.trim().length > 0);

  return buildPdfStream(lines);
}
