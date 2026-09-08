import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { activity_events, activations } from "@/db/schema";
import { eq } from "drizzle-orm";

const STAGES = ["brief", "production", "review", "delivery", "complete"] as const;

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const activationId = parseInt(id, 10);
  if (Number.isNaN(activationId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await db.select().from(activations).where(eq(activations.id, activationId)).get();
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await req.json()) as {
    stage?: (typeof STAGES)[number];
    brief?: string | null;
    status?: string;
  };

  const patch: Partial<typeof activations.$inferInsert> = {};
  if (body.stage !== undefined) {
    if (!STAGES.includes(body.stage)) {
      return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    }
    patch.stage = body.stage;
  }
  if (body.brief !== undefined) patch.brief = body.brief?.trim() || null;
  if (body.status !== undefined) patch.status = body.status.trim();

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const [updated] = await db
    .update(activations)
    .set(patch)
    .where(eq(activations.id, activationId))
    .returning();

  if (body.stage && body.stage !== existing.stage) {
    await db.insert(activity_events).values({
      entity_type: "activation",
      entity_id: activationId,
      type: "stage_change",
      description: `${updated.title} moved to ${updated.stage} stage`,
      actor_id: parseInt(session.user.id, 10),
    });
  }

  return NextResponse.json({ success: true, activation: updated });
}
