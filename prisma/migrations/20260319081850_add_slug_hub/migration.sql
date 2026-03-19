/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `hubs` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `hubs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "hubs" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "hubs_slug_key" ON "hubs"("slug");
