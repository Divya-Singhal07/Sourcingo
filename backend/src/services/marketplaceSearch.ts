export interface Coordinates {
  lat: number;
  lng: number;
}

export interface SearchFilters {
  buyerLocation?: Coordinates | null;
  radiusKm?: number;
  autoExpand?: boolean;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  state?: string;
}

export interface SearchMetadata {
  origin: Coordinates | null;
  initialRadiusKm: number | null;
  finalRadiusKm: number | null;
  autoExpand: boolean;
  expanded: boolean;
  initialMatchCount: number;
  finalMatchCount: number;
  maxRadiusReached: boolean;
  expansionMessage: string | null;
}

export interface SearchResultProduct {
  id: string;
  name: string;
  category: string;
  image_url: string;
  gallery_urls?: string[];
  material?: string;
  unit_price: number;
  price_unit?: string;
  moq: number;
  lead_time_days: number;
  certifications: string[];
  sample_available?: boolean;
  value_label?: string;
  value_proposition?: string;
  manufacturer: {
    id: string;
    name: string;
    city: string;
    state: string;
    industry: string;
    rating: number;
    rating_count: number;
    latitude?: number | null;
    longitude?: number | null;
    distance_km?: number | null;
  };
}

export interface SearchResponse {
  products: SearchResultProduct[];
  searchMetadata: SearchMetadata;
}

export const ALLOWED_RADII_KM = [10, 25, 50, 100, 200, 500, 1000, 2000] as const;
export const DEFAULT_RADIUS_KM = 50;
export const MAX_RADIUS_KM = 2000;
export const TARGET_MIN_MANUFACTURERS = 5;

/**
 * Calculates great-circle distance between two geographic coordinates using Haversine formula in kilometers.
 * Returns null if either coordinate is invalid or null.
 */
export function calculateHaversineDistanceKm(
  coord1: Coordinates | null | undefined,
  coord2: Coordinates | null | undefined
): number | null {
  if (
    !coord1 ||
    !coord2 ||
    typeof coord1.lat !== 'number' ||
    typeof coord1.lng !== 'number' ||
    typeof coord2.lat !== 'number' ||
    typeof coord2.lng !== 'number' ||
    isNaN(coord1.lat) ||
    isNaN(coord1.lng) ||
    isNaN(coord2.lat) ||
    isNaN(coord2.lng)
  ) {
    return null;
  }

  // Validate latitude and longitude ranges
  if (
    coord1.lat < -90 ||
    coord1.lat > 90 ||
    coord2.lat < -90 ||
    coord2.lat > 90 ||
    coord1.lng < -180 ||
    coord1.lng > 180 ||
    coord2.lng < -180 ||
    coord2.lng > 180
  ) {
    return null;
  }

  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(coord2.lat - coord1.lat);
  const dLng = toRad(coord2.lng - coord1.lng);

  const lat1Rad = toRad(coord1.lat);
  const lat2Rad = toRad(coord2.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusKm * c;

  return Math.round(distance * 10) / 10;
}

/**
 * Generates progressive expansion sequence dynamically from the starting radius up to MAX_RADIUS_KM.
 */
export function getExpansionSteps(initialRadius: number): number[] {
  const steps = ALLOWED_RADII_KM.filter((r) => r >= initialRadius);
  if (steps.length === 0) return [initialRadius];
  if (steps[0] !== initialRadius) {
    return [initialRadius, ...steps];
  }
  return steps;
}

/**
 * Filters a list of products with manufacturers by radius and counts unique matching manufacturers.
 */
export function filterProductsByRadius(
  products: any[],
  buyerLocation: Coordinates,
  maxDistanceKm: number
): { matchedProducts: SearchResultProduct[]; uniqueManufacturerCount: number } {
  const matchedProducts: SearchResultProduct[] = [];
  const uniqueMfgIds = new Set<string>();

  for (const rawProduct of products) {
    const mfg = rawProduct.manufacturer;
    if (!mfg) continue;

    const mfgCoords: Coordinates | null =
      typeof mfg.latitude === 'number' && typeof mfg.longitude === 'number'
        ? { lat: mfg.latitude, lng: mfg.longitude }
        : null;

    const distance = calculateHaversineDistanceKm(buyerLocation, mfgCoords);

    // If manufacturer has no valid coordinates, it cannot satisfy a geographic radius filter
    if (distance === null || distance > maxDistanceKm) {
      continue;
    }

    uniqueMfgIds.add(mfg.id);

    matchedProducts.push({
      id: rawProduct.id,
      name: rawProduct.name,
      category: rawProduct.category,
      image_url: rawProduct.image_url,
      gallery_urls: rawProduct.gallery_urls,
      material: rawProduct.material,
      unit_price: rawProduct.unit_price,
      price_unit: rawProduct.price_unit,
      moq: rawProduct.moq,
      lead_time_days: rawProduct.lead_time_days,
      certifications: rawProduct.certifications || [],
      sample_available: rawProduct.sample_available,
      value_label: rawProduct.value_label,
      value_proposition: rawProduct.value_proposition,
      manufacturer: {
        id: mfg.id,
        name: mfg.name,
        city: mfg.city,
        state: mfg.state,
        industry: mfg.industry,
        rating: mfg.rating || 0,
        rating_count: mfg.rating_count || 0,
        latitude: mfg.latitude ?? null,
        longitude: mfg.longitude ?? null,
        distance_km: distance,
      },
    });
  }

  // Sort matched products by distance ascending, then by rating descending
  matchedProducts.sort((a, b) => {
    const distA = a.manufacturer.distance_km ?? Number.MAX_SAFE_INTEGER;
    const distB = b.manufacturer.distance_km ?? Number.MAX_SAFE_INTEGER;
    if (distA !== distB) return distA - distB;
    return b.manufacturer.rating - a.manufacturer.rating;
  });

  return {
    matchedProducts,
    uniqueManufacturerCount: uniqueMfgIds.size,
  };
}

/**
 * Executes marketplace search with geographic radius filtering and progressive automatic expansion.
 */
export function executeGeographicSearch(
  rawProducts: any[],
  filters: SearchFilters
): SearchResponse {
  const buyerLocation = filters.buyerLocation;
  const initialRadius = filters.radiusKm ?? DEFAULT_RADIUS_KM;
  const autoExpand = Boolean(filters.autoExpand);

  // If no buyer location is provided, return all eligible products with distance_km = null
  if (!buyerLocation) {
    const mapped: SearchResultProduct[] = rawProducts.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      image_url: p.image_url,
      gallery_urls: p.gallery_urls,
      material: p.material,
      unit_price: p.unit_price,
      price_unit: p.price_unit,
      moq: p.moq,
      lead_time_days: p.lead_time_days,
      certifications: p.certifications || [],
      sample_available: p.sample_available,
      value_label: p.value_label,
      value_proposition: p.value_proposition,
      manufacturer: {
        id: p.manufacturer?.id || '',
        name: p.manufacturer?.name || 'Verified Manufacturer',
        city: p.manufacturer?.city || '',
        state: p.manufacturer?.state || '',
        industry: p.manufacturer?.industry || '',
        rating: p.manufacturer?.rating || 0,
        rating_count: p.manufacturer?.rating_count || 0,
        latitude: p.manufacturer?.latitude ?? null,
        longitude: p.manufacturer?.longitude ?? null,
        distance_km: null,
      },
    }));

    return {
      products: mapped,
      searchMetadata: {
        origin: null,
        initialRadiusKm: null,
        finalRadiusKm: null,
        autoExpand: false,
        expanded: false,
        initialMatchCount: mapped.length,
        finalMatchCount: mapped.length,
        maxRadiusReached: false,
        expansionMessage: null,
      },
    };
  }

  // 1. Initial search within the buyer's selected radius
  const initialResult = filterProductsByRadius(rawProducts, buyerLocation, initialRadius);
  const initialMatchCount = initialResult.uniqueManufacturerCount;

  // 2. If auto-expansion is OFF, strictly return the initial search result
  if (!autoExpand) {
    return {
      products: initialResult.matchedProducts,
      searchMetadata: {
        origin: buyerLocation,
        initialRadiusKm: initialRadius,
        finalRadiusKm: initialRadius,
        autoExpand: false,
        expanded: false,
        initialMatchCount,
        finalMatchCount: initialMatchCount,
        maxRadiusReached: false,
        expansionMessage: null,
      },
    };
  }

  // 3. If auto-expansion is ON and initial count is already >= TARGET_MIN_MANUFACTURERS
  if (initialMatchCount >= TARGET_MIN_MANUFACTURERS) {
    return {
      products: initialResult.matchedProducts,
      searchMetadata: {
        origin: buyerLocation,
        initialRadiusKm: initialRadius,
        finalRadiusKm: initialRadius,
        autoExpand: true,
        expanded: false,
        initialMatchCount,
        finalMatchCount: initialMatchCount,
        maxRadiusReached: false,
        expansionMessage: null,
      },
    };
  }

  // 4. Progressively expand the radius dynamically
  const expansionSteps = getExpansionSteps(initialRadius);
  let currentProducts = initialResult.matchedProducts;
  let currentManufacturerCount = initialMatchCount;
  let finalRadius = initialRadius;
  let maxRadiusReached = false;

  for (const stepRadius of expansionSteps) {
    if (stepRadius <= initialRadius) continue;

    finalRadius = stepRadius;
    const stepResult = filterProductsByRadius(rawProducts, buyerLocation, stepRadius);
    currentProducts = stepResult.matchedProducts;
    currentManufacturerCount = stepResult.uniqueManufacturerCount;

    if (currentManufacturerCount >= TARGET_MIN_MANUFACTURERS) {
      break;
    }
  }

  if (finalRadius >= MAX_RADIUS_KM) {
    maxRadiusReached = true;
  }

  // Ensure buyer always has at least 4 cards in the stack if catalog has products
  if (currentProducts.length < 4 && rawProducts.length >= 4) {
    const existingIds = new Set(currentProducts.map((p) => p.id));
    const additional = rawProducts
      .filter((p) => !existingIds.has(p.id))
      .map((p) => {
        const mfg = p.manufacturer || {};
        const mfgCoords =
          typeof mfg.latitude === 'number' && typeof mfg.longitude === 'number'
            ? { lat: mfg.latitude, lng: mfg.longitude }
            : null;
        const distance = calculateHaversineDistanceKm(buyerLocation, mfgCoords);
        return {
          id: p.id,
          name: p.name,
          category: p.category,
          image_url: p.image_url,
          gallery_urls: p.gallery_urls,
          material: p.material,
          unit_price: p.unit_price,
          price_unit: p.price_unit,
          moq: p.moq,
          lead_time_days: p.lead_time_days,
          certifications: p.certifications || [],
          sample_available: p.sample_available,
          value_label: p.value_label,
          value_proposition: p.value_proposition,
          manufacturer: {
            id: mfg.id || '',
            name: mfg.name || 'Verified Manufacturer',
            city: mfg.city || '',
            state: mfg.state || '',
            industry: mfg.industry || '',
            rating: mfg.rating || 0,
            rating_count: mfg.rating_count || 0,
            latitude: mfg.latitude ?? null,
            longitude: mfg.longitude ?? null,
            distance_km: distance,
          },
        };
      })
      .sort((a, b) => (a.manufacturer.distance_km ?? 9999) - (b.manufacturer.distance_km ?? 9999));

    const needed = Math.min(10 - currentProducts.length, additional.length);
    currentProducts = [...currentProducts, ...additional.slice(0, needed)];
    currentManufacturerCount = new Set(currentProducts.map((p) => p.manufacturer.id)).size;
  }

  const expanded = finalRadius > initialRadius;
  let expansionMessage: string | null = null;

  if (expanded) {
    if (currentManufacturerCount === 0) {
      expansionMessage = `No matching manufacturers found within ${initialRadius} km or expanded radius up to ${finalRadius} km.`;
    } else if (maxRadiusReached && currentManufacturerCount < TARGET_MIN_MANUFACTURERS) {
      expansionMessage = `Only ${initialMatchCount} matching manufacturer${initialMatchCount === 1 ? '' : 's'} found within ${initialRadius} km. We expanded your search to ${finalRadius} km (maximum radius) and found ${currentManufacturerCount} match${currentManufacturerCount === 1 ? '' : 'es'}.`;
    } else {
      expansionMessage = `Only ${initialMatchCount} matching manufacturer${initialMatchCount === 1 ? '' : 's'} found within ${initialRadius} km. We expanded your search to ${finalRadius} km and found ${currentManufacturerCount} matches.`;
    }
  }

  return {
    products: currentProducts,
    searchMetadata: {
      origin: buyerLocation,
      initialRadiusKm: initialRadius,
      finalRadiusKm: finalRadius,
      autoExpand: true,
      expanded,
      initialMatchCount,
      finalMatchCount: currentManufacturerCount,
      maxRadiusReached,
      expansionMessage,
    },
  };
}
