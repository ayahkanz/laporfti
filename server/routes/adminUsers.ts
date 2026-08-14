import { Router } from "express";
import { z } from "zod";
import { db } from "../db/connection";
import { requireSuperAdmin, requireModerator } from "../middleware/requireAdmin";
import { DIVISIONS, Division } from "../../src/lib/divisions";
import { logAudit } from "../lib/auditLog";

const router = Router();

type AdminUserRow = { email: string; name: string | null; role: string; division: string | null; added_by: string | null; created_at: string };

const roleSchema = z.enum(["SUPER_ADMIN", "MODERATOR", "PIMPINAN", "STAFF"]);
const divisionSchema = z.enum(DIVISIONS);

const inviteSchema = z
  .object({
    email: z.string().email(),
    name: z.string().max(150).optional(),
    role: roleSchema,
    division: divisionSchema.optional(),
  })
  .refine((data) => (data.role === "MODERATOR" || data.role === "STAFF" ? !!data.division : true), {
    message: "division is required for MODERATOR and STAFF roles",
    path: ["division"],
  });

const updateRoleSchema = z
  .object({
    role: roleSchema,
    division: divisionSchema.optional(),
  })
  .refine((data) => (data.role === "MODERATOR" || data.role === "STAFF" ? !!data.division : true), {
    message: "division is required for MODERATOR and STAFF roles",
    path: ["division"],
  });

function toEntry(r: AdminUserRow) {
  return {
    email: r.email,
    name: r.name ?? undefined,
    role: r.role,
    division: r.division ?? undefined,
    addedBy: r.added_by ?? undefined,
    createdAt: r.created_at,
  };
}

// GET /api/admin-users/staff?division=TEKNOLOGI_INFORMASI
// Lets a Moderator (or Super Admin) look up STAFF accounts to disposition a
// ticket to. Moderators are restricted to their own division; Super Admin
// may query any division.
router.get("/staff", requireModerator, (req, res) => {
  const division = req.query.division as Division | undefined;
  if (!division || !DIVISIONS.includes(division)) {
    return res.status(400).json({ error: "invalid_division" });
  }
  if (req.admin!.role === "MODERATOR" && req.admin!.division !== division) {
    return res.status(403).json({ error: "forbidden" });
  }
  const rows = db
    .prepare("SELECT * FROM admin_users WHERE role = 'STAFF' AND division = ? ORDER BY name ASC")
    .all(division) as AdminUserRow[];
  res.json(rows.map(toEntry));
});

// GET /api/admin-users
router.get("/", requireSuperAdmin, (_req, res) => {
  const rows = db.prepare("SELECT * FROM admin_users ORDER BY created_at ASC").all() as AdminUserRow[];
  res.json(rows.map(toEntry));
});

// POST /api/admin-users
router.post("/", requireSuperAdmin, (req, res) => {
  const parsed = inviteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload", details: parsed.error.flatten() });
  }
  const email = parsed.data.email.toLowerCase();
  const existing = db.prepare("SELECT email FROM admin_users WHERE email = ?").get(email);
  if (existing) {
    return res.status(409).json({ error: "already_exists" });
  }
  const division = parsed.data.role === "MODERATOR" || parsed.data.role === "STAFF" ? parsed.data.division : null;
  const now = new Date().toISOString();
  db.prepare("INSERT INTO admin_users (email, name, role, division, added_by, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(
    email,
    parsed.data.name ?? null,
    parsed.data.role,
    division ?? null,
    req.admin!.email,
    now
  );
  const row = db.prepare("SELECT * FROM admin_users WHERE email = ?").get(email) as AdminUserRow;

  logAudit({
    actorEmail: req.admin!.email,
    action: "ADMIN_USER_INVITED",
    targetType: "admin_user",
    targetId: email,
    details: `Diundang sebagai ${parsed.data.role}${division ? ` (${division})` : ""}`,
  });

  res.status(201).json(toEntry(row));
});

// PATCH /api/admin-users/:email
router.patch("/:email", requireSuperAdmin, (req, res) => {
  const parsed = updateRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload", details: parsed.error.flatten() });
  }
  const email = req.params.email.toLowerCase();
  const existing = db.prepare("SELECT email FROM admin_users WHERE email = ?").get(email) as { email: string } | undefined;
  if (!existing) return res.status(404).json({ error: "not_found" });

  const division = parsed.data.role === "MODERATOR" || parsed.data.role === "STAFF" ? parsed.data.division : null;
  db.prepare("UPDATE admin_users SET role = ?, division = ? WHERE email = ?").run(parsed.data.role, division ?? null, email);
  const row = db.prepare("SELECT * FROM admin_users WHERE email = ?").get(email) as AdminUserRow;

  logAudit({
    actorEmail: req.admin!.email,
    action: "ADMIN_USER_ROLE_CHANGED",
    targetType: "admin_user",
    targetId: email,
    details: `Role diubah ke ${parsed.data.role}${division ? ` (${division})` : ""}`,
  });

  res.json(toEntry(row));
});

// DELETE /api/admin-users/:email
router.delete("/:email", requireSuperAdmin, (req, res) => {
  const email = req.params.email.toLowerCase();

  if (email === req.admin!.email.toLowerCase()) {
    return res.status(400).json({ error: "cannot_remove_self" });
  }

  const existing = db.prepare("SELECT role FROM admin_users WHERE email = ?").get(email) as { role: string } | undefined;
  if (!existing) return res.status(404).json({ error: "not_found" });

  db.prepare("DELETE FROM admin_users WHERE email = ?").run(email);

  logAudit({
    actorEmail: req.admin!.email,
    action: "ADMIN_USER_REMOVED",
    targetType: "admin_user",
    targetId: email,
    details: `Akun admin dihapus (sebelumnya ${existing.role})`,
  });

  res.json({ ok: true });
});

// POST /api/admin-users/:email/revoke-session — force-logout every device
// currently logged in as this account, by rejecting any token issued before
// now. Doesn't remove the account, just its active sessions.
router.post("/:email/revoke-session", requireSuperAdmin, (req, res) => {
  const email = req.params.email.toLowerCase();

  if (email === req.admin!.email.toLowerCase()) {
    return res.status(400).json({ error: "cannot_revoke_self" });
  }

  const existing = db.prepare("SELECT email FROM admin_users WHERE email = ?").get(email);
  if (!existing) return res.status(404).json({ error: "not_found" });

  const now = new Date().toISOString();
  db.prepare("UPDATE admin_users SET session_revoked_at = ? WHERE email = ?").run(now, email);

  logAudit({
    actorEmail: req.admin!.email,
    action: "ADMIN_SESSION_REVOKED",
    targetType: "admin_user",
    targetId: email,
    details: `Sesi login dipaksa berakhir untuk ${email}`,
  });

  res.json({ ok: true, revokedAt: now });
});

type AuditLogRow = {
  id: number;
  actor_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  details: string | null;
  created_at: string;
};

// GET /api/admin-users/audit-log?actorEmail=...&limit=... — merged view of
// audit_log (sensitive admin actions) and admin_logins (logins), newest first.
router.get("/audit-log", requireSuperAdmin, (req, res) => {
  const actorEmail = typeof req.query.actorEmail === "string" ? req.query.actorEmail.toLowerCase() : undefined;
  const limit = Math.min(Number(req.query.limit) || 200, 500);

  const actionRows = (
    actorEmail
      ? db.prepare("SELECT * FROM audit_log WHERE actor_email = ? ORDER BY created_at DESC LIMIT ?").all(actorEmail, limit)
      : db.prepare("SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ?").all(limit)
  ) as AuditLogRow[];

  const loginRows = (
    actorEmail
      ? db.prepare("SELECT * FROM admin_logins WHERE email = ? ORDER BY logged_in_at DESC LIMIT ?").all(actorEmail, limit)
      : db.prepare("SELECT * FROM admin_logins ORDER BY logged_in_at DESC LIMIT ?").all(limit)
  ) as { id: number; email: string; name: string | null; logged_in_at: string; ip_address: string | null }[];

  const merged = [
    ...actionRows.map((r) => ({
      id: `action-${r.id}`,
      actorEmail: r.actor_email,
      action: r.action,
      targetType: r.target_type ?? undefined,
      targetId: r.target_id ?? undefined,
      details: r.details ?? undefined,
      createdAt: r.created_at,
    })),
    ...loginRows.map((r) => ({
      id: `login-${r.id}`,
      actorEmail: r.email,
      action: "LOGIN",
      targetType: undefined as string | undefined,
      targetId: undefined as string | undefined,
      details: r.ip_address ? `Login dari IP ${r.ip_address}` : undefined,
      createdAt: r.logged_in_at,
    })),
  ]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);

  res.json(merged);
});

export default router;
