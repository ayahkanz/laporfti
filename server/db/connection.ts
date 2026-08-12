import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DATABASE_PATH = process.env.DATABASE_PATH || "./data/lapor-handri.db";

fs.mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });

export const db = new Database(DATABASE_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Applied here (not deferred) so that any module importing `db` at its own
// top level can safely prepare statements against tables that already exist.
const schemaPath = path.resolve(process.cwd(), "server/db/schema.sql");
db.exec(fs.readFileSync(schemaPath, "utf-8"));

// CREATE TABLE IF NOT EXISTS above is a no-op on a table that already
// existed before `moderation_status` was added to schema.sql (e.g. the
// production DB from before the moderation gate feature) — so add the
// column defensively if it's still missing.
const reportsColumns = db.prepare("PRAGMA table_info(reports)").all() as { name: string }[];
if (!reportsColumns.some((c) => c.name === "moderation_status")) {
  db.exec("ALTER TABLE reports ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'PENDING'");
}

// One-time backfill: reports that already existed before the moderation
// gate shipped must stay visible in the public feed rather than vanishing
// until someone re-reviews them. New reports keep defaulting to PENDING.
const moderationBackfillDone = db
  .prepare("SELECT value FROM settings WHERE key = 'moderation_backfill_done'")
  .get();
if (!moderationBackfillDone) {
  db.prepare("UPDATE reports SET moderation_status = 'APPROVED' WHERE moderation_status = 'PENDING'").run();
  db.prepare("INSERT INTO settings (key, value, updated_at) VALUES ('moderation_backfill_done', '1', ?)").run(
    new Date().toISOString()
  );
}
