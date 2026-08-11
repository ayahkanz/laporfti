import { Router } from "express";
import { OAuth2Client } from "google-auth-library";
import { db } from "../db/connection";
import { signAdminSession, verifyAdminSession, AdminRole, AdminSession } from "../lib/jwt";
import { SESSION_COOKIE_NAME } from "../middleware/requireAdmin";
import type { Division } from "../../src/lib/divisions";

const router = Router();

function getOAuthClient() {
  return new OAuth2Client({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_OAUTH_REDIRECT_URI,
  });
}

function getAllowedDomains(): string[] {
  return (process.env.ALLOWED_EMAIL_DOMAINS || "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

function isEmailDomainAllowed(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return false;
  return getAllowedDomains().includes(domain);
}

type AdminUserRow = { email: string; name: string | null; role: AdminRole; division: Division | null };

// Resolves an authenticated Google email to an admin role + division.
// - If the email is already registered in admin_users, use that record.
// - If admin_users is empty (first-ever login), bootstrap this account as
//   SUPER_ADMIN — optionally locked to SUPER_ADMIN_BOOTSTRAP_EMAIL so a stray
//   first login from someone else on the same domain can't self-promote.
// - Otherwise, the account is not registered and login is rejected; a
//   Super Admin must invite them first via the admin-users management screen.
function resolveAdminIdentity(email: string, name: string | undefined): Pick<AdminSession, "role" | "division"> | null {
  const existing = db.prepare("SELECT * FROM admin_users WHERE email = ?").get(email) as AdminUserRow | undefined;
  if (existing) return { role: existing.role, division: existing.division ?? undefined };

  const { count } = db.prepare("SELECT COUNT(*) AS count FROM admin_users").get() as { count: number };
  if (count === 0) {
    const bootstrapEmail = process.env.SUPER_ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
    if (bootstrapEmail && bootstrapEmail !== email.toLowerCase()) {
      return null;
    }
    db.prepare(
      "INSERT INTO admin_users (email, name, role, added_by, created_at) VALUES (?, ?, 'SUPER_ADMIN', ?, ?)"
    ).run(email, name ?? null, email, new Date().toISOString());
    return { role: "SUPER_ADMIN" };
  }

  return null;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: (Number(process.env.SESSION_MAX_AGE_HOURS) || 12) * 60 * 60 * 1000,
};

// In dev, the frontend (Vite) and this API server run on different ports,
// so a relative "/" redirect would stay on the API's own origin. APP_URL
// points back to the frontend origin; in production both are served from
// the same origin so this just resolves to the same place.
const APP_URL = process.env.APP_URL || "";

// GET /api/auth/google/start
router.get("/google/start", (_req, res) => {
  const client = getOAuthClient();
  const url = client.generateAuthUrl({
    access_type: "online",
    scope: ["openid", "email", "profile"],
    prompt: "select_account",
  });
  res.redirect(url);
});

// GET /api/auth/google/callback
router.get("/google/callback", async (req, res) => {
  const code = req.query.code as string | undefined;
  if (!code) {
    return res.redirect(`${APP_URL}/?authError=missing_code`);
  }

  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) {
      return res.redirect(`${APP_URL}/?authError=no_id_token`);
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.redirect(`${APP_URL}/?authError=no_email`);
    }

    if (!isEmailDomainAllowed(payload.email)) {
      return res.redirect(`${APP_URL}/?authError=domain_not_allowed`);
    }

    const identity = resolveAdminIdentity(payload.email, payload.name);
    if (!identity) {
      return res.redirect(`${APP_URL}/?authError=not_registered`);
    }

    const session: AdminSession = { email: payload.email, name: payload.name, role: identity.role, division: identity.division };
    const sessionToken = signAdminSession(session);

    db.prepare(
      "INSERT INTO admin_logins (email, name, logged_in_at, ip_address) VALUES (?, ?, ?, ?)"
    ).run(payload.email, payload.name ?? null, new Date().toISOString(), req.ip ?? null);

    res.cookie(SESSION_COOKIE_NAME, sessionToken, cookieOptions);
    res.redirect(`${APP_URL}/`);
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    res.redirect(`${APP_URL}/?authError=oauth_failed`);
  }
});

// GET /api/auth/me
router.get("/me", (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  const session = token ? verifyAdminSession(token) : null;
  if (!session) {
    return res.json({ authenticated: false });
  }
  res.json({ authenticated: true, email: session.email, name: session.name, role: session.role, division: session.division });
});

// POST /api/auth/logout
router.post("/logout", (_req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME);
  res.json({ ok: true });
});

export default router;
