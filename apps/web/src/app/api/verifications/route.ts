import { NextResponse } from "next/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

export async function GET() {
  return NextResponse.json(
    { message: "List verification requests endpoint placeholder" },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { message: "Update verification status endpoint placeholder" },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

