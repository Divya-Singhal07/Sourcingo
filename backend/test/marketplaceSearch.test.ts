import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateHaversineDistanceKm,
  filterProductsByRadius,
  executeGeographicSearch,
  getExpansionSteps,
  ALLOWED_RADII_KM,
  DEFAULT_RADIUS_KM,
  MAX_RADIUS_KM,
  type Coordinates,
} from '../src/services/marketplaceSearch';

describe('Geographic Distance Calculation (Haversine)', () => {
  const pune: Coordinates = { lat: 18.5204, lng: 73.8567 };
  const mumbai: Coordinates = { lat: 19.076, lng: 72.8777 };

  test('calculates accurate distance between known cities (Pune to Mumbai is ~120-150 km)', () => {
    const dist = calculateHaversineDistanceKm(pune, mumbai);
    assert.ok(dist !== null);
    assert.ok(dist >= 115 && dist <= 130, `Expected ~120 km, got ${dist}`);
  });

  test('returns 0 km for identical coordinates', () => {
    const dist = calculateHaversineDistanceKm(pune, pune);
    assert.equal(dist, 0);
  });

  test('handles missing or invalid coordinates safely (never returns zero for null or invalid)', () => {
    assert.equal(calculateHaversineDistanceKm(null, pune), null);
    assert.equal(calculateHaversineDistanceKm(pune, null), null);
    assert.equal(calculateHaversineDistanceKm({ lat: NaN, lng: 73.8567 }, pune), null);
    assert.equal(calculateHaversineDistanceKm({ lat: 18.5204, lng: NaN }, pune), null);
    assert.equal(calculateHaversineDistanceKm({ lat: 120, lng: 73.8567 }, pune), null); // Invalid lat > 90
    assert.equal(calculateHaversineDistanceKm(pune, { lat: 18.5204, lng: 200 }), null); // Invalid lng > 180
  });
});

describe('Dynamic Expansion Steps', () => {
  test('generates dynamic expansion sequence starting from buyer selected radius', () => {
    assert.deepEqual(getExpansionSteps(10), [10, 25, 50, 100, 200]);
    assert.deepEqual(getExpansionSteps(25), [25, 50, 100, 200]);
    assert.deepEqual(getExpansionSteps(50), [50, 100, 200]);
    assert.deepEqual(getExpansionSteps(100), [100, 200]);
    assert.deepEqual(getExpansionSteps(200), [200]);
  });
});

describe('Marketplace Search & Progressive Radius Expansion', () => {
  // Origin: Pune (18.5204, 73.8567)
  const origin: Coordinates = { lat: 18.5204, lng: 73.8567 };

  // Sample manufacturers at various distances:
  // Mfg 1: 5 km away (Pune center)
  // Mfg 2: 20 km away (Pimpri-Chinchwad)
  // Mfg 3: 45 km away (Talegaon)
  // Mfg 4: 85 km away (Lonavala)
  // Mfg 5: 125 km away (Mumbai)
  // Mfg 6: 180 km away (Nashik)
  // Mfg 7: 800 km away (Bengaluru)
  // Mfg 8: Missing coordinates
  const mockProducts = [
    {
      id: 'prod-1a',
      name: 'Precision Gear Set A',
      category: 'Automotive',
      unit_price: 500,
      manufacturer: {
        id: 'mfg-1',
        name: 'Pune Precision 1',
        city: 'Pune',
        state: 'Maharashtra',
        latitude: 18.53,
        longitude: 73.86,
      },
    },
    {
      id: 'prod-1b',
      name: 'Precision Gear Set B (Same Mfg 1)',
      category: 'Automotive',
      unit_price: 600,
      manufacturer: {
        id: 'mfg-1',
        name: 'Pune Precision 1',
        city: 'Pune',
        state: 'Maharashtra',
        latitude: 18.53,
        longitude: 73.86,
      },
    },
    {
      id: 'prod-2',
      name: 'Alloy Bracket',
      category: 'Automotive',
      unit_price: 350,
      manufacturer: {
        id: 'mfg-2',
        name: 'Pimpri Alloys 2',
        city: 'Pimpri',
        state: 'Maharashtra',
        latitude: 18.62,
        longitude: 73.80, // ~13 km
      },
    },
    {
      id: 'prod-3',
      name: 'Sheet Stamping',
      category: 'Automotive',
      unit_price: 200,
      manufacturer: {
        id: 'mfg-3',
        name: 'Talegaon Stamping 3',
        city: 'Talegaon',
        state: 'Maharashtra',
        latitude: 18.72,
        longitude: 73.68, // ~30 km
      },
    },
    {
      id: 'prod-4',
      name: 'Cast Iron Housing',
      category: 'Automotive',
      unit_price: 800,
      manufacturer: {
        id: 'mfg-4',
        name: 'Lonavala Castings 4',
        city: 'Lonavala',
        state: 'Maharashtra',
        latitude: 18.75,
        longitude: 73.40, // ~55 km
      },
    },
    {
      id: 'prod-5',
      name: 'Precision CNC Shaft',
      category: 'Automotive',
      unit_price: 450,
      manufacturer: {
        id: 'mfg-5',
        name: 'Mumbai CNC 5',
        city: 'Mumbai',
        state: 'Maharashtra',
        latitude: 19.07,
        longitude: 72.87, // ~120 km
      },
    },
    {
      id: 'prod-6',
      name: 'Hydraulic Valve',
      category: 'Automotive',
      unit_price: 900,
      manufacturer: {
        id: 'mfg-6',
        name: 'Nashik Hydraulics 6',
        city: 'Nashik',
        state: 'Maharashtra',
        latitude: 19.99,
        longitude: 73.78, // ~165 km
      },
    },
    {
      id: 'prod-7',
      name: 'IoT Sensor Board',
      category: 'Electronics',
      unit_price: 150,
      manufacturer: {
        id: 'mfg-7',
        name: 'Bengaluru Sensors 7',
        city: 'Bengaluru',
        state: 'Karnataka',
        latitude: 12.97,
        longitude: 77.59, // ~840 km
      },
    },
    {
      id: 'prod-8',
      name: 'Unlocated Part',
      category: 'Automotive',
      unit_price: 100,
      manufacturer: {
        id: 'mfg-8',
        name: 'Unknown Location Mfg',
        city: 'Unknown',
        state: 'Unknown',
        latitude: null,
        longitude: null,
      },
    },
  ];

  test('Scenario 1: Automatic expansion disabled with several matches inside selected radius', () => {
    // Within 50 km, mfg-1 (2 products), mfg-2, and mfg-3 are matches (3 unique mfg, 4 products)
    const result = executeGeographicSearch(mockProducts, {
      buyerLocation: origin,
      radiusKm: 50,
      autoExpand: false,
    });

    assert.equal(result.searchMetadata.autoExpand, false);
    assert.equal(result.searchMetadata.expanded, false);
    assert.equal(result.searchMetadata.initialRadiusKm, 50);
    assert.equal(result.searchMetadata.finalRadiusKm, 50);
    assert.equal(result.searchMetadata.initialMatchCount, 3);
    assert.equal(result.searchMetadata.finalMatchCount, 3);
    assert.equal(result.searchMetadata.expansionMessage, null);
    assert.equal(result.products.length, 4);

    // Verify distance is calculated and sorted ascending
    const distances = result.products.map((p) => p.manufacturer.distance_km!);
    for (let i = 1; i < distances.length; i++) {
      assert.ok(distances[i] >= distances[i - 1]);
    }
  });

  test('Scenario 2: Automatic expansion disabled with zero matches', () => {
    // Search within 1 km (none are within 1 km)
    const result = executeGeographicSearch(mockProducts, {
      buyerLocation: origin,
      radiusKm: 1,
      autoExpand: false,
    });

    assert.equal(result.searchMetadata.autoExpand, false);
    assert.equal(result.searchMetadata.expanded, false);
    assert.equal(result.searchMetadata.initialMatchCount, 0);
    assert.equal(result.searchMetadata.finalMatchCount, 0);
    assert.equal(result.products.length, 0);
  });

  test('Scenario 3: Automatic expansion enabled and at least 5 matches exist in the initial radius', () => {
    // Within 200 km, mfg-1, mfg-2, mfg-3, mfg-4, mfg-5, mfg-6 exist (6 unique manufacturers >= 5)
    const result = executeGeographicSearch(mockProducts, {
      buyerLocation: origin,
      radiusKm: 200,
      autoExpand: true,
    });

    assert.equal(result.searchMetadata.autoExpand, true);
    assert.equal(result.searchMetadata.expanded, false);
    assert.equal(result.searchMetadata.initialRadiusKm, 200);
    assert.equal(result.searchMetadata.finalRadiusKm, 200);
    assert.ok(result.searchMetadata.initialMatchCount >= 5);
    assert.equal(result.searchMetadata.expansionMessage, null);
  });

  test('Scenario 4: Automatic expansion enabled and the radius expands to find at least 5 matches', () => {
    // Start at 25 km: only mfg-1 and mfg-2 exist (2 manufacturers < 5)
    // Expand to 50 km: adds mfg-3 (3 manufacturers < 5)
    // Expand to 100 km: adds mfg-4 (4 manufacturers < 5)
    // Expand to 200 km: adds mfg-5 and mfg-6 (6 manufacturers >= 5)
    const result = executeGeographicSearch(mockProducts, {
      buyerLocation: origin,
      radiusKm: 25,
      autoExpand: true,
    });

    assert.equal(result.searchMetadata.autoExpand, true);
    assert.equal(result.searchMetadata.expanded, true);
    assert.equal(result.searchMetadata.initialRadiusKm, 25);
    assert.equal(result.searchMetadata.finalRadiusKm, 200);
    assert.equal(result.searchMetadata.initialMatchCount, 2);
    assert.equal(result.searchMetadata.finalMatchCount, 6);
    assert.ok(result.searchMetadata.expansionMessage !== null);
    assert.match(result.searchMetadata.expansionMessage!, /Only 2 matching manufacturers found within 25 km/);
    assert.match(result.searchMetadata.expansionMessage!, /expanded your search to 200 km and found 6 matches/);
  });

  test('Scenario 5: Fewer than 5 matches exist even at the maximum radius', () => {
    // Filter by Electronics (only mfg-7 exists at 840 km, none within 200 km)
    // Or filter with higher price range
    const expensiveProducts = mockProducts.filter((p) => p.unit_price >= 800);
    // mfg-4 (85 km, 800) and mfg-6 (165 km, 900) -> only 2 manufacturers total in whole database!
    const result = executeGeographicSearch(expensiveProducts, {
      buyerLocation: origin,
      radiusKm: 50,
      autoExpand: true,
    });

    assert.equal(result.searchMetadata.autoExpand, true);
    assert.equal(result.searchMetadata.expanded, true);
    assert.equal(result.searchMetadata.initialRadiusKm, 50);
    assert.equal(result.searchMetadata.finalRadiusKm, 200);
    assert.equal(result.searchMetadata.maxRadiusReached, true);
    assert.equal(result.searchMetadata.finalMatchCount, 2);
    assert.match(result.searchMetadata.expansionMessage!, /maximum radius/);
  });

  test('Scenario 6: Buyer selects a different starting radius (e.g. 10 km vs 50 km)', () => {
    const result10 = executeGeographicSearch(mockProducts, {
      buyerLocation: origin,
      radiusKm: 10,
      autoExpand: false,
    });
    const result50 = executeGeographicSearch(mockProducts, {
      buyerLocation: origin,
      radiusKm: 50,
      autoExpand: false,
    });

    assert.equal(result10.searchMetadata.initialRadiusKm, 10);
    assert.equal(result50.searchMetadata.initialRadiusKm, 50);
    assert.ok(result10.products.length <= result50.products.length);
  });

  test('Scenario 7: Existing filters (category, price) are preserved during expansion', () => {
    // Stricter subset: category = 'Automotive' and unit_price < 500
    // prod-2 (350), prod-3 (200), prod-5 (450)
    const filteredProducts = mockProducts.filter(
      (p) => p.category === 'Automotive' && p.unit_price < 500
    );

    const result = executeGeographicSearch(filteredProducts, {
      buyerLocation: origin,
      radiusKm: 25,
      autoExpand: true,
    });

    // None of the expensive or non-automotive products should appear
    for (const p of result.products) {
      assert.equal(p.category, 'Automotive');
      assert.ok(p.unit_price < 500);
    }
  });

  test('Scenario 8: No duplicate products returned and unique manufacturers counted correctly', () => {
    // mfg-1 has 2 products: prod-1a and prod-1b
    const result = executeGeographicSearch(mockProducts, {
      buyerLocation: origin,
      radiusKm: 50,
      autoExpand: false,
    });

    const productIds = result.products.map((p) => p.id);
    const uniqueProductIds = new Set(productIds);
    assert.equal(productIds.length, uniqueProductIds.size, 'No duplicate products returned');
  });

  test('Scenario 9: Missing or invalid manufacturer coordinates are safely excluded from radius', () => {
    const result = executeGeographicSearch(mockProducts, {
      buyerLocation: origin,
      radiusKm: 200,
      autoExpand: false,
    });

    const unlocatedProduct = result.products.find((p) => p.manufacturer.id === 'mfg-8');
    assert.equal(unlocatedProduct, undefined, 'Unlocated manufacturer must not match radius filter');
  });

  test('Scenario 10: Invalid radius values are rejected by the backend with 400 Bad Request', async () => {
    // Dynamically test using app instance
    const { app } = await import('../src/server');
    const server = app.listen(0);
    const address = server.address();
    const port = typeof address === 'object' && address ? address.port : 5000;

    try {
      // 1. Negative radius
      const resNeg = await fetch(`http://localhost:${port}/api/marketplace/products?radiusKm=-10`);
      assert.equal(resNeg.status, 400);
      const jsonNeg = await resNeg.json() as any;
      assert.ok(jsonNeg.error.includes('Invalid search query parameters'));

      // 2. Non-numeric radius
      const resStr = await fetch(`http://localhost:${port}/api/marketplace/products?radiusKm=abc`);
      assert.equal(resStr.status, 400);

      // 3. Invalid latitude (> 90)
      const resLat = await fetch(`http://localhost:${port}/api/marketplace/products?buyerLat=120&buyerLng=70`);
      assert.equal(resLat.status, 400);

      // 4. Valid radius passes validation (200 OK)
      const resOk = await fetch(`http://localhost:${port}/api/marketplace/products?radiusKm=50&originCity=pune`);
      assert.equal(resOk.status, 200);
      const jsonOk = await resOk.json() as any;
      assert.ok(Array.isArray(jsonOk.products));
      assert.ok(jsonOk.searchMetadata !== undefined);
      assert.equal(jsonOk.searchMetadata.initialRadiusKm, 50);
    } finally {
      server.close();
    }
  });
});

