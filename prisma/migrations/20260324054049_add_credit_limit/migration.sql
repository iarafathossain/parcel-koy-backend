-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'COMPLETED', 'REJECTED');

-- AlterTable
ALTER TABLE "merchants" ADD COLUMN     "balance" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN     "creditLimit" DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- CreateTable
CREATE TABLE "payouts" (
    "id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" VARCHAR(300),
    "paymentMethod" TEXT,
    "adminNote" TEXT,
    "merchantId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_payout_merchant_id" ON "payouts"("merchantId");

-- CreateIndex
CREATE INDEX "idx_payout_status" ON "payouts"("status");

-- CreateIndex
CREATE INDEX "idx_payout_created_at" ON "payouts"("createdAt");

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
