import { db } from "@/db";
import { opportunity_reminders, opportunities } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { activity_events } from "@/db/schema";

const DEADLINE_OFFSETS_HOURS = [72, 48, 24] as const;

function addHours(isoDate: string, hours: number): string {
  const d = new Date(isoDate);
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

export async function cancelRemindersForOpportunity(opportunityId: number) {
  await db
    .update(opportunity_reminders)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(opportunity_reminders.opportunity_id, opportunityId),
        eq(opportunity_reminders.status, "pending")
      )
    );
}

export async function scheduleRemindersForOpportunity(opportunityId: number) {
  const opp = await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.id, opportunityId))
    .get();

  if (!opp?.closing_at) return [];

  await cancelRemindersForOpportunity(opportunityId);

  const rows = DEADLINE_OFFSETS_HOURS.map((offset) => ({
    opportunity_id: opportunityId,
    kind: "deadline" as const,
    offset_hours: offset,
    due_at: addHours(opp.closing_at!, offset),
    status: "pending" as const,
    payload: JSON.stringify({
      title: opp.title,
      reference: opp.reference,
      closing_at: opp.closing_at,
      offset_hours: offset,
    }),
  }));

  return db.insert(opportunity_reminders).values(rows).returning();
}

export async function dispatchDueReminders(cronSecret?: string | null) {
  if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
    throw new Error("Unauthorized");
  }

  const now = new Date().toISOString();
  const due = await db
    .select({
      reminder: opportunity_reminders,
      opportunity: opportunities,
    })
    .from(opportunity_reminders)
    .innerJoin(opportunities, eq(opportunity_reminders.opportunity_id, opportunities.id))
    .where(
      and(
        eq(opportunity_reminders.status, "pending"),
        lte(opportunity_reminders.due_at, now),
        eq(opportunities.triage_status, "approved")
      )
    );

  const sent: number[] = [];

  for (const { reminder, opportunity } of due) {
    await db
      .update(opportunity_reminders)
      .set({ status: "sent", sent_at: now })
      .where(eq(opportunity_reminders.id, reminder.id));

    await db.insert(activity_events).values({
      entity_type: "opportunity",
      entity_id: opportunity.id,
      type: "reminder_sent",
      description: `⏰ ${reminder.offset_hours}h reminder: ${opportunity.title} closes ${opportunity.closing_at}`,
      actor_id: null,
    });

    sent.push(reminder.id);
  }

  return { dispatched: sent.length, reminderIds: sent };
}
