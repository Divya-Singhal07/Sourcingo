
import { Router } from "express";
import { z } from "zod";
import { createUserClient } from "../lib/supabase";
import {
  requireAuth,
  type AuthRequest,
} from "../middleware/auth";

const router = Router();

router.use(requireAuth);

// GET /api/profile/me
// Fetch the logged-in user's profile and business details.
router.get("/me", async (req, res) => {
  const authReq = req as AuthRequest;
  const db = createUserClient(authReq.accessToken!);

  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("id, email, role, created_at, updated_at")
    .eq("id", authReq.userId!)
    .single();

  if (profileError) {
    return res.status(500).json({
      error: "Could not fetch profile",
      details: profileError.message,
    });
  }

  const { data: business, error: businessError } = await db
    .from("businesses")
    .select("*")
    .eq("owner_id", authReq.userId!)
    .maybeSingle();

  if (businessError) {
    return res.status(500).json({
      error: "Could not fetch business",
      details: businessError.message,
    });
  }

  if (!business) {
    return res.json({
      profile,
      business: null,
      businessDetails: null,
    });
  }

  // Fetch details from the correct role-specific table.
  let businessDetails: unknown = null;

  if (profile.role === "buyer") {
    const { data, error } = await db
      .from("buyers")
      .select("*")
      .eq("business_id", business.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        error: "Could not fetch buyer details",
        details: error.message,
      });
    }

    businessDetails = data;
  } else if (profile.role === "manufacturer") {
    const { data, error } = await db
      .from("manufacturers")
      .select("*")
      .eq("business_id", business.id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        error: "Could not fetch manufacturer details",
        details: error.message,
      });
    }

    businessDetails = data;
  }

  return res.json({ profile, business, businessDetails });
});

// Validation for business registration.
const businessSchema = z.object({
  name: z.string().trim().min(2).max(150),
  city: z.string().trim().min(1),
  state: z.string().trim().min(1),

  legal_name: z.string().trim().optional(),
  description: z.string().max(3000).optional(),
  industry: z.string().trim().optional(),
  year_established: z.number().int().min(1800).max(2100).optional(),
  annual_turnover: z.string().optional(),
  employee_count: z.string().optional(),
  factory_area_sq_ft: z.number().int().nonnegative().optional(),
  serviceable_regions: z.array(z.string()).optional(),

  // Buyer-specific fields
  contact_name: z.string().trim().min(2).optional(),
  preferred_categories: z.array(z.string()).optional(),
  preferred_reach: z
    .enum(["city", "state", "selected-states", "pan-india"])
    .optional(),

  // Manufacturer-specific fields
  owner_name: z.string().trim().min(2).optional(),
  locations: z.array(z.string()).optional(),
  monthly_quota: z.number().int().nonnegative().optional(),
  average_delivery_days: z.number().int().nonnegative().optional(),
});

// POST /api/profile/business
// Register a business for the logged-in user.
router.post("/business", async (req, res) => {
  const parsed = businessSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid business details",
      details: parsed.error.flatten(),
    });
  }

  const authReq = req as AuthRequest;
  const db = createUserClient(authReq.accessToken!);
  const input = parsed.data;
  const role = authReq.userRole!;

  if (role === "buyer" && !input.contact_name) {
    return res.status(400).json({
      error: "contact_name is required for buyers",
    });
  }

  if (role === "manufacturer" && !input.owner_name) {
    return res.status(400).json({
      error: "owner_name is required for manufacturers",
    });
  }

  // Check whether the account already owns a business.
  const { data: existing, error: existingError } = await db
    .from("businesses")
    .select("id")
    .eq("owner_id", authReq.userId!)
    .maybeSingle();

  if (existingError) {
    return res.status(500).json({
      error: "Could not check existing business",
      details: existingError.message,
    });
  }

  if (existing) {
    return res.status(409).json({
      error: "A business is already registered for this account",
    });
  }

  // Create the main business record.
  const { data: business, error: businessError } = await db
    .from("businesses")
    .insert({
      owner_id: authReq.userId!,
      role,
      name: input.name,
      city: input.city,
      state: input.state,
      legal_name: input.legal_name,
      description: input.description,
      industry: input.industry,
      year_established: input.year_established,
      annual_turnover: input.annual_turnover,
      employee_count: input.employee_count,
      factory_area_sq_ft: input.factory_area_sq_ft,
      serviceable_regions: input.serviceable_regions ?? [],
    })
    .select()
    .single();

  if (businessError) {
    return res.status(400).json({
      error: "Could not create business",
      details: businessError.message,
    });
  }

  // Create role-specific details.
  // Separate calls ensure TypeScript infers each table correctly.
  let detailError: { message: string } | null = null;

  if (role === "buyer") {
    const { error } = await db.from("buyers").insert({
      business_id: business.id,
      contact_name: input.contact_name!,
      preferred_categories: input.preferred_categories ?? [],
      preferred_reach: input.preferred_reach ?? "state",
    });

    detailError = error;
  } else {
    const { error } = await db.from("manufacturers").insert({
      business_id: business.id,
      owner_name: input.owner_name!,
      locations: input.locations ?? [],
      monthly_quota: input.monthly_quota ?? null,
      average_delivery_days: input.average_delivery_days ?? null,
    });

    detailError = error;
  }

  if (detailError) {
    // Best-effort cleanup; RLS must permit this deletion.
    const { error: cleanupError } = await db
      .from("businesses")
      .delete()
      .eq("id", business.id);

    return res.status(400).json({
      error: "Business was created, but role-specific details failed",
      details: detailError.message,
      cleanupFailed: Boolean(cleanupError),
    });
  }

  return res.status(201).json({
    message: "Business registered successfully",
    business,
  });
});

// PATCH /api/profile/business
// Update editable business fields.
const updateBusinessSchema = z.object({
  name: z.string().trim().min(2).max(150).optional(),
  legal_name: z.string().trim().optional(),
  logo_url: z.string().url().optional(),
  city: z.string().trim().min(1).optional(),
  state: z.string().trim().min(1).optional(),
  country: z.string().trim().optional(),
  registered_address: z.string().trim().optional(),
  industry: z.string().trim().optional(),
  description: z.string().max(3000).optional(),
  year_established: z.number().int().min(1800).max(2100).optional(),
  annual_turnover: z.string().optional(),
  employee_count: z.string().optional(),
  factory_area_sq_ft: z.number().int().nonnegative().optional(),
  serviceable_regions: z.array(z.string()).optional(),
});

router.patch("/business", async (req, res) => {
  const parsed = updateBusinessSchema.safeParse(req.body);

  if (
    !parsed.success ||
    Object.keys(parsed.data ?? {}).length === 0
  ) {
    return res.status(400).json({
      error: "Invalid business update",
      details: parsed.success ? undefined : parsed.error.flatten(),
    });
  }

  const authReq = req as AuthRequest;
  const db = createUserClient(authReq.accessToken!);

  const { data: business, error } = await db
    .from("businesses")
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("owner_id", authReq.userId!)
    .eq("role", authReq.userRole!)
    .select()
    .maybeSingle();

  if (error) {
    return res.status(400).json({
      error: "Could not update business",
      details: error.message,
    });
  }

  if (!business) {
    return res.status(404).json({
      error: "Business not found",
    });
  }

  return res.json({
    message: "Business updated successfully",
    business,
  });
});

export default router;
