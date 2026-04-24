import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";
import { cancelVideoKycByHelper } from "@/lib/kyc/video-kyc";

const schema = z.object({
  session_id: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
    }

    if (session.user.role !== "helper") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: NO_STORE_HEADERS });
    }

    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Invalid request.", errors: parsed.error.flatten() },
        { status: 400, headers: NO_STORE_HEADERS },
      );
    }

    await cancelVideoKycByHelper({
      helperUserId: session.user.id,
      sessionId: parsed.data.session_id,
    });

    return NextResponse.json({ ok: true }, { status: 200, headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error("Video KYC cancel (helper) error:", error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500, headers: NO_STORE_HEADERS },
    );
  }
}

