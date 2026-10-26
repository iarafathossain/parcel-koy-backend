-- Parcel Koy representative Bangladesh logistics and pricing seed.
-- PostgreSQL / Prisma schema
-- Safe to rerun: all records use deterministic UUIDs and slug-based upserts.
-- Prices are illustrative BDT values and should be reviewed before production use.

BEGIN;

WITH seed_zones (id, name, slug, is_inside_dhaka) AS (
  VALUES
    ('00000000-0000-4000-8000-000000000101'::uuid, 'Inside Dhaka', 'inside-dhaka', true),
    ('00000000-0000-4000-8000-000000000102'::uuid, 'Dhaka Suburbs', 'dhaka-suburbs', false),
    ('00000000-0000-4000-8000-000000000103'::uuid, 'Outside Dhaka', 'outside-dhaka', false)
)
INSERT INTO zones ("id", "name", "slug", "isInsideDhaka", "isActive", "createdAt", "updatedAt")
SELECT id, name, slug, is_inside_dhaka, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM seed_zones
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "isInsideDhaka" = EXCLUDED."isInsideDhaka",
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

WITH seed_hubs (id, name, slug, address, contact_number) AS (
  VALUES
    ('00000000-0000-4000-8000-000000000301'::uuid, 'Dhaka Central Hub', 'dhaka-central-hub', 'Tejgaon, Dhaka', '01711000001'),
    ('00000000-0000-4000-8000-000000000302'::uuid, 'Savar Hub', 'savar-hub', 'Savar, Dhaka', '01711000002'),
    ('00000000-0000-4000-8000-000000000303'::uuid, 'Chattogram Hub', 'chattogram-hub', 'Agrabad, Chattogram', '01711000003'),
    ('00000000-0000-4000-8000-000000000304'::uuid, 'Sylhet Hub', 'sylhet-hub', 'Ambarkhana, Sylhet', '01711000004')
)
INSERT INTO hubs ("id", "name", "slug", "address", "contactNumber", "isActive", "createdAt", "updatedAt")
SELECT id, name, slug, address, contact_number, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM seed_hubs
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "address" = EXCLUDED."address",
  "contactNumber" = EXCLUDED."contactNumber",
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

WITH seed_areas (id, name, slug, zone_slug, hub_slug) AS (
  VALUES
    ('00000000-0000-4000-8000-000000000201'::uuid, 'Gulshan', 'gulshan', 'inside-dhaka', 'dhaka-central-hub'),
    ('00000000-0000-4000-8000-000000000202'::uuid, 'Dhanmondi', 'dhanmondi', 'inside-dhaka', 'dhaka-central-hub'),
    ('00000000-0000-4000-8000-000000000203'::uuid, 'Uttara', 'uttara', 'inside-dhaka', 'dhaka-central-hub'),
    ('00000000-0000-4000-8000-000000000204'::uuid, 'Mirpur', 'mirpur', 'inside-dhaka', 'dhaka-central-hub'),
    ('00000000-0000-4000-8000-000000000205'::uuid, 'Savar', 'savar', 'dhaka-suburbs', 'savar-hub'),
    ('00000000-0000-4000-8000-000000000206'::uuid, 'Narayanganj', 'narayanganj', 'dhaka-suburbs', 'dhaka-central-hub'),
    ('00000000-0000-4000-8000-000000000207'::uuid, 'Gazipur', 'gazipur', 'dhaka-suburbs', 'savar-hub'),
    ('00000000-0000-4000-8000-000000000208'::uuid, 'Chattogram', 'chattogram', 'outside-dhaka', 'chattogram-hub'),
    ('00000000-0000-4000-8000-000000000209'::uuid, 'Cumilla', 'cumilla', 'outside-dhaka', 'chattogram-hub'),
    ('00000000-0000-4000-8000-000000000210'::uuid, 'Sylhet', 'sylhet', 'outside-dhaka', 'sylhet-hub'),
    ('00000000-0000-4000-8000-000000000211'::uuid, 'Khulna', 'khulna', 'outside-dhaka', 'chattogram-hub'),
    ('00000000-0000-4000-8000-000000000212'::uuid, 'Rajshahi', 'rajshahi', 'outside-dhaka', 'chattogram-hub')
)
INSERT INTO areas ("id", "name", "slug", "zoneId", "hubID", "isActive", "createdAt", "updatedAt")
SELECT
  a.id,
  a.name,
  a.slug,
  z."id",
  h."id",
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM seed_areas a
JOIN zones z ON z."slug" = a.zone_slug
LEFT JOIN hubs h ON h."slug" = a.hub_slug
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "zoneId" = EXCLUDED."zoneId",
  "hubID" = EXCLUDED."hubID",
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

WITH seed_categories (id, name, slug, base_weight, base_fee) AS (
  VALUES
    ('00000000-0000-4000-8000-000000000401'::uuid, 'Document', 'document', 0.10::double precision, 0.00::numeric),
    ('00000000-0000-4000-8000-000000000402'::uuid, 'Regular Parcel', 'regular-parcel', 0.50::double precision, 0.00::numeric),
    ('00000000-0000-4000-8000-000000000403'::uuid, 'Fragile Parcel', 'fragile-parcel', 0.50::double precision, 20.00::numeric)
)
INSERT INTO categories ("id", "name", "slug", "baseWeight", "baseFee", "isActive", "createdAt", "updatedAt")
SELECT id, name, slug, base_weight, base_fee, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM seed_categories
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "baseWeight" = EXCLUDED."baseWeight",
  "baseFee" = EXCLUDED."baseFee",
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

WITH seed_speeds (id, name, slug, description, base_fee, sla_hours) AS (
  VALUES
    ('00000000-0000-4000-8000-000000000501'::uuid, 'Standard Delivery', 'standard-delivery', 'Reliable delivery for regular shipments.', 0.00::numeric, 48),
    ('00000000-0000-4000-8000-000000000502'::uuid, 'Express Delivery', 'express-delivery', 'Priority delivery within Dhaka.', 60.00::numeric, 24)
)
INSERT INTO speeds ("id", "name", "slug", "description", "baseFee", "slaHours", "isActive", "createdAt", "updatedAt")
SELECT id, name, slug, description, base_fee, sla_hours, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM seed_speeds
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "description" = EXCLUDED."description",
  "baseFee" = EXCLUDED."baseFee",
  "slaHours" = EXCLUDED."slaHours",
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

WITH seed_methods (id, name, slug, type, description, base_fee) AS (
  VALUES
    ('00000000-0000-4000-8000-000000000601'::uuid, 'Home Pickup', 'home-pickup', 'PICKUP'::"MethodType", 'Rider collects the parcel from the sender address.', 20.00::numeric),
    ('00000000-0000-4000-8000-000000000602'::uuid, 'Merchant Drop-off', 'merchant-dropoff', 'PICKUP'::"MethodType", 'Merchant drops the parcel at a nearby hub.', 0.00::numeric),
    ('00000000-0000-4000-8000-000000000603'::uuid, 'Home Delivery', 'home-delivery', 'DELIVERY'::"MethodType", 'Parcel delivered to the recipient address.', 0.00::numeric),
    ('00000000-0000-4000-8000-000000000604'::uuid, 'Pickup Point', 'pickup-point', 'DELIVERY'::"MethodType", 'Recipient collects the parcel from a pickup point.', 10.00::numeric)
)
INSERT INTO methods ("id", "name", "slug", "type", "description", "baseFee", "isActive", "createdAt", "updatedAt")
SELECT id, name, slug, type, description, base_fee, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM seed_methods
ON CONFLICT ("slug") DO UPDATE SET
  "name" = EXCLUDED."name",
  "type" = EXCLUDED."type",
  "description" = EXCLUDED."description",
  "baseFee" = EXCLUDED."baseFee",
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

-- One broad band is intentional: the current schema permits one rule per
-- zone/category/speed/pickup/delivery combination, so 0-10 kg makes the
-- public pricing checker useful for all normal sample weights.
WITH
  seed_pairs (pair_key, origin_slug, destination_slug, base_price) AS (
    VALUES
      ('inside-to-inside', 'inside-dhaka', 'inside-dhaka', 80.00::numeric),
      ('inside-to-outside', 'inside-dhaka', 'outside-dhaka', 130.00::numeric),
      ('outside-to-inside', 'outside-dhaka', 'inside-dhaka', 130.00::numeric)
  ),
  seed_categories (slug, surcharge) AS (
    VALUES
      ('document', 0.00::numeric),
      ('regular-parcel', 0.00::numeric),
      ('fragile-parcel', 20.00::numeric)
  ),
  seed_speeds (slug, surcharge) AS (
    VALUES
      ('standard-delivery', 0.00::numeric),
      ('express-delivery', 70.00::numeric)
  ),
  seed_pickups (slug, surcharge) AS (
    VALUES
      ('home-pickup', 20.00::numeric),
      ('merchant-dropoff', 0.00::numeric)
  ),
  seed_deliveries (slug, surcharge) AS (
    VALUES
      ('home-delivery', 0.00::numeric),
      ('pickup-point', -10.00::numeric)
  ),
  usable_combinations AS (
    SELECT
      p.pair_key,
      p.origin_slug,
      p.destination_slug,
      p.base_price,
      c.slug AS category_slug,
      c.surcharge AS category_surcharge,
      s.slug AS speed_slug,
      s.surcharge AS speed_surcharge,
      pu.slug AS pickup_slug,
      pu.surcharge AS pickup_surcharge,
      d.slug AS delivery_slug,
      d.surcharge AS delivery_surcharge
    FROM seed_pairs p
    CROSS JOIN seed_categories c
    CROSS JOIN seed_speeds s
    CROSS JOIN seed_pickups pu
    CROSS JOIN seed_deliveries d
    WHERE p.pair_key = 'inside-to-inside' OR s.slug = 'standard-delivery'
  ),
  pricing_rows AS (
    SELECT
      ('00000000-0000-4000-8000-' ||
        lpad((row_number() OVER (ORDER BY pair_key, category_slug, speed_slug, pickup_slug, delivery_slug) + 700)::text, 12, '0'))::uuid AS id,
      o."id" AS original_zone_id,
      d."id" AS destination_zone_id,
      c."id" AS category_id,
      s."id" AS speed_id,
      pu."id" AS pickup_method_id,
      de."id" AS delivery_method_id,
      GREATEST(
        0.00::numeric,
        base_price + category_surcharge + speed_surcharge +
        pickup_surcharge + delivery_surcharge
      ) AS price
    FROM usable_combinations u
    JOIN zones o ON o."slug" = u.origin_slug
    JOIN zones d ON d."slug" = u.destination_slug
    JOIN categories c ON c."slug" = u.category_slug
    JOIN speeds s ON s."slug" = u.speed_slug
    JOIN methods pu ON pu."slug" = u.pickup_slug
    JOIN methods de ON de."slug" = u.delivery_slug
  )
INSERT INTO pricing (
  "id",
  "originalZoneId",
  "destinationZoneId",
  "categoryId",
  "speedId",
  "pickupMethodId",
  "deliveryMethodId",
  "minWeight",
  "maxWeight",
  "price",
  "isActive",
  "createdAt",
  "updatedAt"
)
SELECT
  id,
  original_zone_id,
  destination_zone_id,
  category_id,
  speed_id,
  pickup_method_id,
  delivery_method_id,
  0.00,
  10.00,
  price,
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM pricing_rows
ON CONFLICT (
  "originalZoneId",
  "destinationZoneId",
  "categoryId",
  "speedId",
  "pickupMethodId",
  "deliveryMethodId"
) DO UPDATE SET
  "minWeight" = EXCLUDED."minWeight",
  "maxWeight" = EXCLUDED."maxWeight",
  "price" = EXCLUDED."price",
  "isActive" = true,
  "updatedAt" = CURRENT_TIMESTAMP;

COMMIT;

-- Verification: counts and seeded names.
SELECT 'zones' AS entity, COUNT(*) AS count FROM zones
WHERE "slug" IN ('inside-dhaka', 'dhaka-suburbs', 'outside-dhaka')
UNION ALL
SELECT 'areas', COUNT(*) FROM areas
WHERE "slug" IN (
  'gulshan', 'dhanmondi', 'uttara', 'mirpur', 'savar', 'narayanganj',
  'gazipur', 'chattogram', 'cumilla', 'sylhet', 'khulna', 'rajshahi'
)
UNION ALL
SELECT 'categories', COUNT(*) FROM categories
WHERE "slug" IN ('document', 'regular-parcel', 'fragile-parcel')
UNION ALL
SELECT 'speeds', COUNT(*) FROM speeds
WHERE "slug" IN ('standard-delivery', 'express-delivery')
UNION ALL
SELECT 'methods', COUNT(*) FROM methods
WHERE "slug" IN ('home-pickup', 'merchant-dropoff', 'home-delivery', 'pickup-point')
UNION ALL
SELECT 'pricing rules', COUNT(*) FROM pricing
WHERE "isActive" = true;

-- Verification: expected public pricing combinations.
SELECT
  oz."name" AS origin_zone,
  dz."name" AS destination_zone,
  c."name" AS category,
  s."name" AS speed,
  pm."name" AS pickup_method,
  dm."name" AS delivery_method,
  p."minWeight",
  p."maxWeight",
  p."price"
FROM pricing p
JOIN zones oz ON oz."id" = p."originalZoneId"
JOIN zones dz ON dz."id" = p."destinationZoneId"
JOIN categories c ON c."id" = p."categoryId"
JOIN speeds s ON s."id" = p."speedId"
JOIN methods pm ON pm."id" = p."pickupMethodId"
JOIN methods dm ON dm."id" = p."deliveryMethodId"
WHERE p."isActive" = true
ORDER BY oz."name", dz."name", c."name", s."name", pm."name", dm."name";
