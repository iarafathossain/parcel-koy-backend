/*
  Warnings:

  - You are about to drop the column `methodId` on the `parcels` table. All the data in the column will be lost.
  - Added the required column `type` to the `methods` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryMethodId` to the `parcels` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupMethodId` to the `parcels` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MethodType" AS ENUM ('PICKUP', 'DELIVERY');

-- DropForeignKey
ALTER TABLE "parcels" DROP CONSTRAINT "parcels_methodId_fkey";

-- AlterTable
ALTER TABLE "methods" ADD COLUMN     "type" "MethodType" NOT NULL;

-- AlterTable
ALTER TABLE "parcels" DROP COLUMN "methodId",
ADD COLUMN     "deliveryMethodId" UUID NOT NULL,
ADD COLUMN     "pickupMethodId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_pickupMethodId_fkey" FOREIGN KEY ("pickupMethodId") REFERENCES "methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_deliveryMethodId_fkey" FOREIGN KEY ("deliveryMethodId") REFERENCES "methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
