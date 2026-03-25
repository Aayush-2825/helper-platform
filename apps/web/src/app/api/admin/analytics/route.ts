import { NextResponse } from "next/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

export async function GET() {
  return NextResponse.json(
    { message: "Admin analytics endpoint placeholder" },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

