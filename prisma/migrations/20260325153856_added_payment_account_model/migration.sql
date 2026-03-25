/*
  Warnings:

  - Added the required column `paymentAccountId` to the `payouts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentProviderType" AS ENUM ('BANK', 'BKASH', 'NAGAD', 'ROCKET');

-- AlterTable
ALTER TABLE "payouts" ADD COLUMN     "paymentAccountId" UUID NOT NULL;

-- CreateTable
CREATE TABLE "payment_accounts" (
    "id" UUID NOT NULL,
    "merchantId" UUID NOT NULL,
    "providerType" "PaymentProviderType" NOT NULL,
    "providerName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "branchName" TEXT,
    "routingNumber" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_payment_account_merchant_id" ON "payment_accounts"("merchantId");

-- AddForeignKey
ALTER TABLE "payment_accounts" ADD CONSTRAINT "payment_accounts_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_paymentAccountId_fkey" FOREIGN KEY ("paymentAccountId") REFERENCES "payment_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
