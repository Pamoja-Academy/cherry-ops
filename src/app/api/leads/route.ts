import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { activity_events, leads } from "@/db/schema";

const STATUSES = ["cold", "warm", "proposal", "won", "lost"] as const;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    company?: string;
    sector?: string;
    contact_name?: string;
    contact_email?: string;
    source?: string;
    status?: (typeof STATUSES)[number];
    notes?: string;
  };

  const company = body.company?.trim();
  const sector = body.sector?.trim();
  if (!company || !sector) {
    return NextResponse.json({ error: "company and sector are required" }, { status: 400 });
  }

  const status = body.status && STATUSES.includes(body.status) ? body.status : "cold";
  const actorId = parseInt(session.user.id, 10);
  const now = new Date().toISOString();

  const [created] = await db
    .insert(leads)
    .values({
      company,
      sector,
      contact_name: body.contact_name?.trim() || null,
      contact_email: body.contact_email?.trim() || null,
      source: body.source?.trim() || null,
      status,
      notes: body.notes?.trim() || null,
      assigned_to_id: Number.isFinite(actorId) ? actorId : null,
      created_at: now,
      updated_at: now,
    })
    .returning();

  await db.insert(activity_events).values({
    entity_type: "lead",
    entity_id: created.id,
    type: "lead_created",
    description: `New lead: ${created.company}`,
    actor_id: actorId,
  });

  return NextResponse.json({ success: true, lead: created }, { status: 201 });
}
