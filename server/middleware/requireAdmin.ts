import { RequestHandler } from "express";
import { verifyAdminSession, AdminRole, AdminSession } from "../lib/jwt";
import { db } from "../db/connection";

export const SESSION_COOKIE_NAME = "lh_session";

// Super Admin can force-logout a staff/moderator account (e.g. compromised
// credentials, someone leaving the org) by setting session_revoked_at. Since
// sessions are stateless JWTs (no server-side session table), this is
// enforced by rejecting any token issued before that timestamp — effectively
// every device/browser that account is logged into, not one session at a time.
// Only accounts with an admin role can be revoked, so regular reporter
// logins skip this DB lookup entirely.
function isSessionRevoked(session: AdminSession): boolean {
  if (!session.role || !session.iat) return false;
  const row = db.prepare("SELECT session_revoked_at FROM admin_users WHERE email = ?").get(session.email) as
    | { session_revoked_at: string | null }
    | undefined;
  if (!row?.session_revoked_at) return false;
  return new Date(row.session_revoked_at).getTime() >= session.iat * 1000;
}

// Any authenticated UII account (student or staff), admin role or not. Gates
// the app to civitas akademika only — used app-wide in server/app.ts. This
// runs before every other requireX below, so the revocation check here is
// enough to cover them too.
export const requireLogin: RequestHandler = (req, res, next) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  const session = token ? verifyAdminSession(token) : null;
  if (!session) {
    return res.status(401).json({ error: "unauthorized" });
  }
  if (isSessionRevoked(session)) {
    return res.status(401).json({ error: "session_revoked" });
  }
  req.admin = session;
  next();
};

export function requireRole(allowedRoles: AdminRole[]): RequestHandler {
  return (req, res, next) => {
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    const session = token ? verifyAdminSession(token) : null;
    if (!session) {
      return res.status(401).json({ error: "unauthorized" });
    }
    if (!session.role || !allowedRoles.includes(session.role)) {
      return res.status(403).json({ error: "forbidden" });
    }
    req.admin = session;
    next();
  };
}

// Any authenticated admin/staff account, regardless of role.
export const requireAdmin: RequestHandler = requireRole(["SUPER_ADMIN", "MODERATOR", "PIMPINAN", "STAFF"]);

// Can triage/dispose reports within their division: status updates on any
// report in-division, moderation approve/reject, and assigning to staff.
// Fine-grained per-division/per-report checks still happen in the route
// handler — this only gates out PIMPINAN (read-only) and STAFF (execution-only).
export const requireModerator: RequestHandler = requireRole(["SUPER_ADMIN", "MODERATOR"]);

// Can act on a specific report (status update, official reply): Super Admin,
// division Moderators, and Staff executing a ticket disposed to them. PIMPINAN
// is excluded (read-only). The route handler still must verify the acting
// user's division/assignment actually matches the report in question.
export const requireActionable: RequestHandler = requireRole(["SUPER_ADMIN", "MODERATOR", "STAFF"]);

// Super Admin only: manage admin accounts, hotline settings.
export const requireSuperAdmin: RequestHandler = requireRole(["SUPER_ADMIN"]);
