import { db } from "@/db";
import {
  clients,
  activations,
  schedule_items,
  invoices,
  leads,
  activity_events,
  autopilot_actions,
  media_buys,
  studio_resources,
  studio_allocs,
  event_tasks,
  users,
  deliverables,
  client_contacts,
  opportunities,
  opportunity_reminders,
  workspace_settings,
} from "@/db/schema";
import { eq, and, desc, sql, count, sum, ne } from "drizzle-orm";

// ── Clients ──────────────────────────────────────────────────────────────────

export async function getClients() {
  const allClients = await db.select().from(clients).orderBy(clients.name);

  const activationCounts = await db
    .select({ client_id: activations.client_id, cnt: count() })
    .from(activations)
    .where(ne(activations.stage, "complete"))
    .groupBy(activations.client_id);

  const invoiceAmounts = await db
    .select({ client_id: invoices.client_id, total: sum(invoices.amount) })
    .from(invoices)
    .where(sql`${invoices.status} IN ('sent','overdue')`)
    .groupBy(invoices.client_id);

  const managers = await db.select().from(users);

  return allClients.map((c) => ({
    ...c,
    active_activations: activationCounts.find((j) => j.client_id === c.id)?.cnt ?? 0,
    /** @deprecated use active_activations */
    active_jobs: activationCounts.find((j) => j.client_id === c.id)?.cnt ?? 0,
    outstanding: Number(invoiceAmounts.find((i) => i.client_id === c.id)?.total ?? 0),
    account_manager: managers.find((u) => u.id === c.account_manager_id),
  }));
}

export async function getClientById(id: number) {
  const client = await db.select().from(clients).where(eq(clients.id, id)).get();
  if (!client) return null;

  const clientActivations = await db
    .select()
    .from(activations)
    .where(eq(activations.client_id, id))
    .orderBy(desc(activations.created_at));

  const clientInvoices = await db
    .select()
    .from(invoices)
    .where(eq(invoices.client_id, id))
    .orderBy(desc(invoices.issued_date));

  const contacts = await db
    .select()
    .from(client_contacts)
    .where(eq(client_contacts.client_id, id));

  const manager = client.account_manager_id
    ? await db.select().from(users).where(eq(users.id, client.account_manager_id)).get()
    : null;

  const totalBilled = clientInvoices.reduce((s, i) => s + (i.amount ?? 0), 0);
  const outstanding = clientInvoices
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + (i.amount ?? 0), 0);

  return {
    ...client,
    activations: clientActivations,
    jobs: clientActivations,
    invoices: clientInvoices,
    contacts,
    manager,
    totalBilled,
    outstanding,
  };
}

// ── Activations ───────────────────────────────────────────────────────────────

export async function getActivations() {
  const all = await db.select().from(activations).orderBy(desc(activations.created_at));
  const allClients = await db.select().from(clients);
  const allUsers = await db.select().from(users);

  return all.map((j) => ({
    ...j,
    client: allClients.find((c) => c.id === j.client_id),
    owner: allUsers.find((u) => u.id === j.owner_id),
  }));
}

/** @deprecated use getActivations */
export const getJobs = getActivations;

export async function getActivationById(id: number) {
  const activation = await db.select().from(activations).where(eq(activations.id, id)).get();
  if (!activation) return null;

  const client = await db.select().from(clients).where(eq(clients.id, activation.client_id)).get();
  const tasks = await db.select().from(event_tasks).where(eq(event_tasks.activation_id, id));
  const actDeliverables = await db
    .select()
    .from(deliverables)
    .where(eq(deliverables.activation_id, id));
  const allocs = await db.select().from(studio_allocs).where(eq(studio_allocs.activation_id, id));
  const buys = await db.select().from(media_buys).where(eq(media_buys.activation_id, id));
  const actInvoices = await db.select().from(invoices).where(eq(invoices.activation_id, id));
  const allUsers = await db.select().from(users);
  const resources = await db.select().from(studio_resources);

  return {
    ...activation,
    client,
    tasks: tasks.map((t) => ({ ...t, assignee: allUsers.find((u) => u.id === t.assignee_id) })),
    deliverables: actDeliverables,
    allocs: allocs.map((a) => ({ ...a, resource: resources.find((r) => r.id === a.resource_id) })),
    media_buys: buys,
    invoices: actInvoices,
    owner: allUsers.find((u) => u.id === activation.owner_id),
  };
}

/** @deprecated use getActivationById */
export const getJobById = getActivationById;

// ── Scheduling ────────────────────────────────────────────────────────────────

export async function getScheduleItems() {
  const items = await db.select().from(schedule_items).orderBy(desc(schedule_items.start_at));
  const allUsers = await db.select().from(users);
  const allActivations = await db.select().from(activations);

  return items.map((item) => ({
    ...item,
    owner: allUsers.find((u) => u.id === item.owner_id),
    related_activation: item.related_activation_id
      ? allActivations.find((a) => a.id === item.related_activation_id)
      : null,
  }));
}

export async function getScheduleItemById(id: number) {
  const item = await db.select().from(schedule_items).where(eq(schedule_items.id, id)).get();
  if (!item) return null;

  const allUsers = await db.select().from(users);
  const tasks = await db.select().from(event_tasks).where(eq(event_tasks.schedule_item_id, id));
  const related = item.related_activation_id
    ? await db.select().from(activations).where(eq(activations.id, item.related_activation_id)).get()
    : null;

  return {
    ...item,
    owner: allUsers.find((u) => u.id === item.owner_id),
    related_activation: related,
    tasks: tasks.map((t) => ({ ...t, assignee: allUsers.find((u) => u.id === t.assignee_id) })),
  };
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardMetrics() {
  const revenueResult = await db
    .select({ total: sum(invoices.amount) })
    .from(invoices)
    .where(eq(invoices.status, "paid"))
    .get();

  const activeActivations = await db
    .select({ cnt: count() })
    .from(activations)
    .where(ne(activations.stage, "complete"))
    .get();

  const overdueInvoices = await db
    .select({ cnt: count(), total: sum(invoices.amount) })
    .from(invoices)
    .where(eq(invoices.status, "overdue"))
    .get();

  const totalBuys = await db
    .select({ cnt: count() })
    .from(media_buys)
    .where(eq(media_buys.status, "live"))
    .get();
  const okBuys = await db
    .select({ cnt: count() })
    .from(media_buys)
    .where(and(eq(media_buys.status, "live"), eq(media_buys.pacing_status, "ok")))
    .get();

  const pendingActions = await db
    .select({ cnt: count() })
    .from(autopilot_actions)
    .where(eq(autopilot_actions.status, "pending"))
    .get();

  const privateLeads = await db
    .select({ cnt: count() })
    .from(leads)
    .where(sql`${leads.status} IN ('cold','warm','proposal')`)
    .get();

  const activeCount = activeActivations?.cnt ?? 0;

  return {
    revenue: Number(revenueResult?.total ?? 0),
    activeActivations: activeCount,
    activeJobs: activeCount,
    overdueCount: overdueInvoices?.cnt ?? 0,
    overdueTotal: Number(overdueInvoices?.total ?? 0),
    mediaPacingPct: totalBuys?.cnt ? Math.round(((okBuys?.cnt ?? 0) / totalBuys.cnt) * 100) : 100,
    pendingApprovals: pendingActions?.cnt ?? 0,
    privateLeadsInPipeline: privateLeads?.cnt ?? 0,
  };
}

export async function getActivityFeed(limit = 10) {
  const events = await db
    .select()
    .from(activity_events)
    .orderBy(desc(activity_events.created_at))
    .limit(limit);

  const allUsers = await db.select().from(users);
  return events.map((e) => ({
    ...e,
    actor: allUsers.find((u) => u.id === e.actor_id),
  }));
}

export async function getLeadFunnel() {
  const stages = ["cold", "warm", "proposal", "won", "lost"] as const;
  const results = await Promise.all(
    stages.map(async (s) => {
      const r = await db.select({ cnt: count() }).from(leads).where(eq(leads.status, s)).get();
      return { stage: s, count: r?.cnt ?? 0 };
    })
  );
  return results;
}

// ── Studio ────────────────────────────────────────────────────────────────────

export async function getStudioCapacity() {
  const today = new Date().toISOString().split("T")[0];
  const resources = await db.select().from(studio_resources);
  const allocs = await db.select().from(studio_allocs).where(eq(studio_allocs.date, today));

  const allActivations = await db.select().from(activations);

  return resources.map((r) => {
    const todayAllocs = allocs.filter((a) => a.resource_id === r.id);
    const totalHours = todayAllocs.reduce((s, a) => s + a.hours, 0);
    const activationsUsing = todayAllocs
      .map((a) => allActivations.find((j) => j.id === a.activation_id))
      .filter(Boolean);
    return { ...r, allocated: totalHours, activationsUsing, jobsUsing: activationsUsing };
  });
}

// ── Media ─────────────────────────────────────────────────────────────────────

export async function getMediaBuys() {
  const buys = await db.select().from(media_buys).orderBy(desc(media_buys.id));
  const allActivations = await db.select().from(activations);
  return buys.map((b) => {
    const activation = allActivations.find((j) => j.id === b.activation_id);
    return { ...b, activation, job: activation };
  });
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export async function getInvoices() {
  const allInvoices = await db.select().from(invoices).orderBy(desc(invoices.issued_date));
  const allClients = await db.select().from(clients);
  const allActivations = await db.select().from(activations);
  const today = new Date().toISOString().split("T")[0];

  return allInvoices.map((inv) => {
    const daysOverdue =
      inv.status === "overdue" && inv.due_date
        ? Math.floor((new Date(today).getTime() - new Date(inv.due_date).getTime()) / 86400000)
        : 0;
    const activation = allActivations.find((j) => j.id === inv.activation_id);
    return {
      ...inv,
      client: allClients.find((c) => c.id === inv.client_id),
      activation,
      job: activation,
      daysOverdue,
    };
  });
}

// ── Leads ─────────────────────────────────────────────────────────────────────

export async function getLeads() {
  const allLeads = await db.select().from(leads).orderBy(desc(leads.created_at));
  const allUsers = await db.select().from(users);
  return allLeads.map((l) => ({
    ...l,
    assigned_to: allUsers.find((u) => u.id === l.assigned_to_id),
  }));
}

// ── Autopilot ─────────────────────────────────────────────────────────────────

export async function getAutopilotActions() {
  const pending = await db
    .select()
    .from(autopilot_actions)
    .where(eq(autopilot_actions.status, "pending"))
    .orderBy(desc(autopilot_actions.proposed_at));

  const history = await db
    .select()
    .from(autopilot_actions)
    .where(ne(autopilot_actions.status, "pending"))
    .orderBy(desc(autopilot_actions.proposed_at));

  return { pending, history };
}

export async function getPendingAutopilotCount() {
  const result = await db
    .select({ cnt: count() })
    .from(autopilot_actions)
    .where(eq(autopilot_actions.status, "pending"))
    .get();
  return result?.cnt ?? 0;
}

// ── Production ────────────────────────────────────────────────────────────────

export async function getProductionTasks() {
  const tasks = await db.select().from(event_tasks).orderBy(event_tasks.due_date);
  const allActivations = await db.select().from(activations);
  const allSchedule = await db.select().from(schedule_items);
  const allUsers = await db.select().from(users);
  const resources = await db.select().from(studio_resources);

  return tasks.map((t) => {
    const activation = t.activation_id
      ? allActivations.find((j) => j.id === t.activation_id)
      : null;
    const scheduleItem = t.schedule_item_id
      ? allSchedule.find((s) => s.id === t.schedule_item_id)
      : null;
    return {
      ...t,
      activation,
      schedule_item: scheduleItem,
      job: activation,
      assignee: allUsers.find((u) => u.id === t.assignee_id),
      resource: resources.find((r) => r.id === t.studio_resource_id),
    };
  });
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getTeamMembers() {
  return db.select().from(users).orderBy(users.role);
}

const DEFAULT_WORKSPACE = {
  id: 0,
  agency_name: "Red Cherry Interactive",
  headquarters: "Rivonia, Sandton, Johannesburg",
  founded: "1996 · 30 Years",
  certification: "Level 1 BBBEE · Female-Owned",
  services: "Strategy · Creative · Media · Production · PR · Digital · Activations",
  updated_at: new Date().toISOString(),
};

export async function getWorkspaceSettings() {
  const row = await db.select().from(workspace_settings).limit(1).get();
  if (row) return row;
  const [created] = await db
    .insert(workspace_settings)
    .values({
      agency_name: DEFAULT_WORKSPACE.agency_name,
      headquarters: DEFAULT_WORKSPACE.headquarters,
      founded: DEFAULT_WORKSPACE.founded,
      certification: DEFAULT_WORKSPACE.certification,
      services: DEFAULT_WORKSPACE.services,
    })
    .returning();
  return created ?? DEFAULT_WORKSPACE;
}

// ── Opportunity Ops ───────────────────────────────────────────────────────────

export async function getOpportunities(showAll = false) {
  const { applyTriageOverrides, readTriageMap } = await import("@/lib/opportunity/triage-session");
  const rows = applyTriageOverrides(
    await db.select().from(opportunities).orderBy(desc(opportunities.closing_at)),
    await readTriageMap()
  );
  if (showAll) return rows;
  // Inbox: pending + score≥40; pitched/passed leave the default inbox
  return rows.filter((o) => o.triage_status === "pending" && (o.fit_score ?? 0) >= 40);
}

export async function getOpportunityById(id: number) {
  const { applyTriageOverrides, readTriageMap } = await import("@/lib/opportunity/triage-session");
  const opp = await db.select().from(opportunities).where(eq(opportunities.id, id)).get();
  if (!opp) return null;

  const [merged] = applyTriageOverrides([opp], await readTriageMap());

  const reminders = await db
    .select()
    .from(opportunity_reminders)
    .where(eq(opportunity_reminders.opportunity_id, id))
    .orderBy(opportunity_reminders.offset_hours);

  const triagedBy = merged.triaged_by
    ? await db.select().from(users).where(eq(users.id, merged.triaged_by)).get()
    : null;

  return { ...merged, reminders, triagedBy };
}

export async function getPitches() {
  const { applyTriageOverrides, readTriageMap } = await import("@/lib/opportunity/triage-session");
  const map = await readTriageMap();
  const rows = applyTriageOverrides(
    await db.select().from(opportunities).orderBy(opportunities.closing_at),
    map
  );
  const approved = rows.filter((o) => o.triage_status === "approved");

  const allReminders = await db.select().from(opportunity_reminders);

  return approved.map((o) => ({
    ...o,
    reminders: allReminders.filter((r) => r.opportunity_id === o.id),
  }));
}

export async function getOpportunityStats(showAll = false) {
  const rows = await getOpportunities(showAll);
  const pending = rows.filter((o) => o.triage_status === "pending");
  return {
    pipeline: rows.length,
    new: pending.length,
    pitch: rows.filter((o) => (o.fit_score ?? 0) >= 70).length,
    review: rows.filter((o) => {
      const s = o.fit_score ?? 0;
      return s >= 40 && s < 70;
    }).length,
    approved: rows.filter((o) => o.triage_status === "approved").length,
  };
}
