/*
  Warnings:

  - You are about to drop the column `areaId` on the `hubs` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "hubs" DROP CONSTRAINT "hubs_areaId_fkey";

-- AlterTable
ALTER TABLE "areas" ADD COLUMN     "hubID" UUID;

-- AlterTable
ALTER TABLE "hubs" DROP COLUMN "areaId";

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_hubID_fkey" FOREIGN KEY ("hubID") REFERENCES "hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
