PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS admin_users (
  email               TEXT PRIMARY KEY,
  name                TEXT,
  role                TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN','MODERATOR','PIMPINAN','STAFF')),
  division            TEXT, -- required for MODERATOR/STAFF, null for SUPER_ADMIN/PIMPINAN; see src/lib/divisions.ts
  added_by            TEXT,
  created_at          TEXT NOT NULL,
  session_revoked_at  TEXT -- when set, any session token issued before this timestamp is rejected (forced logout)
);

CREATE TABLE IF NOT EXISTS reports (
  id                  TEXT PRIMARY KEY,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL,
  category            TEXT NOT NULL,
  status              TEXT NOT NULL,
  urgency             TEXT NOT NULL,
  moderation_status   TEXT NOT NULL DEFAULT 'PENDING' CHECK (moderation_status IN ('PENDING','APPROVED','REJECTED')),
  reporter_name       TEXT NOT NULL DEFAULT 'Anonim',
  reporter_role       TEXT,
  reporter_email      TEXT NOT NULL,
  reporter_whatsapp   TEXT,
  is_public           INTEGER NOT NULL DEFAULT 1,
  attachment_name     TEXT,
  attachment_path     TEXT,
  disposed_to_email   TEXT REFERENCES admin_users(email) ON DELETE SET NULL,
  disposition_note    TEXT,
  disposed_by         TEXT,
  disposed_at         TEXT,
  created_at          TEXT NOT NULL,
  updated_at          TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reports_status            ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_is_public         ON reports(is_public);
CREATE INDEX IF NOT EXISTS idx_reports_created_at        ON reports(created_at);
CREATE INDEX IF NOT EXISTS idx_reports_moderation_status ON reports(moderation_status);
CREATE INDEX IF NOT EXISTS idx_reports_category           ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_disposed_to_email  ON reports(disposed_to_email);

CREATE TABLE IF NOT EXISTS report_timeline (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id   TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  note        TEXT NOT NULL,
  timestamp   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_timeline_report_id ON report_timeline(report_id);

CREATE TABLE IF NOT EXISTS report_comments (
  id           TEXT PRIMARY KEY,
  report_id    TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  sender_name  TEXT NOT NULL,
  sender_role  TEXT NOT NULL CHECK (sender_role IN ('Admin','Mahasiswa')),
  content      TEXT NOT NULL,
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comments_report_id ON report_comments(report_id);

CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  updated_by  TEXT
);

CREATE TABLE IF NOT EXISTS admin_logins (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT NOT NULL,
  name         TEXT,
  logged_in_at TEXT NOT NULL,
  ip_address   TEXT
);
CREATE INDEX IF NOT EXISTS idx_admin_logins_email ON admin_logins(email);

-- Append-only trail of sensitive admin actions (status/disposition/moderation/
-- category changes, admin account management, hotline changes, session
-- revocations). Logins are tracked separately in admin_logins; the audit log
-- API merges both for a single Super-Admin-facing view.
CREATE TABLE IF NOT EXISTS audit_log (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_email  TEXT NOT NULL,
  action       TEXT NOT NULL,
  target_type  TEXT,
  target_id    TEXT,
  details      TEXT,
  created_at   TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at  ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_email ON audit_log(actor_email);
