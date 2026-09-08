import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

function resolveDbPath(): string {
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith("postgres")) {
    return process.env.DATABASE_URL;
  }
  // Vercel: ephemeral FS — seed from bundled demo DB into /tmp
  if (process.env.VERCEL) {
    const tmpPath = "/tmp/cherry-ops.db";
    const bundled = path.join(process.cwd(), "data", "cherry-ops.db");
    if (!fs.existsSync(tmpPath) && fs.existsSync(bundled)) {
      // Copy main file only; avoid partial WAL sidecars from build machine
      fs.copyFileSync(bundled, tmpPath);
    }
    return tmpPath;
  }
  return "./data/cherry-ops.db";
}

const dbPath = resolveDbPath();

const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const sqlite = new Database(dbPath);
// DELETE mode on Vercel avoids needing -wal/-shm companions after a single-file copy
if (process.env.VERCEL) {
  sqlite.pragma("journal_mode = DELETE");
} else {
  sqlite.pragma("journal_mode = WAL");
}
sqlite.pragma("foreign_keys = ON");

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
`);

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
