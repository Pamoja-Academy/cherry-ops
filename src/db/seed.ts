import { db } from "./index";
import { sqlite } from "./index";
import {
  users,
  clients,
  client_contacts,
  activations,
  schedule_items,
  event_tasks,
  deliverables,
  studio_resources,
  studio_allocs,
  media_buys,
  invoices,
  payments,
  leads,
  activity_events,
  autopilot_actions,
  opportunities,
  opportunity_reminders,
  workspace_settings,
} from "./schema";
import { briefToOpportunityRow, getDemoBriefs } from "@/lib/opportunity/ingest";

function ensureOpportunityTables() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_id TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL DEFAULT 'media-ingest',
      reference TEXT,
      title TEXT NOT NULL,
      description TEXT,
      issuer TEXT,
      province TEXT,
      category TEXT,
      status TEXT NOT NULL DEFAULT 'open',
      published_at TEXT,
      closing_at TEXT,
      briefing_at TEXT,
      estimated_value REAL,
      currency TEXT NOT NULL DEFAULT 'ZAR',
      source_url TEXT,
      fit_score INTEGER,
      score_breakdown TEXT,
      triage_status TEXT NOT NULL DEFAULT 'pending',
      triage_note TEXT,
      triaged_at TEXT,
      triaged_by INTEGER REFERENCES users(id),
      ingested_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS opportunity_reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER NOT NULL REFERENCES opportunities(id),
      kind TEXT NOT NULL DEFAULT 'deadline',
      offset_hours INTEGER NOT NULL,
      due_at TEXT NOT NULL,
      sent_at TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      payload TEXT
    );
    CREATE TABLE IF NOT EXISTS workspace_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agency_name TEXT NOT NULL DEFAULT 'Red Cherry Interactive',
      headquarters TEXT NOT NULL DEFAULT 'Rivonia, Sandton, Johannesburg',
      founded TEXT NOT NULL DEFAULT '1996 · 30 Years',
      certification TEXT NOT NULL DEFAULT 'Level 1 BBBEE · Female-Owned',
      services TEXT NOT NULL DEFAULT 'Strategy · Creative · Media · Production · PR · Digital · Activations',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

function ensureEventsTables() {
  const jobsExists = sqlite
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='jobs'`)
    .get();

  if (jobsExists) {
    sqlite.exec(`
      DROP TABLE IF EXISTS payments;
      DROP TABLE IF EXISTS invoices;
      DROP TABLE IF EXISTS media_buys;
      DROP TABLE IF EXISTS studio_allocs;
      DROP TABLE IF EXISTS deliverables;
      DROP TABLE IF EXISTS job_tasks;
      DROP TABLE IF EXISTS jobs;
    `);
  }

  sqlite.exec(`
    DROP TABLE IF EXISTS job_tasks;
    DROP TABLE IF EXISTS jobs;

    CREATE TABLE IF NOT EXISTS activations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id),
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      stage TEXT NOT NULL DEFAULT 'brief',
      brief TEXT,
      venue TEXT,
      start_date TEXT,
      event_date TEXT,
      due_date TEXT,
      value REAL,
      owner_id INTEGER REFERENCES users(id),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS schedule_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'other',
      status TEXT NOT NULL DEFAULT 'planned',
      owner_id INTEGER REFERENCES users(id),
      start_at TEXT,
      end_at TEXT,
      related_activation_id INTEGER REFERENCES activations(id),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS event_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activation_id INTEGER REFERENCES activations(id),
      schedule_item_id INTEGER REFERENCES schedule_items(id),
      title TEXT NOT NULL,
      assignee_id INTEGER REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'todo',
      due_date TEXT,
      studio_resource_id INTEGER,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS deliverables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activation_id INTEGER NOT NULL REFERENCES activations(id),
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      due_date TEXT
    );

    CREATE TABLE IF NOT EXISTS studio_allocs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      resource_id INTEGER NOT NULL REFERENCES studio_resources(id),
      activation_id INTEGER NOT NULL REFERENCES activations(id),
      date TEXT NOT NULL,
      hours REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media_buys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activation_id INTEGER NOT NULL REFERENCES activations(id),
      title TEXT NOT NULL,
      channel TEXT NOT NULL,
      placement TEXT,
      budget REAL NOT NULL,
      spent REAL NOT NULL DEFAULT 0,
      start_date TEXT,
      end_date TEXT,
      status TEXT NOT NULL DEFAULT 'planned',
      pacing_status TEXT NOT NULL DEFAULT 'ok'
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activation_id INTEGER REFERENCES activations(id),
      client_id INTEGER NOT NULL REFERENCES clients(id),
      number TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      issued_date TEXT,
      due_date TEXT,
      paid_date TEXT
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL REFERENCES invoices(id),
      amount REAL NOT NULL,
      method TEXT,
      date TEXT NOT NULL
    );
  `);
}

async function seed() {
  console.log("🌱 Seeding Cherry Ops database...");

  ensureOpportunityTables();
  ensureEventsTables();

  // Clear existing data (FK order)
  await db.delete(opportunity_reminders);
  await db.delete(opportunities);
  await db.delete(autopilot_actions);
  await db.delete(activity_events);
  await db.delete(leads);
  await db.delete(studio_allocs);
  await db.delete(media_buys);
  await db.delete(payments);
  await db.delete(invoices);
  await db.delete(deliverables);
  await db.delete(event_tasks);
  await db.delete(schedule_items);
  await db.delete(activations);
  await db.delete(client_contacts);
  await db.delete(clients);
  await db.delete(studio_resources);
  await db.delete(users);
  await db.delete(workspace_settings);

  await db.insert(workspace_settings).values({
    agency_name: "Red Cherry Interactive",
    headquarters: "Rivonia, Sandton, Johannesburg",
    founded: "1996 · 30 Years",
    certification: "Level 1 BBBEE · Female-Owned",
    services: "Strategy · Creative · Media · Production · PR · Digital · Activations",
  });

  // Users
  const [pheladi, creative, director, production, media, finance] = await db.insert(users).values([
    { email: "ceo@cherry-ops.demo", name: "Pheladi Mphahlele", password: "cherry-ceo-2026", role: "CEO", avatar_initials: "PM" },
    { email: "cd@cherry-ops.demo", name: "Danny van Vuuren", password: "cherry-cd-2026", role: "CREATIVE_DIRECTOR", avatar_initials: "DV" },
    { email: "director@cherry-ops.demo", name: "Jenna Murray-Smith", password: "cherry-dir-2026", role: "DIRECTOR", avatar_initials: "JM" },
    { email: "production@cherry-ops.demo", name: "Robbyn Burger", password: "cherry-prod-2026", role: "PRODUCTION", avatar_initials: "RB" },
    { email: "media@cherry-ops.demo", name: "Faye Dawood", password: "cherry-media-2026", role: "MEDIA", avatar_initials: "FD" },
    { email: "finance@cherry-ops.demo", name: "Aliki Frantzeskos", password: "cherry-fin-2026", role: "FINANCE", avatar_initials: "AF" },
  ]).returning();

  // Clients
  const [africanBank, tigerBrands, fnb, oldMutual, truCape, saTourism, gcis, massmart] = await db.insert(clients).values([
    { name: "African Bank", sector: "Financial Services", industry: "Banking", contact_name: "Karabo Malatsi", contact_email: "karabo@africanbank.co.za", contact_phone: "+27 11 256 9000", is_private_sector: true, account_manager_id: pheladi.id, status: "active" },
    { name: "Tiger Brands", sector: "FMCG", industry: "Consumer Goods", contact_name: "John Doe", contact_email: "j.doe@tigerbrands.com", contact_phone: "+27 11 840 4000", is_private_sector: true, account_manager_id: creative.id, status: "active" },
    { name: "FNB Smart Rewards", sector: "Financial Services", industry: "Banking", contact_name: "Naledi Sithole", contact_email: "naledi@fnb.co.za", contact_phone: "+27 87 575 9404", is_private_sector: true, account_manager_id: pheladi.id, status: "active" },
    { name: "Old Mutual", sector: "Financial Services", industry: "Insurance & Investments", contact_name: "Bongani Shabalala", contact_email: "b.shabalala@oldmutual.com", contact_phone: "+27 21 509 2000", is_private_sector: true, account_manager_id: creative.id, status: "active" },
    { name: "Tru-Cape", sector: "Agriculture", industry: "Fresh Produce", contact_name: "Mike van der Merwe", contact_email: "mike@trucape.co.za", contact_phone: "+27 21 860 4000", is_private_sector: true, account_manager_id: production.id, status: "active" },
    { name: "SA Tourism", sector: "Government", industry: "Tourism", contact_name: "Ntombi Mthembu", contact_email: "ntombi@satourism.gov.za", contact_phone: "+27 11 895 3000", is_private_sector: false, account_manager_id: pheladi.id, status: "active" },
    { name: "GCIS", sector: "Government", industry: "Communications", contact_name: "Thandi Mokoena", contact_email: "thandi@gcis.gov.za", contact_phone: "+27 12 473 0000", is_private_sector: false, account_manager_id: media.id, status: "active" },
    { name: "Massmart (Walmart SA)", sector: "Retail", industry: "Mass Retail", contact_name: "Ryan Jacobs", contact_email: "r.jacobs@massmart.co.za", contact_phone: "+27 11 517 0000", is_private_sector: true, account_manager_id: pheladi.id, status: "active", notes: "New private sector target — H2 2026 priority" },
  ]).returning();

  // Activations (formerly jobs)
  const today = new Date();
  const d = (daysOffset: number) => {
    const dt = new Date(today);
    dt.setDate(dt.getDate() + daysOffset);
    return dt.toISOString().split("T")[0];
  };
  const dt = (daysOffset: number, time = "09:00:00") => `${d(daysOffset)}T${time}`;

  const [fnbTVC, tigerBirthday, oldMutualQ4, africanBrandRefresh, truCapeDigital, saTourismSummer, massmartBF, gcisHeritage, fnbApp, oldMutualWebinar, tigerOros, africanLoyalty] = await db.insert(activations).values([
    { client_id: fnb.id, title: "Smart Rewards Season 3 TVC", type: "production", status: "active", stage: "production", brief: "30s and 15s TVC for Smart Rewards Season 3 featuring lifestyle moments", start_date: d(-14), due_date: d(21), value: 450000, owner_id: creative.id },
    { client_id: tigerBrands.id, title: "Jelly Tots 51st Birthday Campaign", type: "campaign", status: "active", stage: "delivery", brief: "Multi-channel campaign celebrating 51 years of Jelly Tots", start_date: d(-30), due_date: d(7), value: 280000, owner_id: creative.id },
    { client_id: oldMutual.id, title: "Q4 Radio & TV Savings Campaign", type: "campaign", status: "active", stage: "brief", brief: "Q4 push on savings products targeting 25-45 age group", start_date: d(3), due_date: d(60), value: 320000, owner_id: pheladi.id },
    { client_id: africanBank.id, title: "Brand Refresh 360 Campaign", type: "campaign", status: "active", stage: "review", brief: "Full 360 brand refresh across all touchpoints", start_date: d(-21), due_date: d(14), value: 510000, owner_id: pheladi.id },
    { client_id: truCape.id, title: "Takeaways from Nature S2 Digital", type: "digital", status: "active", stage: "production", brief: "Season 2 of the digital content series", start_date: d(-7), due_date: d(28), value: 95000, owner_id: production.id },
    { client_id: saTourism.id, title: "Summer Domestic Travel Push", type: "campaign", status: "active", stage: "complete", brief: "Domestic tourism campaign for summer season", start_date: d(-60), due_date: d(-5), value: 180000, owner_id: pheladi.id },
    { client_id: massmart.id, title: "Black Friday ATL Campaign", type: "campaign", status: "active", stage: "brief", brief: "Above-the-line campaign for Black Friday 2026 — TV, radio, OOH, digital", start_date: d(7), due_date: d(70), value: 640000, owner_id: pheladi.id },
    { client_id: gcis.id, title: "Heritage Day Communications", type: "pr", status: "active", stage: "delivery", brief: "Heritage Day 24 Sept comm strategy and content", start_date: d(-10), due_date: d(21), value: 220000, owner_id: media.id },
    { client_id: fnb.id, title: "App Launch Activation Event", type: "activation", status: "active", stage: "production", brief: "Experiential event for new FNB app launch in Cape Town and Joburg", venue: "Cape Town & Johannesburg", start_date: d(-5), event_date: d(28), due_date: d(35), value: 150000, owner_id: production.id },
    { client_id: oldMutual.id, title: "Retirement Planning Webinar Series", type: "digital", status: "active", stage: "brief", brief: "4-part webinar series on retirement planning products", start_date: d(14), due_date: d(90), value: 75000, owner_id: creative.id },
    { client_id: tigerBrands.id, title: "Oros Summer Digital", type: "digital", status: "active", stage: "complete", brief: "Summer digital campaign for Oros", start_date: d(-45), due_date: d(-10), value: 120000, owner_id: creative.id },
    { client_id: africanBank.id, title: "Loyalty Programme Launch Event", type: "activation", status: "active", stage: "production", brief: "Full event production for loyalty programme launch", venue: "Sandton Convention Centre", start_date: d(-3), event_date: d(40), due_date: d(45), value: 380000, owner_id: production.id },
  ]).returning();

  // Schedule items (internal PM)
  const [pitchWarRoom, greenScreenBlock, crewCallLoyalty] = await db.insert(schedule_items).values([
    { title: "Capitec pitch war room", kind: "pitch_prep", status: "planned", owner_id: creative.id, start_at: dt(2, "08:00:00"), end_at: dt(2, "17:00:00"), notes: "Full-day pitch prep — creative + strategy" },
    { title: "Green screen block — FNB Smart Rewards S3", kind: "studio_block", status: "in_progress", owner_id: production.id, start_at: dt(1, "08:00:00"), end_at: dt(1, "18:00:00"), related_activation_id: fnbTVC.id, notes: "Lifestyle + product inserts" },
    { title: "Crew call — African Bank Loyalty Launch", kind: "crew", status: "planned", owner_id: production.id, start_at: dt(38, "06:00:00"), end_at: dt(38, "22:00:00"), related_activation_id: africanLoyalty.id, notes: "Full crew call + load-in at Sandton Convention Centre" },
    { title: "Massmart Black Friday brief deadline", kind: "deadline", status: "planned", owner_id: pheladi.id, start_at: dt(7, "17:00:00"), end_at: dt(7, "17:00:00"), related_activation_id: massmartBF.id, notes: "Client brief lock for ATL campaign" },
    { title: "Heritage Day VO + edit block", kind: "studio_block", status: "planned", owner_id: media.id, start_at: dt(5, "09:00:00"), end_at: dt(5, "13:00:00"), related_activation_id: gcisHeritage.id },
    { title: "FNB App Launch venue walkthrough", kind: "shoot", status: "planned", owner_id: production.id, start_at: dt(10, "10:00:00"), end_at: dt(10, "14:00:00"), related_activation_id: fnbApp.id, notes: "CT + JHB venue tech checks" },
  ]).returning();

  // Event tasks (migrated job_tasks + schedule-linked tasks)
  await db.insert(event_tasks).values([
    { activation_id: fnbTVC.id, title: "Scriptwriting & storyboard", assignee_id: creative.id, status: "done", due_date: d(-7), completed_at: d(-7) + "T16:00:00" },
    { activation_id: fnbTVC.id, title: "Director casting", assignee_id: production.id, status: "done", due_date: d(-3), completed_at: d(-3) + "T12:00:00" },
    { activation_id: fnbTVC.id, title: "Shoot day 1 — lifestyle scenes", assignee_id: production.id, status: "in_progress", due_date: d(3) },
    { activation_id: fnbTVC.id, title: "Shoot day 2 — product close-ups", assignee_id: production.id, status: "todo", due_date: d(5) },
    { activation_id: fnbTVC.id, title: "Offline edit", assignee_id: creative.id, status: "todo", due_date: d(14) },
    { activation_id: africanBrandRefresh.id, title: "Creative review with client", assignee_id: creative.id, status: "in_progress", due_date: d(2) },
    { activation_id: africanBrandRefresh.id, title: "Digital asset adaptation", assignee_id: creative.id, status: "todo", due_date: d(7) },
    { activation_id: africanLoyalty.id, title: "Venue scouting report", assignee_id: production.id, status: "done", due_date: d(-2), completed_at: d(-2) + "T15:00:00" },
    { activation_id: africanLoyalty.id, title: "Production schedule finalisation", assignee_id: production.id, status: "in_progress", due_date: d(5) },
    { activation_id: fnbApp.id, title: "Logistics & vendor briefing", assignee_id: production.id, status: "todo", due_date: d(7) },
    { schedule_item_id: pitchWarRoom.id, title: "Assemble Capitec pitch deck v2", assignee_id: creative.id, status: "todo", due_date: d(1) },
    { schedule_item_id: greenScreenBlock.id, title: "Confirm talent call times for green screen", assignee_id: production.id, status: "in_progress", due_date: d(0) },
    { schedule_item_id: crewCallLoyalty.id, title: "Issue loyalty launch crew call sheet", assignee_id: production.id, status: "todo", due_date: d(30) },
  ]);

  // Deliverables
  await db.insert(deliverables).values([
    { activation_id: fnbTVC.id, title: "Smart Rewards :30 TVC", type: "tv", status: "review", due_date: d(14) },
    { activation_id: fnbTVC.id, title: "Smart Rewards :15 TVC", type: "tv", status: "draft", due_date: d(18) },
    { activation_id: tigerBirthday.id, title: "Birthday Campaign Social Pack", type: "digital", status: "approved", due_date: d(5) },
    { activation_id: tigerBirthday.id, title: "In-store POS Materials", type: "print", status: "delivered", due_date: d(-3) },
    { activation_id: africanBrandRefresh.id, title: "Brand Manifesto TVC :60", type: "tv", status: "review", due_date: d(10) },
    { activation_id: africanBrandRefresh.id, title: "Radio Suite (3 scripts)", type: "radio", status: "approved", due_date: d(8) },
  ]);

  // Studio resources
  const [editA, editB, voStudio, greenScreen] = await db.insert(studio_resources).values([
    { name: "Edit Suite A", type: "edit", capacity_hours_per_day: 8 },
    { name: "Edit Suite B", type: "edit", capacity_hours_per_day: 8 },
    { name: "VO Studio", type: "vo", capacity_hours_per_day: 8 },
    { name: "Green Screen Studio", type: "green_screen", capacity_hours_per_day: 10 },
  ]).returning();

  // Studio allocations
  await db.insert(studio_allocs).values([
    { resource_id: editA.id, activation_id: fnbTVC.id, date: d(0), hours: 6 },
    { resource_id: editA.id, activation_id: africanBrandRefresh.id, date: d(0), hours: 2 },
    { resource_id: editB.id, activation_id: tigerBirthday.id, date: d(0), hours: 4 },
    { resource_id: editB.id, activation_id: truCapeDigital.id, date: d(0), hours: 4 },
    { resource_id: voStudio.id, activation_id: oldMutualQ4.id, date: d(0), hours: 3 },
    { resource_id: voStudio.id, activation_id: africanLoyalty.id, date: d(0), hours: 5 },
    { resource_id: greenScreen.id, activation_id: fnbTVC.id, date: d(1), hours: 8 },
    { resource_id: editA.id, activation_id: fnbTVC.id, date: d(1), hours: 5 },
    { resource_id: editB.id, activation_id: massmartBF.id, date: d(2), hours: 6 },
    { resource_id: voStudio.id, activation_id: gcisHeritage.id, date: d(2), hours: 4 },
  ]);

  // Media buys
  await db.insert(media_buys).values([
    { activation_id: fnbTVC.id, title: "FNB DSTV Compact Slots", channel: "DSTV", placement: "Compact Bouquet :30s", budget: 120000, spent: 45000, start_date: d(14), end_date: d(42), status: "planned", pacing_status: "ok" },
    { activation_id: tigerBirthday.id, title: "Jelly Tots Instagram Stories", channel: "Instagram", placement: "Stories & Reels", budget: 35000, spent: 32000, start_date: d(-20), end_date: d(5), status: "live", pacing_status: "over" },
    { activation_id: tigerBirthday.id, title: "Jelly Tots YouTube Pre-roll", channel: "YouTube", placement: "Pre-roll :15", budget: 28000, spent: 10000, start_date: d(-20), end_date: d(5), status: "live", pacing_status: "under" },
    { activation_id: africanBrandRefresh.id, title: "African Bank Radio 702", channel: "Radio 702", placement: "Drive Time :30s", budget: 85000, spent: 42000, start_date: d(-14), end_date: d(14), status: "live", pacing_status: "ok" },
    { activation_id: africanBrandRefresh.id, title: "African Bank eNCA Digital", channel: "eNCA", placement: "Leaderboard + MPU", budget: 45000, spent: 28000, start_date: d(-14), end_date: d(14), status: "live", pacing_status: "ok" },
    { activation_id: oldMutualQ4.id, title: "Old Mutual SABC TV", channel: "SABC", placement: "Prime Time :30s", budget: 95000, spent: 0, start_date: d(14), end_date: d(60), status: "planned", pacing_status: "ok" },
    { activation_id: saTourismSummer.id, title: "SA Tourism OOH Sandton", channel: "OOH", placement: "Sandton CBD Billboards", budget: 55000, spent: 55000, start_date: d(-50), end_date: d(-5), status: "complete", pacing_status: "ok" },
    { activation_id: massmartBF.id, title: "Massmart DSTV Premium", channel: "DSTV", placement: "Premium Bouquet :30s", budget: 180000, spent: 0, start_date: d(56), end_date: d(70), status: "planned", pacing_status: "ok" },
    { activation_id: gcisHeritage.id, title: "GCIS Community Radio Bundle", channel: "Community Radio", placement: "Bundle — 5 stations", budget: 40000, spent: 18000, start_date: d(-5), end_date: d(21), status: "live", pacing_status: "under" },
    { activation_id: africanLoyalty.id, title: "African Bank LinkedIn", channel: "LinkedIn", placement: "Sponsored Content", budget: 22000, spent: 8000, start_date: d(-3), end_date: d(45), status: "live", pacing_status: "ok" },
  ]);

  // Invoices
  const invoiceData = [
    { activation_id: africanBrandRefresh.id, client_id: africanBank.id, number: "RCI-2026-001", amount: 255000, status: "overdue" as const, issued_date: d(-45), due_date: d(-15) },
    { activation_id: africanLoyalty.id, client_id: africanBank.id, number: "RCI-2026-002", amount: 190000, status: "sent" as const, issued_date: d(-10), due_date: d(20) },
    { activation_id: fnbTVC.id, client_id: fnb.id, number: "RCI-2026-003", amount: 225000, status: "sent" as const, issued_date: d(-5), due_date: d(25) },
    { activation_id: fnbApp.id, client_id: fnb.id, number: "RCI-2026-004", amount: 75000, status: "draft" as const, issued_date: d(0), due_date: d(30) },
    { activation_id: tigerBirthday.id, client_id: tigerBrands.id, number: "RCI-2026-005", amount: 92000, status: "overdue" as const, issued_date: d(-35), due_date: d(-5) },
    { activation_id: tigerOros.id, client_id: tigerBrands.id, number: "RCI-2026-006", amount: 120000, status: "paid" as const, issued_date: d(-55), due_date: d(-25), paid_date: d(-28) },
    { activation_id: oldMutualQ4.id, client_id: oldMutual.id, number: "RCI-2026-007", amount: 80000, status: "draft" as const, issued_date: d(0), due_date: d(30) },
    { activation_id: oldMutualWebinar.id, client_id: oldMutual.id, number: "RCI-2026-008", amount: 37500, status: "draft" as const, issued_date: d(0), due_date: d(30) },
    { activation_id: truCapeDigital.id, client_id: truCape.id, number: "RCI-2026-009", amount: 47500, status: "sent" as const, issued_date: d(-8), due_date: d(22) },
    { activation_id: saTourismSummer.id, client_id: saTourism.id, number: "RCI-2026-010", amount: 55000, status: "overdue" as const, issued_date: d(-40), due_date: d(-10) },
    { activation_id: saTourismSummer.id, client_id: saTourism.id, number: "RCI-2026-011", amount: 90000, status: "paid" as const, issued_date: d(-65), due_date: d(-35), paid_date: d(-38) },
    { activation_id: gcisHeritage.id, client_id: gcis.id, number: "RCI-2026-012", amount: 110000, status: "sent" as const, issued_date: d(-7), due_date: d(23) },
    { activation_id: massmartBF.id, client_id: massmart.id, number: "RCI-2026-013", amount: 64000, status: "draft" as const, issued_date: d(0), due_date: d(30) },
    { activation_id: africanBrandRefresh.id, client_id: africanBank.id, number: "RCI-2026-014", amount: 255000, status: "paid" as const, issued_date: d(-75), due_date: d(-45), paid_date: d(-48) },
    { activation_id: fnbTVC.id, client_id: fnb.id, number: "RCI-2026-015", amount: 112500, status: "paid" as const, issued_date: d(-60), due_date: d(-30), paid_date: d(-32) },
  ];
  await db.insert(invoices).values(invoiceData);

  // Leads
  await db.insert(leads).values([
    { company: "Pick n Pay", sector: "Retail", contact_name: "Sarah Goldberg", contact_email: "s.goldberg@pnp.co.za", source: "Referral", status: "warm", assigned_to_id: pheladi.id, notes: "Marketing Director, keen on Q4 activation", updated_at: d(-3) },
    { company: "Discovery Health", sector: "Financial Services / Insurance", contact_name: "Dr. Anand Patel", contact_email: "a.patel@discovery.co.za", source: "Outbound", status: "proposal", assigned_to_id: pheladi.id, notes: "Proposal sent for wellness campaign. Follow up 12 Sept.", updated_at: d(-1) },
    { company: "Capitec Bank", sector: "Financial Services", contact_name: "Lebo Ramaphosa", contact_email: "l.ramaphosa@capitec.co.za", source: "Conference", status: "cold", assigned_to_id: creative.id, notes: "Met at AMC Conference July 2026", updated_at: d(-14) },
    { company: "MultiChoice", sector: "Media & Entertainment", contact_name: "Neil Thompson", contact_email: "n.thompson@multichoice.com", source: "Inbound", status: "warm", assigned_to_id: media.id, notes: "Interested in DSTV content sponsorship package", updated_at: d(-6) },
    { company: "Shoprite Holdings", sector: "Retail", contact_name: "Johan Mouton", contact_email: "j.mouton@shoprite.co.za", source: "Outbound", status: "cold", assigned_to_id: pheladi.id, notes: "Initial outreach sent. No response yet.", updated_at: d(-21) },
    { company: "MTN South Africa", sector: "Telecommunications", contact_name: "Busisiwe Zulu", contact_email: "b.zulu@mtn.com", source: "Referral", status: "warm", assigned_to_id: pheladi.id, notes: "Referred by FNB contact. Looking for creative AOR.", updated_at: d(-4) },
  ]);

  // Activity events
  const events = [
    { entity_type: "activation", entity_id: fnbTVC.id, type: "stage_change", description: "FNB Smart Rewards S3 TVC moved to Production stage", actor_id: production.id, created_at: d(-7) + "T09:15:00" },
    { entity_type: "invoice", entity_id: 1, type: "invoice_sent", description: "Invoice RCI-2026-001 sent to African Bank (R255,000)", actor_id: finance.id, created_at: d(-10) + "T14:30:00" },
    { entity_type: "lead", entity_id: 2, type: "lead_updated", description: "Discovery Health lead advanced to Proposal stage", actor_id: pheladi.id, created_at: d(-2) + "T11:00:00" },
    { entity_type: "activation", entity_id: massmartBF.id, type: "activation_created", description: "New activation created: Massmart Black Friday ATL Campaign (R640,000)", actor_id: pheladi.id, created_at: d(-1) + "T10:00:00" },
    { entity_type: "media_buy", entity_id: 2, type: "pacing_alert", description: "⚠️ Jelly Tots Instagram Stories pacing OVER budget", actor_id: null, created_at: d(0) + "T08:00:00" },
    { entity_type: "invoice", entity_id: 6, type: "invoice_paid", description: "Invoice RCI-2026-006 paid by Tiger Brands (R120,000)", actor_id: finance.id, created_at: d(-28) + "T16:00:00" },
    { entity_type: "activation", entity_id: africanBrandRefresh.id, type: "stage_change", description: "African Bank Brand Refresh moved to Review stage", actor_id: creative.id, created_at: d(-5) + "T09:00:00" },
    { entity_type: "lead", entity_id: 1, type: "lead_updated", description: "Pick n Pay lead marked as Warm — new contact established", actor_id: pheladi.id, created_at: d(-3) + "T13:45:00" },
    { entity_type: "autopilot", entity_id: null, type: "sla_flag", description: "🤖 Autopilot: SLA flag raised for Jelly Tots Birthday Campaign (7 days to deadline)", actor_id: null, created_at: d(-2) + "T07:00:00" },
    { entity_type: "invoice", entity_id: 5, type: "overdue_flag", description: "🤖 Autopilot: Invoice RCI-2026-005 (Tiger Brands R92,000) is now overdue", actor_id: null, created_at: d(-1) + "T07:00:00" },
    { entity_type: "client", entity_id: massmart.id, type: "client_created", description: "New client added: Massmart (Walmart SA) — Private Sector target", actor_id: pheladi.id, created_at: d(-1) + "T09:30:00" },
    { entity_type: "activation", entity_id: fnbApp.id, type: "stage_change", description: "FNB App Launch Activation Event entered Production stage", actor_id: production.id, created_at: d(-3) + "T11:00:00" },
    { entity_type: "lead", entity_id: 4, type: "lead_created", description: "New lead: MultiChoice — Media & Entertainment", actor_id: media.id, created_at: d(-6) + "T14:00:00" },
    { entity_type: "autopilot", entity_id: null, type: "nudge", description: "🤖 Autopilot: Capitec Bank lead hasn't been updated in 14 days — follow up recommended", actor_id: null, created_at: d(0) + "T07:00:00" },
    { entity_type: "media_buy", entity_id: 9, type: "pacing_alert", description: "⚠️ GCIS Community Radio pacing UNDER — 18% spend vs 40% flight duration", actor_id: null, created_at: d(-1) + "T08:00:00" },
    { entity_type: "invoice", entity_id: 15, type: "invoice_paid", description: "Invoice RCI-2026-015 paid by FNB (R112,500)", actor_id: finance.id, created_at: d(-32) + "T10:00:00" },
    { entity_type: "activation", entity_id: saTourismSummer.id, type: "stage_change", description: "SA Tourism Summer Travel Push marked Complete", actor_id: pheladi.id, created_at: d(-5) + "T17:00:00" },
    { entity_type: "lead", entity_id: 6, type: "lead_created", description: "New lead: MTN South Africa — referred by FNB contact", actor_id: pheladi.id, created_at: d(-4) + "T12:00:00" },
    { entity_type: "autopilot", entity_id: null, type: "sla_flag", description: "🤖 Autopilot: Old Mutual Q4 Campaign brief is due in 3 days", actor_id: null, created_at: d(-1) + "T07:00:00" },
    { entity_type: "activation", entity_id: africanLoyalty.id, type: "activation_created", description: "New production activation: African Bank Loyalty Programme Launch Event (R380,000)", actor_id: production.id, created_at: d(-3) + "T09:00:00" },
  ];
  await db.insert(activity_events).values(events);

  // Autopilot actions
  await db.insert(autopilot_actions).values([
    // Pending (risky — need approval)
    { type: "send_invoice_reminder", classification: "risky", status: "pending", entity_type: "invoice", entity_id: 1, title: "Send overdue reminder to African Bank", description: "Invoice RCI-2026-001 is 15 days overdue (R255,000). Propose sending a formal overdue reminder to Karabo Malatsi at African Bank.", proposed_at: d(0) + "T07:00:00" },
    { type: "mark_activation_complete", classification: "risky", status: "pending", entity_type: "activation", entity_id: fnbTVC.id, title: "Mark FNB Smart Rewards TVC as Complete", description: "All deliverables appear finalised. Propose marking this activation complete and triggering final invoice.", proposed_at: d(0) + "T07:05:00" },
    { type: "send_invoice_reminder", classification: "risky", status: "pending", entity_type: "invoice", entity_id: 10, title: "Send overdue reminder to SA Tourism", description: "Invoice RCI-2026-010 is 10 days overdue (R55,000). Propose sending an overdue reminder to Ntombi Mthembu at SA Tourism.", proposed_at: d(0) + "T07:10:00" },
    // Auto-ran (safe — already executed)
    { type: "sla_flag", classification: "safe", status: "auto_ran", entity_type: "activation", entity_id: tigerBirthday.id, title: "SLA Flag: Jelly Tots Birthday Campaign", description: "Activation due in 7 days. SLA flag raised in activity feed.", proposed_at: d(-2) + "T07:00:00", resolved_at: d(-2) + "T07:00:00" },
    { type: "pacing_alert", classification: "safe", status: "auto_ran", entity_type: "media_buy", entity_id: 2, title: "Pacing Alert: Jelly Tots Instagram Stories OVER", description: "Media buy pacing over budget. Alert logged to activity feed and media team notified.", proposed_at: d(0) + "T08:00:00", resolved_at: d(0) + "T08:00:00" },
    { type: "pacing_alert", classification: "safe", status: "auto_ran", entity_type: "media_buy", entity_id: 3, title: "Pacing Alert: Jelly Tots YouTube UNDER", description: "Media buy pacing under. Alert logged — under 15% spend vs flight duration.", proposed_at: d(-1) + "T08:00:00", resolved_at: d(-1) + "T08:00:00" },
    { type: "lead_nudge", classification: "safe", status: "auto_ran", entity_type: "lead", entity_id: 3, title: "Lead Nudge: Capitec Bank", description: "Capitec Bank lead hasn't been updated in 14+ days. Nudge sent to Danny van Vuuren.", proposed_at: d(0) + "T07:00:00", resolved_at: d(0) + "T07:00:00" },
    { type: "pacing_alert", classification: "safe", status: "auto_ran", entity_type: "media_buy", entity_id: 9, title: "Pacing Alert: GCIS Community Radio UNDER", description: "Community Radio buy is pacing under. Alert logged to media team.", proposed_at: d(-1) + "T08:00:00", resolved_at: d(-1) + "T08:00:00" },
    { type: "sla_flag", classification: "safe", status: "auto_ran", entity_type: "activation", entity_id: oldMutualQ4.id, title: "SLA Flag: Old Mutual Q4 Campaign Brief Due Soon", description: "Old Mutual Q4 Campaign brief window opens in 3 days. Reminder logged.", proposed_at: d(-1) + "T07:00:00", resolved_at: d(-1) + "T07:00:00" },
    { type: "overdue_flag", classification: "safe", status: "auto_ran", entity_type: "invoice", entity_id: 5, title: "Overdue Flag: Tiger Brands Invoice", description: "Invoice RCI-2026-005 (R92,000) marked overdue. Finance team notified.", proposed_at: d(-1) + "T07:00:00", resolved_at: d(-1) + "T07:00:00" },
    { type: "lead_nudge", classification: "safe", status: "auto_ran", entity_type: "lead", entity_id: 5, title: "Lead Nudge: Shoprite Holdings", description: "Shoprite Holdings lead hasn't been updated in 21+ days. Nudge sent to Pheladi Mphahlele.", proposed_at: d(0) + "T07:00:00", resolved_at: d(0) + "T07:00:00" },
  ]);

  // Opportunity Ops — media briefs (scored on ingest)
  const demoBriefs = getDemoBriefs().map(briefToOpportunityRow);
  await db.insert(opportunities).values(demoBriefs);

  console.log(`✅ Seeded ${demoBriefs.length} media opportunities`);
  console.log("✅ Seed complete!");
}

seed().catch(console.error);
