/*
  Warnings:

  - You are about to drop the column `notes` on the `parcels` table. All the data in the column will be lost.
  - You are about to drop the column `notesById` on the `parcels` table. All the data in the column will be lost.
  - You are about to drop the column `notesCreatedAt` on the `parcels` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "parcels" DROP CONSTRAINT "parcels_notesById_fkey";

-- AlterTable
ALTER TABLE "parcels" DROP COLUMN "notes",
DROP COLUMN "notesById",
DROP COLUMN "notesCreatedAt",
ADD COLUMN     "note" TEXT,
ADD COLUMN     "noteById" UUID,
ADD COLUMN     "noteCreatedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_noteById_fkey" FOREIGN KEY ("noteById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
