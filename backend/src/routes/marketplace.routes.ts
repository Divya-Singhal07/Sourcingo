
import { Router } from "express";
import { z } from "zod";
import {
  createUserClient,
  supabasePublic,
} from "../lib/supabase";
import {
  requireAuth,
  allowRoles,
  type AuthRequest,
} from "../middleware/auth";
import {
  executeGeographicSearch,
  calculateHaversineDistanceKm,
  type Coordinates,
} from "../services/marketplaceSearch";

import { SYNTHETIC_PRODUCTS } from "../services/catalogData";

const router = Router();

const searchQueryParamsSchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  originCity: z.string().optional(),
  buyerLat: z.coerce.number().min(-90).max(90).optional(),
  buyerLng: z.coerce.number().min(-180).max(180).optional(),
  radiusKm: z.coerce.number().positive().max(1000).optional(),
  autoExpand: z
    .union([z.boolean(), z.enum(["true", "false", "1", "0"])])
    .transform((val) => val === true || val === "true" || val === "1")
    .optional(),
});

const KNOWN_CITY_COORDINATES: Record<string, Coordinates> = {
  pune: { lat: 18.5204, lng: 73.8567 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  "new delhi": { lat: 28.6139, lng: 77.209 },
  gurugram: { lat: 28.4595, lng: 77.0266 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
};

// Browse active products with geographic distance filtering & progressive auto-expansion
router.get("/products", async (req, res) => {
  const parsed = searchQueryParamsSchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid search query parameters",
      details: parsed.error.flatten(),
    });
  }

  const {
    category,
    minPrice,
    maxPrice,
    city,
    state,
    originCity,
    buyerLat,
    buyerLng,
    radiusKm,
    autoExpand,
  } = parsed.data;

  // Resolve buyer search origin coordinates if provided
  let buyerLocation: Coordinates | null = null;
  if (typeof buyerLat === "number" && typeof buyerLng === "number") {
    buyerLocation = { lat: buyerLat, lng: buyerLng };
  } else if (originCity) {
    const key = originCity.trim().toLowerCase();
    if (KNOWN_CITY_COORDINATES[key]) {
      buyerLocation = KNOWN_CITY_COORDINATES[key];
    }
  }

  let query = supabasePublic
    .from("products")
    .select(`
      id, name, category, image_url, gallery_urls,
      material, specifications, unit_price, price_unit,
      moq, lead_time_days, certifications,
      sample_available, value_label, value_proposition,
      manufacturer:businesses!products_manufacturer_id_fkey(
        id, name, city, state, industry, rating, rating_count, latitude, longitude
      )
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(100);

  if (category && category !== "All Sectors") {
    query = query.ilike("category", `%${category}%`);
  }
  if (typeof minPrice === "number") {
    query = query.gte("unit_price", minPrice);
  }
  if (typeof maxPrice === "number") {
    query = query.lte("unit_price", maxPrice);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // 1. Normalize business coordinates using authoritative known city coordinates
  const dbProducts = (data ?? []).map((product: any) => {
    const mfg = product.manufacturer;
    if (mfg?.city) {
      const cityKey = mfg.city.trim().toLowerCase();
      if (KNOWN_CITY_COORDINATES[cityKey]) {
        mfg.latitude = KNOWN_CITY_COORDINATES[cityKey].lat;
        mfg.longitude = KNOWN_CITY_COORDINATES[cityKey].lng;
      }
    }
    return product;
  });

  // 2. Combine with synthetic products catalog to guarantee rich card deck options (at least 4+ cards)
  const combined = [...dbProducts];
  for (const syn of SYNTHETIC_PRODUCTS) {
    if (!combined.some((p) => p.name.toLowerCase() === syn.name.toLowerCase())) {
      combined.push(syn);
    }
  }

  // 3. Filter by manufacturer location / price / category
  const filtered = combined.filter((product: any) => {
    const manufacturer = product.manufacturer;

    if (category && category !== "All Sectors" && !product.category.toLowerCase().includes(category.toLowerCase())) {
      return false;
    }

    if (typeof minPrice === "number" && product.unit_price < minPrice) {
      return false;
    }

    if (typeof maxPrice === "number" && product.unit_price > maxPrice) {
      return false;
    }

    if (city && manufacturer?.city?.toLowerCase() !== city.toLowerCase()) {
      return false;
    }

    if (state && manufacturer?.state?.toLowerCase() !== state.toLowerCase()) {
      return false;
    }

    return true;
  });

  const searchResult = executeGeographicSearch(filtered, {
    buyerLocation,
    radiusKm,
    autoExpand,
    category,
    minPrice,
    maxPrice,
    city,
    state,
  });

  return res.json({
    products: searchResult.products,
    searchMetadata: searchResult.searchMetadata,
  });
});

const productSchema = z.object({
  name: z.string().trim().min(2).max(150),
  category: z.string().trim().min(1),
  unit_price: z.number().nonnegative(),
  lead_time_days: z.number().int().nonnegative(),
  price_unit: z.string().optional(),
  image_url: z.string().url().optional(),
  gallery_urls: z.array(z.string().url()).optional(),
  material: z.string().optional(),
  specifications: z.record(z.string(), z.unknown()).optional(),
  moq: z.number().int().positive().optional(),
  monthly_capacity: z.number().int().nonnegative().optional(),
  remaining_monthly_capacity: z.number().int().nonnegative().optional(),
  certifications: z.array(z.string()).optional(),
  delivery_terms: z.string().optional(),
  sample_available: z.boolean().optional(),
  sample_price_inr: z.number().nonnegative().optional(),
  value_label: z.string().optional(),
  value_proposition: z.string().optional(),
  value_explanation: z.string().optional(),
});

router.post(
  "/products",
  requireAuth,
  allowRoles("manufacturer"),
  async (req, res) => {
    const parsed = productSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid product details",
        details: parsed.error.flatten(),
      });
    }

    const authReq = req as AuthRequest;
    const db = createUserClient(authReq.accessToken!);

    const { data: business, error: businessError } = await db
      .from("businesses")
      .select("id")
      .eq("owner_id", authReq.userId!)
      .eq("role", "manufacturer")
      .maybeSingle();

    if (businessError) {
      return res.status(500).json({ error: businessError.message });
    }

    if (!business) {
      return res.status(400).json({
        error: "Register your manufacturer business first",
      });
    }

    const { data: product, error } = await db
      .from("products")
      .insert({
        ...parsed.data,
        manufacturer_id: business.id,
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ product });
  }
);

// Save a like/pass. Mutual likes create a match.
const swipeSchema = z.object({
  target_business_id: z.string().uuid(),
  action: z.enum(["like", "pass"]),
});

router.post("/swipes", requireAuth, async (req, res) => {
  const parsed = swipeSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid swipe details",
      details: parsed.error.flatten(),
    });
  }

  const authReq = req as AuthRequest;
  const db = createUserClient(authReq.accessToken!);

  const { data: source, error: sourceError } = await db
    .from("businesses")
    .select("id, role")
    .eq("owner_id", authReq.userId!)
    .maybeSingle();

  if (sourceError) {
    return res.status(500).json({ error: sourceError.message });
  }

  if (!source) {
    return res.status(400).json({ error: "Register your business first" });
  }

  if (source.id === parsed.data.target_business_id) {
    return res.status(400).json({ error: "Cannot swipe on your own business" });
  }

  const { data: target, error: targetError } = await db
    .from("businesses")
    .select("id, role")
    .eq("id", parsed.data.target_business_id)
    .maybeSingle();

  if (targetError || !target) {
    return res.status(404).json({ error: "Target business not found" });
  }

  if (source.role === target.role) {
    return res.status(400).json({
      error: "You can only discover businesses of the opposite role",
    });
  }

  const { error: swipeError } = await db
    .from("swipes")
    .upsert(
      {
        swiped_by: source.id,
        target_business_id: target.id,
        action: parsed.data.action,
      },
      { onConflict: "swiped_by,target_business_id" }
    );

  if (swipeError) {
    return res.status(400).json({ error: swipeError.message });
  }

  if (parsed.data.action !== "like") {
    return res.json({ matched: false });
  }

  const { data: reciprocal, error: reciprocalError } = await db
    .from("swipes")
    .select("id")
    .eq("swiped_by", target.id)
    .eq("target_business_id", source.id)
    .eq("action", "like")
    .maybeSingle();

  if (reciprocalError) {
    return res.status(500).json({ error: reciprocalError.message });
  }

  if (!reciprocal) {
    return res.json({ matched: false });
  }

  const buyerId = source.role === "buyer" ? source.id : target.id;
  const manufacturerId =
    source.role === "manufacturer" ? source.id : target.id;

  const { data: match, error: matchError } = await db
    .from("matches")
    .upsert(
      {
        buyer_business_id: buyerId,
        manufacturer_business_id: manufacturerId,
      },
      { onConflict: "buyer_business_id,manufacturer_business_id" }
    )
    .select()
    .single();

  if (matchError) {
    return res.status(400).json({
      error: "Mutual like found, but match creation failed",
      details: matchError.message,
    });
  }

  return res.json({ matched: true, match });
});

router.get("/matches", requireAuth, async (req, res) => {
  const authReq = req as AuthRequest;
  const db = createUserClient(authReq.accessToken!);

  const { data: business, error: businessError } = await db
    .from("businesses")
    .select("id")
    .eq("owner_id", authReq.userId!)
    .maybeSingle();

  if (businessError) {
    return res.status(500).json({ error: businessError.message });
  }

  if (!business) {
    return res.json({ matches: [] });
  }

  const column =
    authReq.userRole === "buyer"
      ? "buyer_business_id"
      : "manufacturer_business_id";

  const { data, error } = await db
    .from("matches")
    .select("*")
    .eq(column, business.id)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.json({ matches: data ?? [] });
});

export default router;
