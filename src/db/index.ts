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

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
