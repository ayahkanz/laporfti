import { db } from "../db/connection";

const insertAuditLog = db.prepare(
  "INSERT INTO audit_log (actor_email, action, target_type, target_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)"
);

export interface AuditLogEntry {
  actorEmail: string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: string;
}

export function logAudit(entry: AuditLogEntry): void {
  insertAuditLog.run(
    entry.actorEmail,
    entry.action,
    entry.targetType ?? null,
    entry.targetId ?? null,
    entry.details ?? null,
    new Date().toISOString()
  );
}
