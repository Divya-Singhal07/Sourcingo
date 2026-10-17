
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

  return res.status(201).json({
    message: data.session
      ? "Account created"
      : "Account created. Check your email if confirmation is required.",
    user: data.user
      ? { id: data.user.id, email: data.user.email }
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

  const { data: profile, error: profileError } = await supabasePublic
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return res.status(403).json({
      error: "Account profile is missing. Contact support.",
    });
  }

  return res.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      role: profile.role,
    },
    session: data.session,
  });
});

export default router;
