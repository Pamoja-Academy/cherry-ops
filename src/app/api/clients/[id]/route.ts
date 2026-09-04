import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { activity_events, clients } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/clients/[id]">
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const clientId = parseInt(id, 10);
  if (Number.isNaN(clientId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const existing = await db.select().from(clients).where(eq(clients.id, clientId)).get();
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = (await req.json()) as {
    name?: string;
    sector?: string;
    industry?: string | null;
    contact_name?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    is_private_sector?: boolean;
    notes?: string | null;
    status?: "active" | "inactive";
  };

  const patch: Partial<typeof clients.$inferInsert> = {};
  if (body.name !== undefined) patch.name = body.name.trim();
  if (body.sector !== undefined) patch.sector = body.sector.trim();
  if (body.industry !== undefined) patch.industry = body.industry?.trim() || null;
  if (body.contact_name !== undefined) patch.contact_name = body.contact_name?.trim() || null;
  if (body.contact_email !== undefined) patch.contact_email = body.contact_email?.trim() || null;
  if (body.contact_phone !== undefined) patch.contact_phone = body.contact_phone?.trim() || null;
  if (body.is_private_sector !== undefined) patch.is_private_sector = Boolean(body.is_private_sector);
  if (body.notes !== undefined) patch.notes = body.notes?.trim() || null;
  if (body.status !== undefined) patch.status = body.status;

  if (patch.name !== undefined && !patch.name) {
    return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
  }
  if (patch.sector !== undefined && !patch.sector) {
    return NextResponse.json({ error: "sector cannot be empty" }, { status: 400 });
  }

  const [updated] = await db
    .update(clients)
    .set(patch)
    .where(eq(clients.id, clientId))
    .returning();

  await db.insert(activity_events).values({
    entity_type: "client",
    entity_id: clientId,
    type: "client_updated",
    description: `Client updated: ${updated.name}`,
    actor_id: parseInt(session.user.id, 10),
  });

  return NextResponse.json({ success: true, client: updated });
}
