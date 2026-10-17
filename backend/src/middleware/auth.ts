
import type { Request, Response, NextFunction } from "express";
import { createUserClient, supabasePublic } from "../lib/supabase";

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: "buyer" | "manufacturer";
  accessToken?: string;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const token = header.slice(7);

  try {
    const { data: { user }, error: authError } =
      await supabasePublic.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const db = createUserClient(token);
    const { data: profile, error: profileError } = await db
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({ error: "Could not load user profile" });
    }

    if (!profile || !["buyer", "manufacturer"].includes(profile.role)) {
      return res.status(403).json({ error: "Account profile is incomplete" });
    }

    req.userId = user.id;
    req.userRole = profile.role;
    req.accessToken = token;

    next();
  } catch {
    return res.status(500).json({ error: "Authentication failed" });
  }
}

export function allowRoles(...roles: Array<"buyer" | "manufacturer">) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: "You don't have permission" });
    }

    next();
  };
}
