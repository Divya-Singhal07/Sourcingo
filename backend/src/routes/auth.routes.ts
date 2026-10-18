
import { Router } from "express";
import { z } from "zod";
import { supabasePublic } from "../lib/supabase";

const router = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["buyer", "manufacturer"]),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid signup details",
      details: parsed.error.flatten(),
    });
  }

  const { email, password, role } = parsed.data;

  const { data, error } = await supabasePublic.auth.signUp({
    email,
    password,
    options: {
      data: { role },
    },
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  // Create a profiles row so login can always find the role
  if (data.user) {
    const { error: profileError } = await supabasePublic
      .from("profiles")
      .upsert({ id: data.user.id, role }, { onConflict: "id" });

    if (profileError) {
      // Log but don't fail — the account is created; profile can be backfilled
      console.warn("Could not create profile row:", profileError.message);
    }
  }

  return res.status(201).json({
    message: data.session
      ? "Account created"
      : "Account created. Check your email if confirmation is required.",
    user: data.user
      ? { id: data.user.id, email: data.user.email, role }
      : null,
    session: data.session,
  });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid login details",
      details: parsed.error.flatten(),
    });
  }

  const { data, error } =
    await supabasePublic.auth.signInWithPassword(parsed.data);

  if (error) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Try profiles table first; fall back to auth user_metadata role
  const { data: profile } = await supabasePublic
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  const role =
    profile?.role ??
    (data.user.user_metadata?.role as string | undefined) ??
    "buyer";

  // Backfill profile row if it was missing
  if (!profile) {
    await supabasePublic
      .from("profiles")
      .upsert({ id: data.user.id, role }, { onConflict: "id" })
      .then(({ error: e }) => {
        if (e) console.warn("Profile backfill failed:", e.message);
      });
  }

  return res.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      role,
    },
    session: data.session,
  });
});

export default router;
