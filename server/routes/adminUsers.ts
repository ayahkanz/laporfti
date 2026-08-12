import { Router } from "express";
import { z } from "zod";
import { db } from "../db/connection";
import { requireSuperAdmin, requireModerator } from "../middleware/requireAdmin";
import { DIVISIONS, Division } from "../../src/lib/divisions";

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
  res.json(toEntry(row));
});

// DELETE /api/admin-users/:email
router.delete("/:email", requireSuperAdmin, (req, res) => {
  const email = req.params.email.toLowerCase();

  if (email === req.admin!.email.toLowerCase()) {
    return res.status(400).json({ error: "cannot_remove_self" });
  }

  const existing = db.prepare("SELECT email FROM admin_users WHERE email = ?").get(email);
  if (!existing) return res.status(404).json({ error: "not_found" });

  db.prepare("DELETE FROM admin_users WHERE email = ?").run(email);
  res.json({ ok: true });
});

export default router;
