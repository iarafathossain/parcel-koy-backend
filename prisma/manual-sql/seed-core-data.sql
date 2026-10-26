-- ParcelKoy core seed for a reset database.
-- Run after Prisma migrations and after the existing Super Admin seed.
-- Admin password: @Admin123
-- Rider password: @Rider123
-- Merchant password: @StrongPass123
-- All seeded accounts are verified and do not require a password change.

BEGIN;

INSERT INTO "users"
  ("id", "name", "email", "emailVerified", "contactNumber", "gender", "role",
   "status", "needPasswordChange", "isDeleted", "createdAt", "updatedAt")
VALUES
  ('019d7000-0000-7000-8000-000000000001', 'Aminul Islam', 'aminul.admin@parcelkoy.com', true, '01712000001', 'MALE', 'ADMIN', 'ACTIVE', false, false, now(), now()),
  ('019d7000-0000-7000-8000-000000000002', 'Tania Sultana', 'tania.admin@parcelkoy.com', true, '01712000002', 'FEMALE', 'ADMIN', 'ACTIVE', false, false, now(), now()),
  ('019d7000-0000-7000-8000-000000000003', 'Fahim Rahman', 'fahim.admin@parcelkoy.com', true, '01712000003', 'MALE', 'ADMIN', 'ACTIVE', false, false, now(), now()),
  ('019d7000-0000-7000-8000-000000000004', 'Saiful Alam', 'saiful.admin@parcelkoy.com', true, '01712000004', 'MALE', 'ADMIN', 'ACTIVE', false, false, now(), now()),
  ('019d7000-0000-7000-8000-000000000005', 'Rumana Haque', 'rumana.admin@parcelkoy.com', true, '01712000005', 'FEMALE', 'ADMIN', 'ACTIVE', false, false, now(), now()),
  ('019d7000-0000-7000-8000-000000000011', 'Rakib Hasan', 'rakib.rider@parcelkoy.com', true, '01712000011', 'MALE', 'RIDER', 'ACTIVE', false, false, now(), now()),
  ('019d7000-0000-7000-8000-000000000012', 'Jannatul Ferdous', 'jannatul.rider@parcelkoy.com', true, '01712000012', 'FEMALE', 'RIDER', 'ACTIVE', false, false, now(), now()),
  ('019d7000-0000-7000-8000-000000000013', 'Siam Hossain', 'siam.rider@parcelkoy.com', true, '01712000013', 'MALE', 'RIDER', 'ACTIVE', false, false, now(), now()),
  ('019d7000-0000-7000-8000-000000000014', 'Nadia Rahman', 'nadia.rider@parcelkoy.com', true, '01712000014', 'FEMALE', 'RIDER', 'ACTIVE', false, false, now(), now()),
  ('019d7000-0000-7000-8000-000000000015', 'Mehedi Hasan', 'mehedi.rider@parcelkoy.com', true, '01712000015', 'MALE', 'RIDER', 'ACTIVE', false, false, now(), now()),
  ('019d7000-0000-7000-8000-000000000021', 'Md. Arif Hossain', 'md489288@gmail.com', true, '01712000021', 'MALE', 'MERCHANT', 'ACTIVE', false, false, now(), now())
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "account"
  ("id", "accountId", "providerId", "userId", "password", "createdAt", "updatedAt")
VALUES
  ('019d7000-0010-7000-8000-000000000001', '019d7000-0000-7000-8000-000000000001', 'credential', '019d7000-0000-7000-8000-000000000001', '620631449527036440a513a135d505cc:cd7206b00c89a724a94bf0b39b93c7b057f73ac163692924b9e6a0fc3a0ba7a934e3a403b607f53fc0e691581d00a40e5a4b17ef339e12dcbd7fbbc929e34772', now(), now()),
  ('019d7000-0010-7000-8000-000000000002', '019d7000-0000-7000-8000-000000000002', 'credential', '019d7000-0000-7000-8000-000000000002', '620631449527036440a513a135d505cc:cd7206b00c89a724a94bf0b39b93c7b057f73ac163692924b9e6a0fc3a0ba7a934e3a403b607f53fc0e691581d00a40e5a4b17ef339e12dcbd7fbbc929e34772', now(), now()),
  ('019d7000-0010-7000-8000-000000000003', '019d7000-0000-7000-8000-000000000003', 'credential', '019d7000-0000-7000-8000-000000000003', '620631449527036440a513a135d505cc:cd7206b00c89a724a94bf0b39b93c7b057f73ac163692924b9e6a0fc3a0ba7a934e3a403b607f53fc0e691581d00a40e5a4b17ef339e12dcbd7fbbc929e34772', now(), now()),
  ('019d7000-0010-7000-8000-000000000004', '019d7000-0000-7000-8000-000000000004', 'credential', '019d7000-0000-7000-8000-000000000004', '620631449527036440a513a135d505cc:cd7206b00c89a724a94bf0b39b93c7b057f73ac163692924b9e6a0fc3a0ba7a934e3a403b607f53fc0e691581d00a40e5a4b17ef339e12dcbd7fbbc929e34772', now(), now()),
  ('019d7000-0010-7000-8000-000000000005', '019d7000-0000-7000-8000-000000000005', 'credential', '019d7000-0000-7000-8000-000000000005', '620631449527036440a513a135d505cc:cd7206b00c89a724a94bf0b39b93c7b057f73ac163692924b9e6a0fc3a0ba7a934e3a403b607f53fc0e691581d00a40e5a4b17ef339e12dcbd7fbbc929e34772', now(), now()),
  ('019d7000-0010-7000-8000-000000000011', '019d7000-0000-7000-8000-000000000011', 'credential', '019d7000-0000-7000-8000-000000000011', '26e49478e7f069aec28b63145b97959b:6062ead15f0b6fe76eb1567177742ece247fd018b65a7a841d2b78235519ade8b5d285186c7b72aac809417bcedd3996b915809efa9759e5fce661791f2f4f47', now(), now()),
  ('019d7000-0010-7000-8000-000000000012', '019d7000-0000-7000-8000-000000000012', 'credential', '019d7000-0000-7000-8000-000000000012', '26e49478e7f069aec28b63145b97959b:6062ead15f0b6fe76eb1567177742ece247fd018b65a7a841d2b78235519ade8b5d285186c7b72aac809417bcedd3996b915809efa9759e5fce661791f2f4f47', now(), now()),
  ('019d7000-0010-7000-8000-000000000013', '019d7000-0000-7000-8000-000000000013', 'credential', '019d7000-0000-7000-8000-000000000013', '26e49478e7f069aec28b63145b97959b:6062ead15f0b6fe76eb1567177742ece247fd018b65a7a841d2b78235519ade8b5d285186c7b72aac809417bcedd3996b915809efa9759e5fce661791f2f4f47', now(), now()),
  ('019d7000-0010-7000-8000-000000000014', '019d7000-0000-7000-8000-000000000014', 'credential', '019d7000-0000-7000-8000-000000000014', '26e49478e7f069aec28b63145b97959b:6062ead15f0b6fe76eb1567177742ece247fd018b65a7a841d2b78235519ade8b5d285186c7b72aac809417bcedd3996b915809efa9759e5fce661791f2f4f47', now(), now()),
  ('019d7000-0010-7000-8000-000000000015', '019d7000-0000-7000-8000-000000000015', 'credential', '019d7000-0000-7000-8000-000000000015', '26e49478e7f069aec28b63145b97959b:6062ead15f0b6fe76eb1567177742ece247fd018b65a7a841d2b78235519ade8b5d285186c7b72aac809417bcedd3996b915809efa9759e5fce661791f2f4f47', now(), now()),
  ('019d7000-0010-7000-8000-000000000021', '019d7000-0000-7000-8000-000000000021', 'credential', '019d7000-0000-7000-8000-000000000021', '07ea22676c5957caa8fa8f98cb0fe36f:3906b43313104e0e16d5c9dfec865bc7b5d07025ea0456b895ba2ace68fdb6c00cd12d02b27403be6e6236f33271f2b836af8b92fd98516133a1657529bf56df', now(), now())
ON CONFLICT DO NOTHING;

INSERT INTO "admins"
  ("id", "userId", "presentAddress", "permanentAddress", "createdAt", "updatedAt")
VALUES
  ('019d7000-0020-7000-8000-000000000001', '019d7000-0000-7000-8000-000000000001', 'Motijheel, Dhaka', 'Savar, Dhaka', now(), now()),
  ('019d7000-0020-7000-8000-000000000002', '019d7000-0000-7000-8000-000000000002', 'Gulshan, Dhaka', 'Mymensingh Sadar, Mymensingh', now(), now()),
  ('019d7000-0020-7000-8000-000000000003', '019d7000-0000-7000-8000-000000000003', 'Agrabad, Chattogram', 'Cumilla Sadar, Cumilla', now(), now()),
  ('019d7000-0020-7000-8000-000000000004', '019d7000-0000-7000-8000-000000000004', 'Boalia, Rajshahi', 'Puthia, Rajshahi', now(), now()),
  ('019d7000-0020-7000-8000-000000000005', '019d7000-0000-7000-8000-000000000005', 'Zindabazar, Sylhet', 'Beanibazar, Sylhet', now(), now())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "zones"
  ("id", "name", "slug", "isActive", "isInsideDhaka", "createdAt", "updatedAt")
VALUES
  ('019d7000-0100-7000-8000-000000000001', 'Dhaka City', 'dhaka-city', true, true, now(), now()),
  ('019d7000-0100-7000-8000-000000000002', 'Chattogram', 'chattogram', true, false, now(), now()),
  ('019d7000-0100-7000-8000-000000000003', 'Rajshahi Division', 'rajshahi-division', true, false, now(), now()),
  ('019d7000-0100-7000-8000-000000000004', 'Sylhet Division', 'sylhet-division', true, false, now(), now())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "hubs"
  ("id", "name", "slug", "address", "contactNumber", "isActive", "managerId", "createdAt", "updatedAt")
VALUES
  ('019d7000-0200-7000-8000-000000000001', 'Dhanmondi Central Hub', 'dhanmondi-central-hub', 'Road 7, Dhanmondi, Dhaka 1209', '02-55010001', true, '019d7000-0020-7000-8000-000000000001', now(), now()),
  ('019d7000-0200-7000-8000-000000000002', 'Uttara North Hub', 'uttara-north-hub', 'Sector 7, Uttara, Dhaka 1230', '02-55010002', true, '019d7000-0020-7000-8000-000000000002', now(), now()),
  ('019d7000-0200-7000-8000-000000000003', 'Agrabad Chattogram Hub', 'agrabad-chattogram-hub', 'CDA Avenue, Agrabad, Chattogram 4100', '031-700003', true, '019d7000-0020-7000-8000-000000000003', now(), now()),
  ('019d7000-0200-7000-8000-000000000004', 'Rajshahi Regional Hub', 'rajshahi-regional-hub', 'Shaheb Bazar, Boalia, Rajshahi 6000', '0721-650004', true, '019d7000-0020-7000-8000-000000000004', now(), now()),
  ('019d7000-0200-7000-8000-000000000005', 'Sylhet Regional Hub', 'sylhet-regional-hub', 'Zindabazar, Sylhet 3100', '0821-650005', true, '019d7000-0020-7000-8000-000000000005', now(), now())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "areas"
  ("id", "name", "slug", "isActive", "zoneId", "hubID", "createdAt", "updatedAt")
VALUES
  ('019d7000-0300-7000-8000-000000000001', 'Dhanmondi', 'dhanmondi', true, '019d7000-0100-7000-8000-000000000001', '019d7000-0200-7000-8000-000000000001', now(), now()),
  ('019d7000-0300-7000-8000-000000000002', 'Gulshan', 'gulshan', true, '019d7000-0100-7000-8000-000000000001', '019d7000-0200-7000-8000-000000000001', now(), now()),
  ('019d7000-0300-7000-8000-000000000003', 'Uttara', 'uttara', true, '019d7000-0100-7000-8000-000000000001', '019d7000-0200-7000-8000-000000000002', now(), now()),
  ('019d7000-0300-7000-8000-000000000004', 'Mirpur', 'mirpur', true, '019d7000-0100-7000-8000-000000000001', '019d7000-0200-7000-8000-000000000002', now(), now()),
  ('019d7000-0300-7000-8000-000000000005', 'Agrabad', 'agrabad', true, '019d7000-0100-7000-8000-000000000002', '019d7000-0200-7000-8000-000000000003', now(), now()),
  ('019d7000-0300-7000-8000-000000000006', 'Panchlaish', 'panchlaish', true, '019d7000-0100-7000-8000-000000000002', '019d7000-0200-7000-8000-000000000003', now(), now()),
  ('019d7000-0300-7000-8000-000000000007', 'Rajshahi Sadar', 'rajshahi-sadar', true, '019d7000-0100-7000-8000-000000000003', '019d7000-0200-7000-8000-000000000004', now(), now()),
  ('019d7000-0300-7000-8000-000000000008', 'Boalia', 'boalia', true, '019d7000-0100-7000-8000-000000000003', '019d7000-0200-7000-8000-000000000004', now(), now()),
  ('019d7000-0300-7000-8000-000000000009', 'Sylhet Sadar', 'sylhet-sadar', true, '019d7000-0100-7000-8000-000000000004', '019d7000-0200-7000-8000-000000000005', now(), now()),
  ('019d7000-0300-7000-8000-000000000010', 'Zindabazar', 'zindabazar', true, '019d7000-0100-7000-8000-000000000004', '019d7000-0200-7000-8000-000000000005', now(), now())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "riders"
  ("id", "userId", "presentAddress", "permanentAddress", "age", "cashInHand", "hubId", "createdAt", "updatedAt")
VALUES
  ('019d7000-0400-7000-8000-000000000001', '019d7000-0000-7000-8000-000000000011', 'Mohammadpur, Dhaka', 'Tangail Sadar, Tangail', 28, 0.00, '019d7000-0200-7000-8000-000000000001', now(), now()),
  ('019d7000-0400-7000-8000-000000000002', '019d7000-0000-7000-8000-000000000012', 'Badda, Dhaka', 'Narayanganj Sadar, Narayanganj', 26, 0.00, '019d7000-0200-7000-8000-000000000002', now(), now()),
  ('019d7000-0400-7000-8000-000000000003', '019d7000-0000-7000-8000-000000000013', 'Halishahar, Chattogram', 'Feni Sadar, Feni', 30, 0.00, '019d7000-0200-7000-8000-000000000003', now(), now()),
  ('019d7000-0400-7000-8000-000000000004', '019d7000-0000-7000-8000-000000000014', 'Boalia, Rajshahi', 'Natore Sadar, Natore', 27, 0.00, '019d7000-0200-7000-8000-000000000004', now(), now()),
  ('019d7000-0400-7000-8000-000000000005', '019d7000-0000-7000-8000-000000000015', 'Zindabazar, Sylhet', 'Moulvibazar Sadar, Moulvibazar', 31, 0.00, '019d7000-0200-7000-8000-000000000005', now(), now())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "merchants"
  ("id", "userId", "businessName", "pickupAddress", "originAreaId", "averageRating", "balance", "creditLimit", "createdAt", "updatedAt")
VALUES
  ('019d7000-0500-7000-8000-000000000001', '019d7000-0000-7000-8000-000000000021',
   'Arif Electronics & Lifestyle', 'Shop 4, Bashundhara City, Panthapath, Dhaka',
   '019d7000-0300-7000-8000-000000000001', 4.70, 25000.00, 50000.00, now(), now())
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "categories"
  ("id", "name", "slug", "baseWeight", "baseFee", "isActive", "createdAt", "updatedAt")
VALUES
  ('019d7000-0600-7000-8000-000000000001', 'Document', 'document', 0.25, 30.00, true, now(), now()),
  ('019d7000-0600-7000-8000-000000000002', 'Parcel', 'parcel', 0.50, 50.00, true, now(), now()),
  ('019d7000-0600-7000-8000-000000000003', 'Fragile Item', 'fragile-item', 1.00, 80.00, true, now(), now()),
  ('019d7000-0600-7000-8000-000000000004', 'Grocery', 'grocery', 1.00, 60.00, true, now(), now())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "speeds"
  ("id", "name", "slug", "description", "baseFee", "slaHours", "isActive", "createdAt", "updatedAt")
VALUES
  ('019d7000-0700-7000-8000-000000000001', 'Standard', 'standard', 'Regular delivery service', 0.00, 72, true, now(), now()),
  ('019d7000-0700-7000-8000-000000000002', 'Express', 'express', 'Priority delivery service', 40.00, 24, true, now(), now())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "methods"
  ("id", "name", "slug", "type", "description", "isActive", "baseFee", "createdAt", "updatedAt")
VALUES
  ('019d7000-0800-7000-8000-000000000001', 'Merchant Pickup', 'merchant-pickup', 'PICKUP', 'Rider collects the parcel from the merchant', true, 0.00, now(), now()),
  ('019d7000-0800-7000-8000-000000000002', 'Drop Off', 'drop-off', 'PICKUP', 'Merchant drops the parcel at a hub', true, 0.00, now(), now()),
  ('019d7000-0800-7000-8000-000000000003', 'Home Delivery', 'home-delivery', 'DELIVERY', 'Delivery to recipient address', true, 20.00, now(), now()),
  ('019d7000-0800-7000-8000-000000000004', 'Hub Pickup', 'hub-pickup', 'DELIVERY', 'Recipient collects the parcel from a hub', true, 0.00, now(), now())
ON CONFLICT ("slug") DO NOTHING;

-- One active rule exists for every zone pair, category, speed, pickup method,
-- and delivery method. This gives the public pricing calculator full coverage.
INSERT INTO "pricing"
  ("id", "originalZoneId", "destinationZoneId", "categoryId", "speedId",
   "pickupMethodId", "deliveryMethodId", "minWeight", "maxWeight", "price",
   "isActive", "createdAt", "updatedAt")
SELECT
  ('019d7000-0900-7000-8000-' ||
   lpad((row_number() OVER (
     ORDER BY z1."id", z2."id", c."id", s."id", p."id", d."id"
   ))::text, 12, '0'))::uuid,
  z1."id", z2."id", c."id", s."id", p."id", d."id",
  c."baseWeight", 20.0,
  (c."baseFee" + s."baseFee" + p."baseFee" + d."baseFee" +
   CASE WHEN z1."id" = z2."id" THEN 0 ELSE 80 END)::numeric,
  true, now(), now()
FROM "zones" z1
CROSS JOIN "zones" z2
CROSS JOIN "categories" c
CROSS JOIN "speeds" s
CROSS JOIN "methods" p
CROSS JOIN "methods" d
WHERE p."type" = 'PICKUP'
  AND d."type" = 'DELIVERY'
ON CONFLICT (
  "originalZoneId", "destinationZoneId", "categoryId", "speedId",
  "pickupMethodId", "deliveryMethodId"
) DO NOTHING;

COMMIT;

