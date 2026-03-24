/*
  Warnings:

  - You are about to drop the column `notes` on the `tracking_logs` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `merchants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `riders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `tracking_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "merchants" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "riders" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "tracking_logs" DROP COLUMN "notes",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
