import { NextResponse } from "next/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

export async function GET() {
  return NextResponse.json(
    { message: "List disputes endpoint placeholder" },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

export async function POST() {
  return NextResponse.json(
    { message: "Create dispute endpoint placeholder" },
    { status: 201, headers: NO_STORE_HEADERS }
  );
}

export async function PATCH() {
  return NextResponse.json(
    { message: "Resolve dispute endpoint placeholder" },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

