import jwt from "jsonwebtoken";
import type { Division } from "../../src/lib/divisions";

export type AdminRole = "SUPER_ADMIN" | "MODERATOR" | "PIMPINAN" | "STAFF";

export interface AdminSession {
  email: string;
  name?: string;
  role: AdminRole;
  division?: Division;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return secret;
}

export function signAdminSession(payload: AdminSession): string {
  const maxAgeHours = Number(process.env.SESSION_MAX_AGE_HOURS) || 12;
  return jwt.sign(payload, getSecret(), { expiresIn: `${maxAgeHours}h` });
}

export function verifyAdminSession(token: string): AdminSession | null {
  try {
    const decoded = jwt.verify(token, getSecret());
    if (typeof decoded === "object" && decoded && "email" in decoded && "role" in decoded) {
      return {
        email: String(decoded.email),
        name: (decoded as { name?: string }).name,
        role: (decoded as { role: AdminRole }).role,
        division: (decoded as { division?: Division }).division,
      };
    }
    return null;
  } catch {
    return null;
  }
}
