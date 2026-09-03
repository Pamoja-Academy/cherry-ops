import { db } from "@/db";
import {
  clients,
  jobs,
  invoices,
  leads,
  activity_events,
  autopilot_actions,
  media_buys,
  studio_resources,
  studio_allocs,
  job_tasks,
  users,
  deliverables,
  client_contacts,
} from "@/db/schema";
import { eq, and, desc, sql, count, sum, lt, ne } from "drizzle-orm";

// ── Clients ──────────────────────────────────────────────────────────────────

export async function getClients() {
  const allClients = await db.select().from(clients).orderBy(clients.name);

  const jobCounts = await db
    .select({ client_id: jobs.client_id, cnt: count() })
    .from(jobs)
    .where(ne(jobs.stage, "complete"))
    .groupBy(jobs.client_id);

  const invoiceAmounts = await db
    .select({ client_id: invoices.client_id, total: sum(invoices.amount) })
    .from(invoices)
    .where(sql`${invoices.status} IN ('sent','overdue')`)
    .groupBy(invoices.client_id);

  const managers = await db.select().from(users);

  return allClients.map((c) => ({
    ...c,
    active_jobs: jobCounts.find((j) => j.client_id === c.id)?.cnt ?? 0,
    outstanding: Number(invoiceAmounts.find((i) => i.client_id === c.id)?.total ?? 0),
    account_manager: managers.find((u) => u.id === c.account_manager_id),
  }));
}

export async function getClientById(id: number) {
  const client = await db.select().from(clients).where(eq(clients.id, id)).get();
  if (!client) return null;

  const clientJobs = await db
    .select()
    .from(jobs)
    .where(eq(jobs.client_id, id))
    .orderBy(desc(jobs.created_at));

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

  return { ...client, jobs: clientJobs, invoices: clientInvoices, contacts, manager, totalBilled, outstanding };
}

// ── Jobs ──────────────────────────────────────────────────────────────────────

export async function getJobs() {
  const allJobs = await db.select().from(jobs).orderBy(desc(jobs.created_at));
  const allClients = await db.select().from(clients);
  const allUsers = await db.select().from(users);

  return allJobs.map((j) => ({
    ...j,
    client: allClients.find((c) => c.id === j.client_id),
    owner: allUsers.find((u) => u.id === j.owner_id),
  }));
}

export async function getJobById(id: number) {
  const job = await db.select().from(jobs).where(eq(jobs.id, id)).get();
  if (!job) return null;

  const client = await db.select().from(clients).where(eq(clients.id, job.client_id)).get();
  const tasks = await db.select().from(job_tasks).where(eq(job_tasks.job_id, id));
  const jobDeliverables = await db.select().from(deliverables).where(eq(deliverables.job_id, id));
  const allocs = await db.select().from(studio_allocs).where(eq(studio_allocs.job_id, id));
  const buys = await db.select().from(media_buys).where(eq(media_buys.job_id, id));
  const jobInvoices = await db.select().from(invoices).where(eq(invoices.job_id, id));
  const allUsers = await db.select().from(users);
  const resources = await db.select().from(studio_resources);

  return {
    ...job,
    client,
    tasks: tasks.map((t) => ({ ...t, assignee: allUsers.find((u) => u.id === t.assignee_id) })),
    deliverables: jobDeliverables,
    allocs: allocs.map((a) => ({ ...a, resource: resources.find((r) => r.id === a.resource_id) })),
    media_buys: buys,
    invoices: jobInvoices,
    owner: allUsers.find((u) => u.id === job.owner_id),
  };
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardMetrics() {
  const now = new Date().toISOString().split("T")[0];

  const revenueResult = await db
    .select({ total: sum(invoices.amount) })
    .from(invoices)
    .where(and(eq(invoices.status, "paid"), sql`substr(${invoices.paid_date}, 1, 7) = substr(${now}, 1, 7)`))
    .get();

  const activeJobs = await db
    .select({ cnt: count() })
    .from(jobs)
    .where(ne(jobs.stage, "complete"))
    .get();

  const overdueInvoices = await db
    .select({ cnt: count(), total: sum(invoices.amount) })
    .from(invoices)
    .where(eq(invoices.status, "overdue"))
    .get();

  const totalBuys = await db.select({ cnt: count() }).from(media_buys).where(eq(media_buys.status, "live")).get();
  const okBuys = await db.select({ cnt: count() }).from(media_buys).where(and(eq(media_buys.status, "live"), eq(media_buys.pacing_status, "ok"))).get();

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

  return {
    revenue: Number(revenueResult?.total ?? 0),
    activeJobs: activeJobs?.cnt ?? 0,
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
  const allocs = await db
    .select()
    .from(studio_allocs)
    .where(eq(studio_allocs.date, today));

  const allJobs = await db.select().from(jobs);

  return resources.map((r) => {
    const todayAllocs = allocs.filter((a) => a.resource_id === r.id);
    const totalHours = todayAllocs.reduce((s, a) => s + a.hours, 0);
    const jobsUsing = todayAllocs.map((a) => allJobs.find((j) => j.id === a.job_id)).filter(Boolean);
    return { ...r, allocated: totalHours, jobsUsing };
  });
}

// ── Media ─────────────────────────────────────────────────────────────────────

export async function getMediaBuys() {
  const buys = await db.select().from(media_buys).orderBy(desc(media_buys.id));
  const allJobs = await db.select().from(jobs);
  return buys.map((b) => ({ ...b, job: allJobs.find((j) => j.id === b.job_id) }));
}

// ── Invoices ──────────────────────────────────────────────────────────────────

export async function getInvoices() {
  const allInvoices = await db.select().from(invoices).orderBy(desc(invoices.issued_date));
  const allClients = await db.select().from(clients);
  const allJobs = await db.select().from(jobs);
  const today = new Date().toISOString().split("T")[0];

  return allInvoices.map((inv) => {
    const daysOverdue =
      inv.status === "overdue" && inv.due_date
        ? Math.floor((new Date(today).getTime() - new Date(inv.due_date).getTime()) / 86400000)
        : 0;
    return {
      ...inv,
      client: allClients.find((c) => c.id === inv.client_id),
      job: allJobs.find((j) => j.id === inv.job_id),
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
  const tasks = await db.select().from(job_tasks).orderBy(job_tasks.due_date);
  const allJobs = await db.select().from(jobs);
  const allUsers = await db.select().from(users);
  const resources = await db.select().from(studio_resources);

  return tasks.map((t) => ({
    ...t,
    job: allJobs.find((j) => j.id === t.job_id),
    assignee: allUsers.find((u) => u.id === t.assignee_id),
    resource: resources.find((r) => r.id === t.studio_resource_id),
  }));
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getTeamMembers() {
  return db.select().from(users).orderBy(users.role);
}
