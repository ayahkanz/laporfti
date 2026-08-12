import { Router } from "express";
import { z } from "zod";
import { db } from "../db/connection";
import { requireSuperAdmin } from "../middleware/requireAdmin";

const router = Router();

const hotlineSchema = z.object({
  phone: z.string().min(1).max(30),
  label: z.string().max(150).optional(),
});

router.get("/hotline", (_req, res) => {
  const phoneRow = db.prepare("SELECT * FROM settings WHERE key = 'hotline_phone'").get() as
    | { value: string; updated_at: string }
    | undefined;
  const labelRow = db.prepare("SELECT * FROM settings WHERE key = 'hotline_label'").get() as
    | { value: string; updated_at: string }
    | undefined;

  res.json({
    phone: phoneRow?.value ?? "",
    label: labelRow?.value ?? "Kontak Aduan Resmi FTI",
    updatedAt: phoneRow?.updated_at ?? null,
  });
});

router.put("/hotline", requireSuperAdmin, (req, res) => {
  const parsed = hotlineSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload", details: parsed.error.flatten() });
  }
  const now = new Date().toISOString();
  const updatedBy = req.admin?.email ?? "unknown";

  const upsert = db.prepare(`
    INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?, ?, ?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at, updated_by = excluded.updated_by
  `);
  const run = db.transaction(() => {
    upsert.run("hotline_phone", parsed.data.phone, now, updatedBy);
    if (parsed.data.label) {
      upsert.run("hotline_label", parsed.data.label, now, updatedBy);
    }
  });
  run();

  res.json({ phone: parsed.data.phone, label: parsed.data.label, updatedAt: now });
});

export default router;
