import type { AdminSession } from "./lib/jwt";

declare global {
  namespace Express {
    interface Request {
      admin?: AdminSession;
    }
  }
}

export {};
