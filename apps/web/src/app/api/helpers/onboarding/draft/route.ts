import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { helperOnboardingDraft } from "@/db/schema";
import { auth } from "@/lib/auth/server";
import { NO_STORE_HEADERS } from "@/lib/http/cache";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const draft = await db.query.helperOnboardingDraft.findFirst({
    where: eq(helperOnboardingDraft.userId, session.user.id),
    columns: {
      stepIndex: true,
      payload: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(
    {
      draft: draft
        ? {
            step_index: draft.stepIndex,
            payload: draft.payload ?? {},
            updated_at: draft.updatedAt,
          }
        : null,
    },
    { status: 200, headers: NO_STORE_HEADERS },
  );
}

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
  }

  const body = (await request.json().catch(() => null)) as
    | { step_index?: number; payload?: Record<string, unknown> }
    | null;

  if (!body || typeof body.step_index !== "number" || body.step_index < 0) {
    return NextResponse.json(
      { message: "Invalid draft payload." },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const payload = body.payload && typeof body.payload === "object" ? body.payload : {};

  const existing = await db.query.helperOnboardingDraft.findFirst({
    where: eq(helperOnboardingDraft.userId, session.user.id),
    columns: { id: true },
  });

  if (existing) {
    await db
      .update(helperOnboardingDraft)
      .set({
        stepIndex: body.step_index,
        payload,
        updatedAt: new Date(),
      })
      .where(and(eq(helperOnboardingDraft.id, existing.id), eq(helperOnboardingDraft.userId, session.user.id)));
  } else {
    await db.insert(helperOnboardingDraft).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      stepIndex: body.step_index,
      payload,
      updatedAt: new Date(),
    });
  }

  return NextResponse.json({ ok: true }, { status: 200, headers: NO_STORE_HEADERS });
}

export async function DELETE() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: NO_STORE_HEADERS });
  }

  await db.delete(helperOnboardingDraft).where(eq(helperOnboardingDraft.userId, session.user.id));
  return NextResponse.json({ ok: true }, { status: 200, headers: NO_STORE_HEADERS });
}
