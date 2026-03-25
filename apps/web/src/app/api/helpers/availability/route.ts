import { NextResponse } from "next/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

export async function PATCH() {
  return NextResponse.json(
    { message: "Update helper availability endpoint placeholder" },
    { status: 200, headers: NO_STORE_HEADERS }
  );
}

