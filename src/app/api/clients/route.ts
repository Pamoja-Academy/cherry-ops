import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { activity_events, clients } from "@/db/schema";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    name?: string;
    sector?: string;
    industry?: string;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    is_private_sector?: boolean;
    notes?: string;
    status?: "active" | "inactive";
  };

  const name = body.name?.trim();
  const sector = body.sector?.trim();
  if (!name || !sector) {
    return NextResponse.json({ error: "name and sector are required" }, { status: 400 });
  }

  const actorId = parseInt(session.user.id, 10);
  const [created] = await db
    .insert(clients)
    .values({
      name,
      sector,
      industry: body.industry?.trim() || null,
      contact_name: body.contact_name?.trim() || null,
      contact_email: body.contact_email?.trim() || null,
      contact_phone: body.contact_phone?.trim() || null,
      is_private_sector: Boolean(body.is_private_sector),
      notes: body.notes?.trim() || null,
      status: body.status === "inactive" ? "inactive" : "active",
      account_manager_id: Number.isFinite(actorId) ? actorId : null,
    })
    .returning();

  await db.insert(activity_events).values({
    entity_type: "client",
    entity_id: created.id,
    type: "client_created",
    description: `New client added: ${created.name}`,
    actor_id: actorId,
  });

  return NextResponse.json({ success: true, client: created }, { status: 201 });
}
