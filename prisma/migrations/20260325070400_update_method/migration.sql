/*
  Warnings:

  - You are about to drop the column `methodId` on the `pricing` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[originalZoneId,destinationZoneId,categoryId,speedId,pickupMethodId,deliveryMethodId]` on the table `pricing` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deliveryMethodId` to the `pricing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pickupMethodId` to the `pricing` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "pricing" DROP CONSTRAINT "pricing_methodId_fkey";

-- DropIndex
DROP INDEX "pricing_originalZoneId_destinationZoneId_categoryId_speedId_key";

-- AlterTable
ALTER TABLE "pricing" DROP COLUMN "methodId",
ADD COLUMN     "deliveryMethodId" UUID NOT NULL,
ADD COLUMN     "pickupMethodId" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "pricing_originalZoneId_destinationZoneId_categoryId_speedId_key" ON "pricing"("originalZoneId", "destinationZoneId", "categoryId", "speedId", "pickupMethodId", "deliveryMethodId");

-- AddForeignKey
ALTER TABLE "pricing" ADD CONSTRAINT "pricing_pickupMethodId_fkey" FOREIGN KEY ("pickupMethodId") REFERENCES "methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing" ADD CONSTRAINT "pricing_deliveryMethodId_fkey" FOREIGN KEY ("deliveryMethodId") REFERENCES "methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
