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

// ---------------------------------------------------------------------------
// PDF helpers
// ---------------------------------------------------------------------------

/** Escape special characters for PDF string literals */
function esc(value: string): string {
  return String(value ?? "")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)")
    .replaceAll("\r", "")
    .replaceAll("\n", " ");
}

/** Format currency in Indian locale without relying on unsupported Type1 font glyphs */
function formatMoney(amount: number, _currency: string): string {
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `Rs. ${formatted}`;
}

/** Format a Date nicely for Indian locale */
function formatDate(d: Date | null | undefined): string {
  if (!d) return "N/A";
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
}

// ---------------------------------------------------------------------------
// Low-level PDF builder — no external dependencies, A4 page (595 × 842 pts)
// ---------------------------------------------------------------------------

interface PdfBuilder {
  ops: string[];
  /** Current Y position (from top — we convert to PDF coords internally) */
  y: number;
  pageH: number;
  marginL: number;
  marginR: number;
  pageW: number;
}

function makeBuilder(): PdfBuilder {
  return {
    ops: [],
    y: 40, // start 40 pts from top
    pageH: 842,
    pageW: 595,
    marginL: 50,
    marginR: 50,
  };
}

/** Convert top-based Y to PDF bottom-based Y */
function pdfY(b: PdfBuilder, topY: number) {
  return b.pageH - topY;
}

function usableW(b: PdfBuilder) {
  return b.pageW - b.marginL - b.marginR;
}

/** Move cursor down by `pts` points */
function moveDown(b: PdfBuilder, pts: number) {
  b.y += pts;
}

/** Draw filled rectangle (CMYK not needed — use RGB via `rg` operator) */
function fillRect(b: PdfBuilder, x: number, topY: number, w: number, h: number, r: number, g: number, rb: number) {
  const by = pdfY(b, topY) - h;
  b.ops.push(`${r.toFixed(3)} ${g.toFixed(3)} ${rb.toFixed(3)} rg`);
  b.ops.push(`${x} ${by} ${w} ${h} re f`);
  b.ops.push("0 0 0 rg"); // reset to black
}

/** Draw a horizontal rule */
function hRule(b: PdfBuilder, x: number, topY: number, w: number, thickness: number, r = 0, g = 0, rb = 0) {
  const by = pdfY(b, topY);
  b.ops.push(`${r.toFixed(3)} ${g.toFixed(3)} ${rb.toFixed(3)} RG`);
  b.ops.push(`${thickness} w`);
  b.ops.push(`${x} ${by} m ${x + w} ${by} l S`);
  b.ops.push("0 0 0 RG");
  b.ops.push("1 w");
}

type FontKey = "H" | "HB"; // Helvetica | Helvetica-Bold

/** Emit a single text run (no word wrap) */
function text(
  b: PdfBuilder,
  str: string,
  x: number,
  topY: number,
  size: number,
  font: FontKey = "H",
  r = 0,
  g = 0,
  rb = 0,
) {
  const by = pdfY(b, topY);
  const f = font === "HB" ? "/HB" : "/H";
  b.ops.push(`${r.toFixed(3)} ${g.toFixed(3)} ${rb.toFixed(3)} rg`);
  b.ops.push(`BT ${f} ${size} Tf ${x} ${by} Td (${esc(str)}) Tj ET`);
  b.ops.push("0 0 0 rg");
}

/** Draw text that wraps within maxW, returns new Y after last line */
function wrappedText(
  b: PdfBuilder,
  str: string,
  x: number,
  topY: number,
  size: number,
  font: FontKey,
  maxW: number,
  lineH: number,
): number {
  // Approximate character width: Helvetica ~0.55× size per char
  const approxCharW = size * 0.55;
  const charsPerLine = Math.max(10, Math.floor(maxW / approxCharW));

  const words = str.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (test.length > charsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  let cy = topY;
  for (const line of lines) {
    text(b, line, x, cy, size, font);
    cy += lineH;
  }
  return cy;
}

/** Two-column label: value row */
function labelValue(
  b: PdfBuilder,
  label: string,
  value: string,
  x: number,
  topY: number,
  size: number,
  valueX?: number,
) {
  const vx = valueX ?? x + 130;
  text(b, label, x, topY, size, "HB");
  text(b, value, vx, topY, size, "H");
}

/** Table row with two columns, optional highlight */
function tableRow(
  b: PdfBuilder,
  col1: string,
  col2: string,
  topY: number,
  highlight = false,
  size = 10,
) {
  const rowH = 20;
  if (highlight) {
    // light orange background
    fillRect(b, b.marginL, topY, usableW(b), rowH, 1.0, 0.97, 0.93);
  }
  text(b, col1, b.marginL + 6, topY + 13, size, highlight ? "HB" : "H");
  const col2X = b.marginL + usableW(b) - 130;
  text(b, col2, col2X, topY + 13, size, highlight ? "HB" : "H");
}

// ---------------------------------------------------------------------------
// Public: build the full-page professional receipt PDF
// ---------------------------------------------------------------------------

export function buildBookingReceiptPdf(input: {
  invoiceNumber: string;
  bookingId: string;
  bookingTitle: string;
  customerName: string;
  helperName: string;
  serviceAddress: string;
  paymentStatus: string;
  paymentMethod: string | null | undefined;
  paymentAmount: number;
  platformFee: number;
  helperEarning: number;
  currency: string;
  issuedAt: Date;
  capturedAt: Date | null;
  providerPaymentId?: string | null;
}): Uint8Array {
  const b = makeBuilder();
  const W = usableW(b);
  const L = b.marginL;

  // ── Header orange bar ─────────────────────────────────────────────────────
  fillRect(b, 0, 0, b.pageW, 72, 0.976, 0.569, 0.059); // orange #f96110

  // DOZO logo text in white
  text(b, "DOZO", L, 28, 28, "HB", 1, 1, 1);
  text(b, "Service Receipt", L, 52, 11, "H", 1, 1, 1);

  // Invoice number top-right in white
  const invLabel = `Invoice: ${input.invoiceNumber}`;
  const invX = b.pageW - b.marginR - invLabel.length * 6.2;
  text(b, invLabel, invX, 36, 10, "HB", 1, 1, 1);
  const dateLabel = formatDate(input.issuedAt);
  const dateX = b.pageW - b.marginR - dateLabel.length * 5.8;
  text(b, dateLabel, dateX, 52, 9, "H", 1, 1, 1);

  b.y = 88;

  // ── Status pill ───────────────────────────────────────────────────────────
  const statusText = `Payment ${input.paymentStatus.toUpperCase()}`;
  // green background for captured
  const isCaptured = input.paymentStatus.toLowerCase().includes("captured");
  if (isCaptured) {
    fillRect(b, L, b.y, 120, 18, 0.125, 0.737, 0.384); // green
  } else {
    fillRect(b, L, b.y, 120, 18, 0.961, 0.620, 0.043); // orange-ish
  }
  text(b, statusText, L + 8, b.y + 13, 9, "HB", 1, 1, 1);
  moveDown(b, 30);

  // ── Section: Service Details ──────────────────────────────────────────────
  text(b, "SERVICE DETAILS", L, b.y, 9, "HB", 0.608, 0.608, 0.608);
  moveDown(b, 4);
  hRule(b, L, b.y, W, 0.5, 0.85, 0.85, 0.85);
  moveDown(b, 10);

  labelValue(b, "Service:", input.bookingTitle, L, b.y, 10);
  moveDown(b, 16);
  labelValue(b, "Booking ID:", input.bookingId, L, b.y, 10);
  moveDown(b, 16);

  // Address may be long — wrap it
  text(b, "Address:", L, b.y, 10, "HB");
  const afterAddr = wrappedText(b, input.serviceAddress || "—", L + 130, b.y, 10, "H", W - 140, 15);
  b.y = Math.max(b.y + 16, afterAddr + 2);

  moveDown(b, 8);

  // ── Section: Party Details ────────────────────────────────────────────────
  text(b, "PARTY DETAILS", L, b.y, 9, "HB", 0.608, 0.608, 0.608);
  moveDown(b, 4);
  hRule(b, L, b.y, W, 0.5, 0.85, 0.85, 0.85);
  moveDown(b, 10);

  // Two-column layout: Customer on left, Helper on right
  const colW = W / 2 - 10;
  const col2Start = L + W / 2 + 10;

  text(b, "Customer", L, b.y, 9, "HB", 0.608, 0.608, 0.608);
  text(b, "Helper / Professional", col2Start, b.y, 9, "HB", 0.608, 0.608, 0.608);
  moveDown(b, 14);

  wrappedText(b, input.customerName, L, b.y, 11, "HB", colW, 15);
  wrappedText(b, input.helperName, col2Start, b.y, 11, "HB", colW, 15);
  moveDown(b, 28);

  // ── Section: Payment Breakdown ────────────────────────────────────────────
  text(b, "PAYMENT BREAKDOWN", L, b.y, 9, "HB", 0.608, 0.608, 0.608);
  moveDown(b, 4);
  hRule(b, L, b.y, W, 0.5, 0.85, 0.85, 0.85);
  moveDown(b, 4);

  // Table header
  fillRect(b, L, b.y, W, 20, 0.95, 0.95, 0.95);
  text(b, "Description", L + 6, b.y + 13, 9, "HB", 0.4, 0.4, 0.4);
  text(b, "Amount", L + W - 124, b.y + 13, 9, "HB", 0.4, 0.4, 0.4);
  moveDown(b, 20);

  const currency = input.currency ?? "INR";

  // Row: Service Amount (subtotal)
  tableRow(b, input.bookingTitle, formatMoney(input.paymentAmount - input.platformFee, currency), b.y);
  moveDown(b, 20);

  // Row: Platform Fee
  tableRow(b, "Platform Fee (DOZO)", formatMoney(input.platformFee, currency), b.y);
  moveDown(b, 20);

  // Divider
  hRule(b, L, b.y, W, 0.8, 0.85, 0.85, 0.85);
  moveDown(b, 4);

  // Row: Total (highlighted)
  tableRow(b, "Total Paid", formatMoney(input.paymentAmount, currency), b.y, true, 11);
  moveDown(b, 20);

  // Row: Helper Earnings
  tableRow(b, "Helper Earnings (net)", formatMoney(input.helperEarning, currency), b.y);
  moveDown(b, 24);

  // ── Section: Payment Info ─────────────────────────────────────────────────
  text(b, "PAYMENT INFORMATION", L, b.y, 9, "HB", 0.608, 0.608, 0.608);
  moveDown(b, 4);
  hRule(b, L, b.y, W, 0.5, 0.85, 0.85, 0.85);
  moveDown(b, 12);

  const halfW = W / 2 - 10;
  const r2 = L + W / 2 + 10;

  labelValue(b, "Method:", input.paymentMethod ?? "—", L, b.y, 10, L + 100);
  labelValue(b, "Status:", input.paymentStatus, r2, b.y, 10, r2 + 100);
  moveDown(b, 16);

  labelValue(b, "Captured At:", formatDate(input.capturedAt), L, b.y, 10, L + 100);
  moveDown(b, 16);

  if (input.providerPaymentId) {
    labelValue(b, "Payment Ref:", input.providerPaymentId, L, b.y, 10, L + 100);
    moveDown(b, 16);
  }

  moveDown(b, 12);

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = b.pageH - 55;
  hRule(b, 0, footerY, b.pageW, 0.5, 0.85, 0.85, 0.85);
  const footerTextY = footerY + 14;

  text(b, "DOZO — Connecting you with trusted local helpers", L, footerTextY, 8, "H", 0.5, 0.5, 0.5);
  text(b, `Invoice ${input.invoiceNumber}  ·  dozo.work`, L, footerTextY + 13, 8, "H", 0.65, 0.65, 0.65);

  const footerRight = "This is a computer-generated receipt.";
  const frX = b.pageW - b.marginR - footerRight.length * 4.6;
  text(b, footerRight, frX, footerTextY, 8, "H", 0.5, 0.5, 0.5);

  // ── Assemble PDF binary ───────────────────────────────────────────────────
  const streamBody = b.ops.join("\n");
  const streamLen = Buffer.byteLength(streamBody, "utf8");

  const objects: string[] = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n",
    `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${b.pageW} ${b.pageH}] /Resources << /Font << /H 4 0 R /HB 5 0 R >> >> /Contents 6 0 R >> endobj\n`,
    "4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >> endobj\n",
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >> endobj\n",
    `6 0 obj << /Length ${streamLen} >>\nstream\n${streamBody}\nendstream\nendobj\n`,
  ];

  const header = "%PDF-1.4\n";
  const xrefOffsets: number[] = [];
  let offset = Buffer.byteLength(header, "utf8");
  const chunks: string[] = [header];

  for (const obj of objects) {
    xrefOffsets.push(offset);
    chunks.push(obj);
    offset += Buffer.byteLength(obj, "utf8");
  }

  const xrefStart = offset;
  const count = objects.length + 1;
  const xrefLines = [`xref\n0 ${count}\n`, "0000000000 65535 f \n"];
  for (const off of xrefOffsets) {
    xrefLines.push(`${off.toString().padStart(10, "0")} 00000 n \n`);
  }

  const trailer = `trailer << /Size ${count} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const raw = chunks.join("") + xrefLines.join("") + trailer;
  return Buffer.from(raw, "latin1");
}
