import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { activity_events, opportunities } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  cancelRemindersForOpportunity,
  scheduleRemindersForOpportunity,
} from "@/lib/opportunity/reminders";

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<"/api/opportunities/[id]">
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;
  const opportunityId = parseInt(id, 10);
  if (Number.isNaN(opportunityId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await req.json()) as {
    triage_status?: "approved" | "discarded";
    triage_note?: string;
  };

  if (!body.triage_status || !["approved", "discarded"].includes(body.triage_status)) {
    return NextResponse.json({ error: "triage_status must be approved or discarded" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const userId = parseInt(session.user.id, 10);

  const [updated] = await db
    .update(opportunities)
    .set({
      triage_status: body.triage_status,
      triage_note: body.triage_note ?? null,
      triaged_at: now,
      triaged_by: userId,
      updated_at: now,
    })
    .where(eq(opportunities.id, opportunityId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body.triage_status === "approved") {
    await scheduleRemindersForOpportunity(opportunityId);
    await db.insert(activity_events).values({
      entity_type: "opportunity",
      entity_id: opportunityId,
      type: "triage_approved",
      description: `✅ Pitched: ${updated.title}`,
      actor_id: userId,
    });
  } else {
    await cancelRemindersForOpportunity(opportunityId);
    await db.insert(activity_events).values({
      entity_type: "opportunity",
      entity_id: opportunityId,
      type: "triage_discarded",
      description: `⏭ Passed: ${updated.title}${body.triage_note ? ` — ${body.triage_note}` : ""}`,
      actor_id: userId,
    });
  }

  return NextResponse.json({ success: true, opportunity: updated });
}
