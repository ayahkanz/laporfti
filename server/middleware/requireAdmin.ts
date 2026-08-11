import { RequestHandler } from "express";
import { verifyAdminSession, AdminRole } from "../lib/jwt";

export const SESSION_COOKIE_NAME = "lh_session";

export function requireRole(allowedRoles: AdminRole[]): RequestHandler {
  return (req, res, next) => {
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    const session = token ? verifyAdminSession(token) : null;
    if (!session) {
      return res.status(401).json({ error: "unauthorized" });
    }
    if (!allowedRoles.includes(session.role)) {
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
