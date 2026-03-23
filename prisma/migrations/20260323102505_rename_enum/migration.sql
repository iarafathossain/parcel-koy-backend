/*
  Warnings:

  - The values [RECEIVED_AT_DEST_HUB] on the enum `ParcelStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ParcelStatus_new" AS ENUM ('REQUESTED', 'PICKUP_RIDER_ASSIGNED', 'PICKED_UP', 'PICKUP_FAILED', 'RECEIVED_AT_ORIGIN_HUB', 'IN_TRANSIT', 'RECEIVED_AT_DESTINATION_HUB', 'OUT_FOR_DELIVERY', 'DELIVERED', 'PARTIAL_DELIVERY', 'DELIVERY_FAILED', 'ON_HOLD', 'RETURNED_TO_MERCHANT', 'CANCELLED');
ALTER TABLE "public"."parcels" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "parcels" ALTER COLUMN "status" TYPE "ParcelStatus_new" USING ("status"::text::"ParcelStatus_new");
ALTER TABLE "tracking_logs" ALTER COLUMN "status" TYPE "ParcelStatus_new" USING ("status"::text::"ParcelStatus_new");
ALTER TYPE "ParcelStatus" RENAME TO "ParcelStatus_old";
ALTER TYPE "ParcelStatus_new" RENAME TO "ParcelStatus";
DROP TYPE "public"."ParcelStatus_old";
ALTER TABLE "parcels" ALTER COLUMN "status" SET DEFAULT 'REQUESTED';
COMMIT;
