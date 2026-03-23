/*
  Warnings:

  - You are about to drop the column `note` on the `parcels` table. All the data in the column will be lost.
  - You are about to drop the column `noteById` on the `parcels` table. All the data in the column will be lost.
  - You are about to drop the column `noteCreatedAt` on the `parcels` table. All the data in the column will be lost.

*/

-- DropForeignKey
ALTER TABLE "parcels" DROP CONSTRAINT IF EXISTS "parcels_noteById_fkey";

-- CreateTable
CREATE TABLE "notes" (
    "id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "parcelId" UUID NOT NULL,
    "createdById" UUID NOT NULL,

    CONSTRAINT "notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_note_parcel_id" ON "notes"("parcelId");

-- CreateIndex
CREATE INDEX "idx_note_created_by_id" ON "notes"("createdById");

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_parcelId_fkey" FOREIGN KEY ("parcelId") REFERENCES "parcels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "parcels"
DROP COLUMN IF EXISTS "note",
DROP COLUMN IF EXISTS "noteById",
DROP COLUMN IF EXISTS "noteCreatedAt";
