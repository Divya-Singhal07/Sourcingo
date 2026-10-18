-- =============================================================================
-- SOURCINGO — SYNTHETIC DATA SEED
-- Run this in the Supabase SQL editor (https://supabase.com/dashboard)
-- Bypasses RLS so no auth token needed.
-- Safe to re-run: uses ON CONFLICT DO NOTHING on fixed UUIDs.
-- =============================================================================
-- Owner account for all synthetic businesses:
--   divya.test.buyer@gmail.com  (id = 09c836ed-0e11-49e0-b629-2bcd16cc4651)
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. CLEAN UP EXISTING DEMO DATA (only demo_data_notice = true rows)
-- ─────────────────────────────────────────────────────────────────────────────
DELETE FROM public.products
WHERE manufacturer_id IN (
  SELECT id FROM public.businesses WHERE demo_data_notice = true
);
DELETE FROM public.businesses WHERE demo_data_notice = true;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. MANUFACTURER BUSINESSES
-- 20 manufacturers spread across Indian cities at different distances from
-- common buyer search origins (Pune, Mumbai, Bengaluru, Delhi, Chennai etc.)
-- Each covers a distinct geographic scenario for the radius filter tests.
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.businesses
  (id, owner_id, role, name, legal_name, logo_url,
   city, state, country, industry, description,
   year_established, annual_turnover, employee_count, factory_area_sq_ft,
   rating, rating_count, latitude, longitude, demo_data_notice)
VALUES

-- ── PUNE CLUSTER (within 10 km of Pune centre 18.5204 / 73.8567) ─────────────
(
  'e1000000-0000-0000-0000-000000000001',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Panchsheel Auto Parts',
  'Panchsheel Auto Parts Pvt. Ltd.',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'Pune', 'Maharashtra', 'India',
  'Automotive & Precision',
  'Precision turned components and CNC machined auto parts for OEM supply chains. TS 16949 certified plant.',
  2003, '₹12–25 Cr', '51–200', 18000,
  4.6, 41, 18.5090, 73.8480, true
),
(
  'e1000000-0000-0000-0000-000000000002',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Kirloskar Forgings & Dies',
  'Kirloskar Forgings & Dies Mfg. Co.',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
  'Pune', 'Maharashtra', 'India',
  'Metals & Forging',
  'Hot and cold forging of steel and aluminium components. Serving automotive and heavy machinery sectors.',
  1996, '₹50–100 Cr', '201–500', 35000,
  4.8, 89, 18.5310, 73.8710, true
),
(
  'e1000000-0000-0000-0000-000000000003',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Bharat Rubber & Seals',
  'Bharat Rubber & Seals Pvt. Ltd.',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26',
  'Pune', 'Maharashtra', 'India',
  'Polymers & Rubber',
  'Custom rubber moulding, O-rings, sealing systems and vibration dampers for automotive and industrial OEM.',
  2008, '₹8–15 Cr', '51–200', 12000,
  4.2, 27, 18.5140, 73.8620, true
),

-- ── PUNE OUTSKIRTS (10–25 km from Pune centre) ────────────────────────────────
(
  'e1000000-0000-0000-0000-000000000004',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Talegaon Sheet Metal Works',
  'Talegaon Sheet Metal Works Ltd.',
  'https://images.unsplash.com/photo-1518770660439-4636190af475',
  'Talegaon', 'Maharashtra', 'India',
  'Metals & Fabrication',
  'Precision sheet metal stamping, laser cutting and powder-coating for white goods and EV enclosures.',
  2011, '₹20–40 Cr', '51–200', 22000,
  4.4, 35, 18.7350, 73.6770, true
),
(
  'e1000000-0000-0000-0000-000000000005',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Chakan Plastics Industries',
  'Chakan Plastics Industries Pvt. Ltd.',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26',
  'Chakan', 'Maharashtra', 'India',
  'Polymers',
  'Injection-moulded polymer components for automotive interior trims, dashboard parts, and clips.',
  2006, '₹15–30 Cr', '51–200', 16000,
  4.3, 52, 18.7640, 73.8590, true
),

-- ── MAHARASHTRA REGION (25–100 km from Pune) ──────────────────────────────────
(
  'e1000000-0000-0000-0000-000000000006',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Nasik Precision Tubes',
  'Nasik Precision Tubes Ltd.',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'Nashik', 'Maharashtra', 'India',
  'Metals & Alloys',
  'ERW and seamless steel tubes for hydraulic systems, bicycles, and general engineering applications.',
  1999, '₹40–80 Cr', '201–500', 28000,
  4.5, 63, 19.9975, 73.7898, true
),
(
  'e1000000-0000-0000-0000-000000000007',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Satara Springs & Stampings',
  'Satara Springs & Stampings Co.',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
  'Satara', 'Maharashtra', 'India',
  'Automotive & Springs',
  'Leaf and coil spring manufacture for commercial vehicles. Certified to ISO 9001 and TS 16949.',
  2001, '₹10–20 Cr', '51–200', 10000,
  4.1, 18, 17.6805, 73.9845, true
),

-- ── MUMBAI (120–140 km from Pune) ─────────────────────────────────────────────
(
  'e1000000-0000-0000-0000-000000000008',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Ambernath Electronics Mfg',
  'Ambernath Electronics Manufacturing Pvt. Ltd.',
  'https://images.unsplash.com/photo-1518770660439-4636190af475',
  'Ambernath', 'Maharashtra', 'India',
  'Electronics',
  'PCB assemblies, motor control boards, power electronics for EV and industrial automation.',
  2010, '₹30–60 Cr', '51–200', 14000,
  4.7, 78, 19.1993, 73.1959, true
),
(
  'e1000000-0000-0000-0000-000000000009',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Thane Textiles Processing',
  'Thane Textiles Processing Ltd.',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
  'Thane', 'Maharashtra', 'India',
  'Textiles',
  'Fabric dyeing, printing and processing for technical textiles, apparel and home furnishing sectors.',
  1987, '₹80–150 Cr', '500+', 50000,
  4.0, 34, 19.2183, 72.9781, true
),

-- ── GUJARAT (250–300 km from Pune) ────────────────────────────────────────────
(
  'e1000000-0000-0000-0000-000000000010',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Vapi Chemical Intermediates',
  'Vapi Chemical Intermediates Ltd.',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26',
  'Vapi', 'Gujarat', 'India',
  'Chemicals',
  'Specialty chemical intermediates, dyes and pigments for pharma API, paints and agro-chemicals.',
  1995, '₹100–200 Cr', '201–500', 40000,
  4.6, 57, 20.3720, 72.9070, true
),
(
  'e1000000-0000-0000-0000-000000000011',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Rajkot Brass Precision',
  'Rajkot Brass Precision Parts Pvt. Ltd.',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'Rajkot', 'Gujarat', 'India',
  'Metals & Machining',
  'Precision brass, aluminium and stainless-steel turned parts for hydraulics, plumbing and electronics.',
  2004, '₹18–35 Cr', '51–200', 15000,
  4.9, 112, 22.3039, 70.8022, true
),

-- ── KARNATAKA / BENGALURU (840 km from Pune) ──────────────────────────────────
(
  'e1000000-0000-0000-0000-000000000012',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Silicon City PCB Factory',
  'Silicon City PCB Manufacturing Pvt. Ltd.',
  'https://images.unsplash.com/photo-1518770660439-4636190af475',
  'Bengaluru', 'Karnataka', 'India',
  'Electronics',
  'Single-sided, double-sided and multi-layer PCB fabrication with SMT assembly line. RoHS compliant.',
  2012, '₹25–50 Cr', '51–200', 12000,
  4.8, 95, 12.9900, 77.5800, true
),
(
  'e1000000-0000-0000-0000-000000000013',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Peenya Precision Castings',
  'Peenya Precision Castings & Machining Ltd.',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
  'Bengaluru', 'Karnataka', 'India',
  'Metals & Casting',
  'Aluminium die casting and gravity casting for aerospace, automotive and defence sub-assemblies.',
  2000, '₹60–120 Cr', '201–500', 32000,
  4.7, 74, 13.0320, 77.5540, true
),
(
  'e1000000-0000-0000-0000-000000000014',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Hosur Tractor Components',
  'Hosur Tractor Components Ltd.',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'Hosur', 'Tamil Nadu', 'India',
  'Automotive & Tractor',
  'Transmission housings, final drive gears and axle shafts for tractor and construction equipment OEM.',
  1994, '₹90–180 Cr', '500+', 55000,
  4.5, 88, 12.7409, 77.8253, true
),

-- ── TAMIL NADU / CHENNAI (1500 km from Pune) ──────────────────────────────────
(
  'e1000000-0000-0000-0000-000000000015',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Ambattur Industrial Plastics',
  'Ambattur Industrial Plastics Pvt. Ltd.',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26',
  'Chennai', 'Tamil Nadu', 'India',
  'Polymers',
  'High-precision plastic injection moulding for medical devices, electronics enclosures and white goods.',
  2009, '₹22–45 Cr', '51–200', 14000,
  4.4, 49, 13.1090, 80.1600, true
),
(
  'e1000000-0000-0000-0000-000000000016',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Coimbatore Textile Machines',
  'Coimbatore Textile Machines & Parts Ltd.',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
  'Coimbatore', 'Tamil Nadu', 'India',
  'Textile Machinery',
  'Precision parts for spinning, weaving and knitting machinery. Serving leading textile machinery OEMs.',
  1988, '₹50–100 Cr', '201–500', 28000,
  4.6, 67, 11.0168, 76.9558, true
),

-- ── DELHI NCR (1500 km from Pune) ─────────────────────────────────────────────
(
  'e1000000-0000-0000-0000-000000000017',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Faridabad Metal Stampings',
  'Faridabad Metal Stampings Pvt. Ltd.',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'Faridabad', 'Haryana', 'India',
  'Metals & Stamping',
  'Progressive die stamping, deep drawing, roll forming for automotive, HVAC and consumer durables.',
  2002, '₹30–60 Cr', '201–500', 20000,
  4.3, 55, 28.4089, 77.3178, true
),
(
  'e1000000-0000-0000-0000-000000000018',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Noida Electronic Components',
  'Noida Electronic Components Pvt. Ltd.',
  'https://images.unsplash.com/photo-1518770660439-4636190af475',
  'Noida', 'Uttar Pradesh', 'India',
  'Electronics',
  'SMT PCB assemblies, wire harnesses and embedded modules for telecoms, IoT and industrial controls.',
  2014, '₹18–35 Cr', '51–200', 9000,
  4.5, 42, 28.5355, 77.3910, true
),

-- ── WEST BENGAL / KOLKATA (2000+ km from Pune) ────────────────────────────────
(
  'e1000000-0000-0000-0000-000000000019',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Howrah Iron & Foundry',
  'Howrah Iron & Steel Foundry Pvt. Ltd.',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
  'Howrah', 'West Bengal', 'India',
  'Metals & Foundry',
  'Grey iron and ductile iron castings for pumps, valves and heavy engineering. ISO 9001 certified.',
  1979, '₹40–80 Cr', '201–500', 38000,
  4.1, 29, 22.6032, 88.3181, true
),

-- ── HYDERABAD (580 km from Pune) ──────────────────────────────────────────────
(
  'e1000000-0000-0000-0000-000000000020',
  '09c836ed-0e11-49e0-b629-2bcd16cc4651',
  'manufacturer',
  'Medchal Pharmaceutical Packs',
  'Medchal Pharmaceutical Packaging Pvt. Ltd.',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26',
  'Hyderabad', 'Telangana', 'India',
  'Packaging & Pharma',
  'Blister packs, strip packs, bottles and cartons for generic pharma, nutraceuticals and OTC products.',
  2007, '₹35–70 Cr', '51–200', 18000,
  4.7, 83, 17.6300, 78.5400, true
)

ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. PRODUCTS — 3–4 products per manufacturer across diverse categories
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO public.products
  (id, manufacturer_id, name, category, image_url,
   material, description, unit_price, price_unit, moq,
   monthly_capacity, lead_time_days, certifications,
   sample_available, sample_price_inr,
   value_label, value_proposition, is_active)
VALUES

-- ── Panchsheel Auto Parts (Pune, Gears & Powertrain) ─────────────────────────
(
  'f1000000-0000-0000-0000-000000000001',
  'e1000000-0000-0000-0000-000000000001',
  'CNC Turned Shaft', 'Gears & Powertrain',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
  'Alloy steel', 'High-precision CNC turned drive shafts for automotive gearboxes. Tolerance ±0.01 mm.',
  420, 'per piece', 200, 15000, 14,
  ARRAY['ISO 9001', 'IATF 16949'],
  true, 2500,
  'OEM Grade', 'Tight-tolerance automotive turned shafts',
  true
),
(
  'f1000000-0000-0000-0000-000000000002',
  'e1000000-0000-0000-0000-000000000001',
  'Differential Pinion Gear', 'Gears & Powertrain',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
  'Case hardened steel', 'Ground and lapped differential pinion gears for passenger cars and SUVs.',
  1250, 'per piece', 100, 8000, 21,
  ARRAY['IATF 16949', 'ISO 9001'],
  true, 4000,
  'Precision OEM', 'Ground differential gears with DIN Q8 accuracy',
  true
),

-- ── Kirloskar Forgings & Dies (Pune, Metals & Forging) ───────────────────────
(
  'f1000000-0000-0000-0000-000000000003',
  'e1000000-0000-0000-0000-000000000002',
  'Steel Connecting Rod Forging', 'Metals & Alloys',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'EN 25 alloy steel', 'Drop-forged and trimmed connecting rods for IC engines. Ready for finish machining.',
  890, 'per piece', 500, 40000, 18,
  ARRAY['ISO 9001', 'IATF 16949'],
  true, 1800,
  'Volume Forging', 'High-volume engine connecting rod forgings',
  true
),
(
  'f1000000-0000-0000-0000-000000000004',
  'e1000000-0000-0000-0000-000000000002',
  'Aluminium Die Casting (Custom)', 'Metals & Alloys',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'A380 aluminium', 'Custom aluminium pressure die castings for gearbox housings, pump bodies and brackets.',
  320, 'per kg', 300, 25000, 22,
  ARRAY['ISO 9001'],
  true, 5000,
  'Custom Casting', 'Custom aluminium pressure die castings',
  true
),

-- ── Bharat Rubber & Seals (Pune, Polymers) ────────────────────────────────────
(
  'f1000000-0000-0000-0000-000000000005',
  'e1000000-0000-0000-0000-000000000003',
  'EPDM O-Ring Set', 'Polymers',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26',
  'EPDM rubber', 'EPDM o-rings in standard and custom sizes. High temperature and ozone resistance.',
  8, 'per piece', 5000, 200000, 10,
  ARRAY['ISO 9001'],
  true, 500,
  'Sealing Expert', 'Custom EPDM o-rings for automotive and industrial use',
  true
),
(
  'f1000000-0000-0000-0000-000000000006',
  'e1000000-0000-0000-0000-000000000003',
  'Anti-Vibration Mount', 'Polymers',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26',
  'Natural rubber + steel', 'Bonded rubber-metal vibration isolators for engines, compressors and HVAC.',
  95, 'per piece', 1000, 50000, 15,
  ARRAY['ISO 9001'],
  true, 2000,
  'NVH Solution', 'Bonded rubber-metal vibration isolators',
  true
),

-- ── Talegaon Sheet Metal Works (Pune outskirts, Metals & Fabrication) ─────────
(
  'f1000000-0000-0000-0000-000000000007',
  'e1000000-0000-0000-0000-000000000004',
  'Laser Cut Steel Bracket', 'Metals & Alloys',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'MS / SS 304', 'Laser-cut and CNC-bent steel brackets with powder-coat finish. Batch or continuous supply.',
  45, 'per piece', 1000, 80000, 8,
  ARRAY['ISO 9001'],
  true, 1000,
  'Quick Turn', 'Laser-cut steel brackets with 8-day lead time',
  true
),
(
  'f1000000-0000-0000-0000-000000000008',
  'e1000000-0000-0000-0000-000000000004',
  'EV Battery Enclosure Panel', 'Metals & Alloys',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'Aluminium 5052', 'Precision sheet metal EV battery tray and enclosure panels. EMI shield coating available.',
  1800, 'per piece', 100, 5000, 25,
  ARRAY['ISO 9001', 'IATF 16949'],
  true, 8000,
  'EV Ready', 'Battery enclosure panels for EV manufacturers',
  true
),

-- ── Chakan Plastics Industries (Pune outskirts, Polymers) ─────────────────────
(
  'f1000000-0000-0000-0000-000000000009',
  'e1000000-0000-0000-0000-000000000005',
  'Dashboard Vent Cluster', 'Polymers',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26',
  'ABS + PC blend', 'Injection moulded automotive dashboard vent cluster with chrome-effect finish.',
  280, 'per piece', 500, 20000, 18,
  ARRAY['ISO 9001', 'IATF 16949'],
  true, 3500,
  'Class A Surface', 'Automotive interior vent clusters with premium finish',
  true
),

-- ── Nasik Precision Tubes (Maharashtra, Metals & Alloys) ──────────────────────
(
  'f1000000-0000-0000-0000-000000000010',
  'e1000000-0000-0000-0000-000000000006',
  'Hydraulic Steel Tube 25mm OD', 'Metals & Alloys',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'E355 hydraulic tube', '25mm OD x 3mm wall seamless hydraulic cylinder tubes. DIN 2391 standard.',
  185, 'per metre', 500, 100000, 12,
  ARRAY['ISO 9001', 'CE'],
  true, 3000,
  'Hydraulic Grade', 'Seamless hydraulic cylinder tubes DIN 2391',
  true
),
(
  'f1000000-0000-0000-0000-000000000011',
  'e1000000-0000-0000-0000-000000000006',
  'Bicycle Frame Tube Set', 'Metals & Alloys',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'Cr-Mo 4130 steel', 'Butted Cr-Mo steel tube sets for mountain bike, road bike and cargo bike frames.',
  1200, 'per set', 200, 10000, 20,
  ARRAY['ISO 9001'],
  true, 4000,
  'Light & Strong', 'Butted chromoly tube sets for cycling frames',
  true
),

-- ── Satara Springs & Stampings (Maharashtra, Automotive) ──────────────────────
(
  'f1000000-0000-0000-0000-000000000012',
  'e1000000-0000-0000-0000-000000000007',
  'Coil Spring (Suspension)', 'Gears & Powertrain',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
  'SAE 9254 spring steel', 'Shot-peened coil springs for passenger car and LCV front suspension struts.',
  520, 'per piece', 100, 8000, 14,
  ARRAY['IATF 16949', 'ISO 9001'],
  true, 2500,
  'Suspension OEM', 'Shot-peened suspension coil springs',
  true
),

-- ── Ambernath Electronics Mfg (Mumbai area, Electronics) ─────────────────────
(
  'f1000000-0000-0000-0000-000000000013',
  'e1000000-0000-0000-0000-000000000008',
  'BLDC Motor Controller PCB', 'Electronics',
  'https://images.unsplash.com/photo-1518770660439-4636190af475',
  'FR4 PCB + MOSFET', 'BLDC motor controller boards for EV scooters, e-rickshaws and industrial servo drives.',
  750, 'per piece', 200, 10000, 20,
  ARRAY['ISO 9001', 'CE', 'RoHS'],
  true, 3000,
  'EV Powertrain', 'BLDC motor controller PCBs for EV applications',
  true
),
(
  'f1000000-0000-0000-0000-000000000014',
  'e1000000-0000-0000-0000-000000000008',
  'Industrial Power Supply (SMPS)', 'Electronics',
  'https://images.unsplash.com/photo-1518770660439-4636190af475',
  'Aluminium chassis + PCB', '24V/10A switched-mode power supply for PLC, automation panels and industrial IoT.',
  1450, 'per piece', 50, 3000, 25,
  ARRAY['ISO 9001', 'CE', 'BIS'],
  true, 5000,
  'Reliable Power', 'Industrial SMPS with BIS certification',
  true
),

-- ── Thane Textiles Processing (Mumbai, Textiles) ───────────────────────────────
(
  'f1000000-0000-0000-0000-000000000015',
  'e1000000-0000-0000-0000-000000000009',
  'Technical Textile Roll (Coated)', 'Textiles',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
  'Polyester + PU coat', 'PU-coated technical fabrics for tarpaulins, truck covers and waterproof outdoor gear.',
  90, 'per metre', 3000, 300000, 10,
  ARRAY['ISO 9001', 'OEKO-TEX'],
  true, 5000,
  'Technical Textile', 'PU-coated polyester for heavy-duty covers',
  true
),

-- ── Vapi Chemical Intermediates (Gujarat, Chemicals) ─────────────────────────
(
  'f1000000-0000-0000-0000-000000000016',
  'e1000000-0000-0000-0000-000000000010',
  'Solvent Dye Concentrate', 'Chemicals',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26',
  'Synthetic solvent-soluble dye', 'Solvent dye concentrates for plastics colouring, inkjet inks and fuel dyes.',
  680, 'per kg', 50, 5000, 15,
  ARRAY['ISO 9001', 'REACH'],
  true, 3500,
  'Custom Colour', 'High-purity solvent dyes for plastics and inks',
  true
),

-- ── Rajkot Brass Precision (Gujarat, Metals) ──────────────────────────────────
(
  'f1000000-0000-0000-0000-000000000017',
  'e1000000-0000-0000-0000-000000000011',
  'Brass CNC Turned Insert', 'Metals & Alloys',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'Leaded brass H58', 'Precision brass threaded inserts for PCBs, plastic mouldings and hydraulic fittings.',
  12, 'per piece', 10000, 500000, 8,
  ARRAY['ISO 9001'],
  true, 1000,
  'High Volume', 'Precision brass inserts with same-week dispatch',
  true
),
(
  'f1000000-0000-0000-0000-000000000018',
  'e1000000-0000-0000-0000-000000000011',
  'Hydraulic Fitting (BSP)', 'Metals & Alloys',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'Brass + SS internals', 'Leak-free BSP hydraulic fittings — elbows, tees, nipples and adaptors in stock.',
  38, 'per piece', 2000, 150000, 7,
  ARRAY['ISO 9001', 'CE'],
  true, 800,
  'Zero Leak', 'BSP hydraulic fittings with 7-day delivery',
  true
),

-- ── Silicon City PCB Factory (Bengaluru, Electronics) ─────────────────────────
(
  'f1000000-0000-0000-0000-000000000019',
  'e1000000-0000-0000-0000-000000000012',
  'Multi-Layer PCB (8 layer)', 'Electronics',
  'https://images.unsplash.com/photo-1518770660439-4636190af475',
  'FR4 Tg150', '8-layer FR4 PCB for industrial computers, networking switches and medical devices.',
  1250, 'per board', 50, 2000, 18,
  ARRAY['ISO 9001', 'UL', 'RoHS'],
  true, 6000,
  'High Density', '8-layer PCB with controlled impedance',
  true
),
(
  'f1000000-0000-0000-0000-000000000020',
  'e1000000-0000-0000-0000-000000000012',
  'PCB + SMT Assembly Service', 'Electronics',
  'https://images.unsplash.com/photo-1518770660439-4636190af475',
  'Gerber-to-PCBA', 'Turnkey SMT PCB assembly — BOM sourcing, soldering, AOI and functional test.',
  0, 'per service quote', 10, 500, 25,
  ARRAY['ISO 9001', 'IPC-A-610'],
  true, 0,
  'Turnkey PCBA', 'End-to-end PCB assembly with testing',
  true
),

-- ── Peenya Precision Castings (Bengaluru, Metals & Casting) ───────────────────
(
  'f1000000-0000-0000-0000-000000000021',
  'e1000000-0000-0000-0000-000000000013',
  'Aluminium Gearbox Housing (Die Cast)', 'Metals & Alloys',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'ADC12 aluminium', 'Die-cast gearbox housing for two-wheelers and small petrol engines. Machined bores.',
  940, 'per piece', 300, 12000, 28,
  ARRAY['ISO 9001', 'IATF 16949'],
  true, 4500,
  'Cast & Machine', 'Die-cast aluminium gearbox housings',
  true
),

-- ── Hosur Tractor Components (Tamil Nadu near Bengaluru, Automotive) ──────────
(
  'f1000000-0000-0000-0000-000000000022',
  'e1000000-0000-0000-0000-000000000014',
  'Tractor Final Drive Gear', 'Gears & Powertrain',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
  'EN36C case hardened steel', 'Carburised and hardened final drive spur gears for agricultural tractors.',
  2800, 'per piece', 50, 3000, 30,
  ARRAY['ISO 9001', 'IATF 16949'],
  true, 8000,
  'Agri Strength', 'Heavy-duty tractor final drive gears',
  true
),

-- ── Ambattur Industrial Plastics (Chennai, Polymers) ──────────────────────────
(
  'f1000000-0000-0000-0000-000000000023',
  'e1000000-0000-0000-0000-000000000015',
  'Medical Device Housing (Class I)', 'Polymers',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26',
  'Medical-grade ABS', 'Injection moulded enclosures for medical diagnostic devices — FDA-compliant resin.',
  180, 'per piece', 500, 25000, 20,
  ARRAY['ISO 13485', 'ISO 9001'],
  true, 3000,
  'Medtech Ready', 'FDA-resin moulded medical device housings',
  true
),
(
  'f1000000-0000-0000-0000-000000000024',
  'e1000000-0000-0000-0000-000000000015',
  'PP Corrugated Box Inner Tray', 'Polymers',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26',
  'Polypropylene', 'Thermoformed PP inner trays for electronics, auto parts, and consumer goods packaging.',
  14, 'per piece', 5000, 100000, 12,
  ARRAY['ISO 9001'],
  true, 500,
  'Eco Pack', 'Thermoformed PP trays for protective packaging',
  true
),

-- ── Coimbatore Textile Machines (Tamil Nadu) ──────────────────────────────────
(
  'f1000000-0000-0000-0000-000000000025',
  'e1000000-0000-0000-0000-000000000016',
  'Ring Frame Spindle Assembly', 'Textiles',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158',
  'Steel + ceramic guide', 'High-speed spinning ring frame spindles for cotton and polyester yarn production.',
  650, 'per piece', 100, 5000, 20,
  ARRAY['ISO 9001'],
  true, 3000,
  'Spinning Expert', 'High-speed ring frame spindles',
  true
),

-- ── Faridabad Metal Stampings (Delhi NCR, Metals) ────────────────────────────
(
  'f1000000-0000-0000-0000-000000000026',
  'e1000000-0000-0000-0000-000000000017',
  'Progressive Die Stamping (Custom)', 'Metals & Alloys',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'CRCA steel / SS', 'Custom progressive-die stampings for automotive body-in-white, hinges and brackets.',
  35, 'per piece', 2000, 200000, 16,
  ARRAY['ISO 9001', 'IATF 16949'],
  true, 1500,
  'High Speed Press', 'Progressive die stampings at competitive pricing',
  true
),
(
  'f1000000-0000-0000-0000-000000000027',
  'e1000000-0000-0000-0000-000000000017',
  'HVAC Sheet Metal Duct Section', 'Metals & Alloys',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'Galvanised steel', 'Spiral and rectangular HVAC duct sections with lock-forming for commercial buildings.',
  280, 'per running metre', 500, 20000, 12,
  ARRAY['ISO 9001', 'SMACNA'],
  true, 4000,
  'HVAC Ready', 'Galvanised HVAC duct sections',
  true
),

-- ── Noida Electronic Components (Delhi NCR, Electronics) ────────────────────
(
  'f1000000-0000-0000-0000-000000000028',
  'e1000000-0000-0000-0000-000000000018',
  'IoT Gateway PCB Assembly', 'Electronics',
  'https://images.unsplash.com/photo-1518770660439-4636190af475',
  'FR4 + ESP32 module', 'Industrial IoT gateway PCBs with Wi-Fi, Zigbee and LTE connectivity. Tested.',
  920, 'per piece', 100, 5000, 22,
  ARRAY['ISO 9001', 'CE', 'RoHS'],
  true, 4000,
  'Industry 4.0', 'IoT gateway PCBs with multiple connectivity protocols',
  true
),
(
  'f1000000-0000-0000-0000-000000000029',
  'e1000000-0000-0000-0000-000000000018',
  'Wire Harness Assembly (Automotive)', 'Electronics',
  'https://images.unsplash.com/photo-1518770660439-4636190af475',
  'Copper wire + PVC', 'Custom automotive and industrial wire harness assemblies per customer schematics.',
  1600, 'per harness', 50, 2000, 30,
  ARRAY['ISO 9001', 'IATF 16949'],
  true, 6000,
  'Custom Harness', 'Automotive wire harness with IATF compliance',
  true
),

-- ── Howrah Iron & Foundry (West Bengal, Metals) ───────────────────────────────
(
  'f1000000-0000-0000-0000-000000000030',
  'e1000000-0000-0000-0000-000000000019',
  'Grey Iron Valve Body Casting', 'Metals & Alloys',
  'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122',
  'FG 260 grey iron', 'Grey iron castings for industrial butterfly and gate valves. Machined flanges and ports.',
  490, 'per piece', 200, 15000, 21,
  ARRAY['ISO 9001'],
  true, 2000,
  'Foundry Direct', 'Grey iron valve body castings',
  true
),

-- ── Medchal Pharmaceutical Packs (Hyderabad, Packaging) ──────────────────────
(
  'f1000000-0000-0000-0000-000000000031',
  'e1000000-0000-0000-0000-000000000020',
  'Blister Pack Strip (10 tablets)', 'Polymers',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26',
  'PVC / Alu foil', 'High-barrier blister strip packaging for pharma tablets, capsules and nutraceuticals.',
  0.85, 'per strip', 50000, 5000000, 10,
  ARRAY['ISO 15378', 'GMP', 'ISO 9001'],
  true, 1000,
  'GMP Certified', 'GMP-compliant blister pack strips for pharma',
  true
),
(
  'f1000000-0000-0000-0000-000000000032',
  'e1000000-0000-0000-0000-000000000020',
  'HDPE Pharma Bottle 100ml', 'Polymers',
  'https://images.unsplash.com/photo-1563770660941-20978e870e26',
  'HDPE natural', '100ml HDPE bottles for liquid oral formulations with CR caps. FDA-approved resin.',
  3.2, 'per piece', 10000, 1000000, 8,
  ARRAY['ISO 15378', 'GMP'],
  true, 500,
  'Pharma Pack', 'FDA-grade HDPE pharma bottles',
  true
)

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────────────────────
-- Done. Verify:
-- SELECT COUNT(*) FROM public.businesses WHERE demo_data_notice = true;
-- SELECT COUNT(*) FROM public.products
--   WHERE manufacturer_id IN (
--     SELECT id FROM public.businesses WHERE demo_data_notice = true
--   );
-- ─────────────────────────────────────────────────────────────────────────────
