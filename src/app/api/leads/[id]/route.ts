import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { activity_events, leads } from "@/db/schema";
import { eq } from "drizzle-orm";

const STATUSES = ["cold", "warm", "proposal", "won", "lost"] as const;

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/leads/[id]">
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const leadId = parseInt(id, 10);
  if (Number.isNaN(leadId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await db.select().from(leads).where(eq(leads.id, leadId)).get();
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await req.json()) as {
    company?: string;
    sector?: string;
    contact_name?: string | null;
    contact_email?: string | null;
    source?: string | null;
    status?: (typeof STATUSES)[number];
    notes?: string | null;
  };

  const patch: Partial<typeof leads.$inferInsert> = {
    updated_at: new Date().toISOString(),
  };
  if (body.company !== undefined) patch.company = body.company.trim();
  if (body.sector !== undefined) patch.sector = body.sector.trim();
  if (body.contact_name !== undefined) patch.contact_name = body.contact_name?.trim() || null;
  if (body.contact_email !== undefined) patch.contact_email = body.contact_email?.trim() || null;
  if (body.source !== undefined) patch.source = body.source?.trim() || null;
  if (body.notes !== undefined) patch.notes = body.notes?.trim() || null;
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    patch.status = body.status;
  }

  const [updated] = await db.update(leads).set(patch).where(eq(leads.id, leadId)).returning();

  const statusChanged = body.status && body.status !== existing.status;
  await db.insert(activity_events).values({
    entity_type: "lead",
    entity_id: leadId,
    type: "lead_updated",
    description: statusChanged
      ? `${updated.company} moved to ${updated.status}`
      : `Lead updated: ${updated.company}`,
    actor_id: parseInt(session.user.id, 10),
  });

  return NextResponse.json({ success: true, lead: updated });
}
