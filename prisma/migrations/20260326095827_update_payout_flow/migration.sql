/*
  Warnings:

  - You are about to drop the column `accountName` on the `payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `accountNumber` on the `payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `billingEmail` on the `payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `branchName` on the `payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `cardBrand` on the `payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `cardExpMonth` on the `payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `cardExpYear` on the `payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `cardLast4` on the `payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `providerName` on the `payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `routingNumber` on the `payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentMethodId` on the `payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentMethodType` on the `payment_accounts` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `payouts` table. All the data in the column will be lost.
  - You are about to drop the column `stripeEventId` on the `payouts` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeConnectAccountId]` on the table `payment_accounts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripeConnectAccountId` to the `payment_accounts` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "idx_payment_account_stripe_customer_id";

-- DropIndex
DROP INDEX "idx_payment_account_stripe_payment_method_id";

-- DropIndex
DROP INDEX "idx_payout_created_at";

-- AlterTable
ALTER TABLE "payment_accounts" DROP COLUMN "accountName",
DROP COLUMN "accountNumber",
DROP COLUMN "billingEmail",
DROP COLUMN "branchName",
DROP COLUMN "cardBrand",
DROP COLUMN "cardExpMonth",
DROP COLUMN "cardExpYear",
DROP COLUMN "cardLast4",
DROP COLUMN "providerName",
DROP COLUMN "routingNumber",
DROP COLUMN "stripeCustomerId",
DROP COLUMN "stripePaymentMethodId",
DROP COLUMN "stripePaymentMethodType",
ADD COLUMN     "stripeConnectAccountId" VARCHAR(255) NOT NULL,
ALTER COLUMN "providerType" SET DEFAULT 'STRIPE',
ALTER COLUMN "isActive" SET DEFAULT false;

-- AlterTable
ALTER TABLE "payouts" DROP COLUMN "paymentMethod",
DROP COLUMN "stripeEventId";

-- CreateIndex
CREATE UNIQUE INDEX "payment_accounts_stripeConnectAccountId_key" ON "payment_accounts"("stripeConnectAccountId");
