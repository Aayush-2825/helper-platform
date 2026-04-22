import { NextRequest, NextResponse } from "next/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { runDocExpiryCron } from "@/lib/kyc/doc-expiry";

export const runtime = "nodejs";

async function handle(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const expected = process.env.CRON_SECRET;

  if (expected && authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
  }

  try {
    const result = await runDocExpiryCron();
    return NextResponse.json({ ok: true, ...result }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Doc expiry cron failed:", error);
    return NextResponse.json({ message: "Doc expiry cron failed" }, { status: 500, headers: NO_STORE_HEADERS });
  }
}

// Vercel Cron Jobs hit the endpoint with a GET request.
export async function GET(request: NextRequest) {
  return handle(request);
}

// Allow manual / internal triggers via POST as well.
export async function POST(request: NextRequest) {
  return handle(request);
}
