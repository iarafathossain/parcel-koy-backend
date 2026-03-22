/*
  Warnings:

  - You are about to drop the column `weight` on the `parcels` table. All the data in the column will be lost.
  - Added the required column `declaredWeight` to the `parcels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "parcels" DROP COLUMN "weight",
ADD COLUMN     "actualWeight" DOUBLE PRECISION,
ADD COLUMN     "declaredWeight" DOUBLE PRECISION NOT NULL;
