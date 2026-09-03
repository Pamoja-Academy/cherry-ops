import { db } from "@/db";
import {
  invoices,
  jobs,
  media_buys,
  leads,
  autopilot_actions,
  activity_events,
} from "@/db/schema";
import { eq, and, lt, ne, sql } from "drizzle-orm";

export async function runAutopilotRules() {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];

  const results: string[] = [];

  // Rule 1: Overdue invoices → create pending "Send overdue reminder"
  const overdueInvoices = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.status, "sent"), lt(invoices.due_date!, today)));

  for (const inv of overdueInvoices) {
    // Update status
    await db.update(invoices).set({ status: "overdue" }).where(eq(invoices.id, inv.id));

    // Check if action already exists
    const existing = await db
      .select()
      .from(autopilot_actions)
      .where(
        and(
          eq(autopilot_actions.type, "send_invoice_reminder"),
          eq(autopilot_actions.entity_id, inv.id),
          eq(autopilot_actions.status, "pending")
        )
      )
      .get();

    if (!existing) {
      await db.insert(autopilot_actions).values({
        type: "send_invoice_reminder",
        classification: "risky",
        status: "pending",
        entity_type: "invoice",
        entity_id: inv.id,
        title: `Send overdue reminder for invoice ${inv.number}`,
        description: `Invoice ${inv.number} is overdue (R${inv.amount.toLocaleString()}). Propose sending a formal overdue reminder to the client.`,
      });

      await db.insert(activity_events).values({
        entity_type: "invoice",
        entity_id: inv.id,
        type: "overdue_flag",
        description: `🤖 Autopilot: Invoice ${inv.number} flagged as overdue — reminder pending approval`,
      });

      results.push(`Flagged overdue invoice: ${inv.number}`);
    }
  }

  // Rule 2: Jobs past due date and not complete → SLA flag
  const overdueJobs = await db
    .select()
    .from(jobs)
    .where(and(ne(jobs.stage, "complete"), lt(jobs.due_date!, today)));

  for (const job of overdueJobs) {
    const existing = await db
      .select()
      .from(activity_events)
      .where(
        and(
          eq(activity_events.type, "sla_flag"),
          eq(activity_events.entity_type, "job"),
          eq(activity_events.entity_id, job.id),
          sql`substr(${activity_events.created_at}, 1, 10) = ${today}`
        )
      )
      .get();

    if (!existing) {
      await db.insert(activity_events).values({
        entity_type: "job",
        entity_id: job.id,
        type: "sla_flag",
        description: `🤖 Autopilot: SLA overdue flag — ${job.title} is past due date`,
      });

      await db.insert(autopilot_actions).values({
        type: "sla_flag",
        classification: "safe",
        status: "auto_ran",
        entity_type: "job",
        entity_id: job.id,
        title: `SLA Flag: ${job.title}`,
        description: `Job is past its due date. SLA flag logged to activity feed.`,
        resolved_at: today,
      });

      results.push(`SLA flag: ${job.title}`);
    }
  }

  // Rule 3: Media buys pacing under/over → alert
  const badPacing = await db
    .select()
    .from(media_buys)
    .where(and(eq(media_buys.status, "live"), ne(media_buys.pacing_status, "ok")));

  for (const buy of badPacing) {
    const existing = await db
      .select()
      .from(activity_events)
      .where(
        and(
          eq(activity_events.type, "pacing_alert"),
          eq(activity_events.entity_type, "media_buy"),
          eq(activity_events.entity_id, buy.id),
          sql`substr(${activity_events.created_at}, 1, 10) = ${today}`
        )
      )
      .get();

    if (!existing) {
      await db.insert(activity_events).values({
        entity_type: "media_buy",
        entity_id: buy.id,
        type: "pacing_alert",
        description: `🤖 Autopilot: Media buy "${buy.title}" is pacing ${buy.pacing_status.toUpperCase()}`,
      });

      await db.insert(autopilot_actions).values({
        type: "pacing_alert",
        classification: "safe",
        status: "auto_ran",
        entity_type: "media_buy",
        entity_id: buy.id,
        title: `Pacing Alert: ${buy.title} — ${buy.pacing_status.toUpperCase()}`,
        description: `Media buy is pacing ${buy.pacing_status}. Alert logged to activity feed.`,
        resolved_at: today,
      });

      results.push(`Pacing alert: ${buy.title} (${buy.pacing_status})`);
    }
  }

  // Rule 4: Warm leads not updated in 7 days → nudge
  const staleLeads = await db
    .select()
    .from(leads)
    .where(and(eq(leads.status, "warm"), lt(leads.updated_at, sevenDaysAgo)));

  for (const lead of staleLeads) {
    const existing = await db
      .select()
      .from(activity_events)
      .where(
        and(
          eq(activity_events.type, "lead_nudge"),
          eq(activity_events.entity_type, "lead"),
          eq(activity_events.entity_id, lead.id),
          sql`substr(${activity_events.created_at}, 1, 10) = ${today}`
        )
      )
      .get();

    if (!existing) {
      await db.insert(activity_events).values({
        entity_type: "lead",
        entity_id: lead.id,
        type: "lead_nudge",
        description: `🤖 Autopilot: ${lead.company} lead hasn't been updated in 7+ days — follow up recommended`,
      });

      await db.insert(autopilot_actions).values({
        type: "lead_nudge",
        classification: "safe",
        status: "auto_ran",
        entity_type: "lead",
        entity_id: lead.id,
        title: `Lead Nudge: ${lead.company}`,
        description: `Warm lead hasn't been updated in 7+ days. Nudge logged.`,
        resolved_at: today,
      });

      results.push(`Lead nudge: ${lead.company}`);
    }
  }

  return { ran: results.length, details: results };
}
