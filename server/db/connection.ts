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
