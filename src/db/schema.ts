import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  password: text("password").notNull(),
  role: text("role", {
    enum: ["CEO", "CREATIVE_DIRECTOR", "DIRECTOR", "PRODUCTION", "MEDIA", "FINANCE"],
  }).notNull(),
  avatar_initials: text("avatar_initials").notNull(),
});

export const clients = sqliteTable("clients", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  sector: text("sector").notNull(),
  industry: text("industry"),
  contact_name: text("contact_name"),
  contact_email: text("contact_email"),
  contact_phone: text("contact_phone"),
  is_private_sector: integer("is_private_sector", { mode: "boolean" }).notNull().default(false),
  account_manager_id: integer("account_manager_id").references(() => users.id),
  status: text("status", { enum: ["active", "inactive"] }).notNull().default("active"),
  notes: text("notes"),
  created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const client_contacts = sqliteTable("client_contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  client_id: integer("client_id").notNull().references(() => clients.id),
  name: text("name").notNull(),
  role: text("role"),
  email: text("email"),
  phone: text("phone"),
  is_primary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
});

/** Client-facing activations / campaigns / experiential work (replaces jobs). */
export const activations = sqliteTable("activations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  client_id: integer("client_id").notNull().references(() => clients.id),
  title: text("title").notNull(),
  type: text("type", {
    enum: ["activation", "campaign", "production", "digital", "pr"],
  }).notNull(),
  status: text("status").notNull().default("active"),
  stage: text("stage", {
    enum: ["brief", "production", "review", "delivery", "complete"],
  })
    .notNull()
    .default("brief"),
  brief: text("brief"),
  venue: text("venue"),
  start_date: text("start_date"),
  event_date: text("event_date"),
  due_date: text("due_date"),
  value: real("value"),
  owner_id: integer("owner_id").references(() => users.id),
  notes: text("notes"),
  created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
});

/** Internal event planning / project management (Scheduling tab). */
export const schedule_items = sqliteTable("schedule_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  kind: text("kind", {
    enum: ["shoot", "pitch_prep", "deadline", "crew", "studio_block", "other"],
  })
    .notNull()
    .default("other"),
  status: text("status", {
    enum: ["planned", "in_progress", "done", "cancelled"],
  })
    .notNull()
    .default("planned"),
  owner_id: integer("owner_id").references(() => users.id),
  start_at: text("start_at"),
  end_at: text("end_at"),
  related_activation_id: integer("related_activation_id").references(() => activations.id),
  notes: text("notes"),
  created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const event_tasks = sqliteTable("event_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  activation_id: integer("activation_id").references(() => activations.id),
  schedule_item_id: integer("schedule_item_id").references(() => schedule_items.id),
  title: text("title").notNull(),
  assignee_id: integer("assignee_id").references(() => users.id),
  status: text("status", { enum: ["todo", "in_progress", "done"] }).notNull().default("todo"),
  due_date: text("due_date"),
  studio_resource_id: integer("studio_resource_id"),
  completed_at: text("completed_at"),
});

export const deliverables = sqliteTable("deliverables", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  activation_id: integer("activation_id").notNull().references(() => activations.id),
  title: text("title").notNull(),
  type: text("type", { enum: ["tv", "radio", "digital", "print", "event"] }).notNull(),
  status: text("status", {
    enum: ["draft", "review", "approved", "delivered"],
  })
    .notNull()
    .default("draft"),
  due_date: text("due_date"),
});

export const studio_resources = sqliteTable("studio_resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", { enum: ["suite", "vo", "green_screen", "edit"] }).notNull(),
  capacity_hours_per_day: real("capacity_hours_per_day").notNull().default(8),
});

export const studio_allocs = sqliteTable("studio_allocs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  resource_id: integer("resource_id").notNull().references(() => studio_resources.id),
  activation_id: integer("activation_id").notNull().references(() => activations.id),
  date: text("date").notNull(),
  hours: real("hours").notNull(),
});

export const media_buys = sqliteTable("media_buys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  activation_id: integer("activation_id").notNull().references(() => activations.id),
  title: text("title").notNull(),
  channel: text("channel").notNull(),
  placement: text("placement"),
  budget: real("budget").notNull(),
  spent: real("spent").notNull().default(0),
  start_date: text("start_date"),
  end_date: text("end_date"),
  status: text("status", {
    enum: ["planned", "live", "complete", "paused"],
  })
    .notNull()
    .default("planned"),
  pacing_status: text("pacing_status", {
    enum: ["ok", "under", "over"],
  })
    .notNull()
    .default("ok"),
});

export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  activation_id: integer("activation_id").references(() => activations.id),
  client_id: integer("client_id").notNull().references(() => clients.id),
  number: text("number").notNull(),
  amount: real("amount").notNull(),
  status: text("status", {
    enum: ["draft", "sent", "overdue", "paid"],
  })
    .notNull()
    .default("draft"),
  issued_date: text("issued_date"),
  due_date: text("due_date"),
  paid_date: text("paid_date"),
});

export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoice_id: integer("invoice_id").notNull().references(() => invoices.id),
  amount: real("amount").notNull(),
  method: text("method"),
  date: text("date").notNull(),
});

export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  company: text("company").notNull(),
  sector: text("sector").notNull(),
  contact_name: text("contact_name"),
  contact_email: text("contact_email"),
  source: text("source"),
  status: text("status", {
    enum: ["cold", "warm", "proposal", "won", "lost"],
  })
    .notNull()
    .default("cold"),
  assigned_to_id: integer("assigned_to_id").references(() => users.id),
  notes: text("notes"),
  created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
  updated_at: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const activity_events = sqliteTable("activity_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  entity_type: text("entity_type").notNull(),
  entity_id: integer("entity_id"),
  type: text("type").notNull(),
  description: text("description").notNull(),
  actor_id: integer("actor_id").references(() => users.id),
  created_at: text("created_at").notNull().default(sql`(datetime('now'))`),
});

export const autopilot_actions = sqliteTable("autopilot_actions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull(),
  classification: text("classification", {
    enum: ["safe", "risky"],
  })
    .notNull()
    .default("safe"),
  status: text("status", {
    enum: ["auto_ran", "pending", "approved", "rejected"],
  })
    .notNull()
    .default("pending"),
  entity_type: text("entity_type"),
  entity_id: integer("entity_id"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  proposed_at: text("proposed_at").notNull().default(sql`(datetime('now'))`),
  resolved_at: text("resolved_at"),
  resolved_by_id: integer("resolved_by_id").references(() => users.id),
});

export const opportunities = sqliteTable("opportunities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  external_id: text("external_id").notNull().unique(),
  source: text("source").notNull().default("media-ingest"),
  reference: text("reference"),
  title: text("title").notNull(),
  description: text("description"),
  issuer: text("issuer"),
  province: text("province"),
  category: text("category"),
  status: text("status").notNull().default("open"),
  published_at: text("published_at"),
  closing_at: text("closing_at"),
  briefing_at: text("briefing_at"),
  estimated_value: real("estimated_value"),
  currency: text("currency").notNull().default("ZAR"),
  source_url: text("source_url"),
  fit_score: integer("fit_score"),
  score_breakdown: text("score_breakdown"),
  triage_status: text("triage_status", {
    enum: ["pending", "approved", "discarded"],
  })
    .notNull()
    .default("pending"),
  triage_note: text("triage_note"),
  triaged_at: text("triaged_at"),
  triaged_by: integer("triaged_by").references(() => users.id),
  ingested_at: text("ingested_at").notNull().default(sql`(datetime('now'))`),
  updated_at: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const opportunity_reminders = sqliteTable("opportunity_reminders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  opportunity_id: integer("opportunity_id").notNull().references(() => opportunities.id),
  kind: text("kind", { enum: ["deadline", "briefing"] }).notNull().default("deadline"),
  offset_hours: integer("offset_hours").notNull(),
  due_at: text("due_at").notNull(),
  sent_at: text("sent_at"),
  status: text("status", {
    enum: ["pending", "sent", "cancelled"],
  })
    .notNull()
    .default("pending"),
  payload: text("payload"),
});

/** Single-row agency workspace profile — editable in Settings */
export const workspace_settings = sqliteTable("workspace_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  agency_name: text("agency_name").notNull().default("Red Cherry Interactive"),
  headquarters: text("headquarters").notNull().default("Rivonia, Sandton, Johannesburg"),
  founded: text("founded").notNull().default("1996 · 30 Years"),
  certification: text("certification").notNull().default("Level 1 BBBEE · Female-Owned"),
  services: text("services")
    .notNull()
    .default("Strategy · Creative · Media · Production · PR · Digital · Activations"),
  updated_at: text("updated_at").notNull().default(sql`(datetime('now'))`),
});
