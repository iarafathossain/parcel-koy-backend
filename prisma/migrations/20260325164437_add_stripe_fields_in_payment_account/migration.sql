-- AlterEnum
ALTER TYPE "PaymentProviderType" ADD VALUE 'STRIPE';

-- AlterTable
ALTER TABLE "payment_accounts" ADD COLUMN     "billingEmail" VARCHAR(320),
ADD COLUMN     "cardBrand" VARCHAR(100),
ADD COLUMN     "cardExpMonth" INTEGER,
ADD COLUMN     "cardExpYear" INTEGER,
ADD COLUMN     "cardLast4" VARCHAR(4),
ADD COLUMN     "stripeCustomerId" VARCHAR(255),
ADD COLUMN     "stripePaymentMethodId" VARCHAR(255),
ADD COLUMN     "stripePaymentMethodType" VARCHAR(100);

-- CreateIndex
CREATE INDEX "idx_payment_account_stripe_customer_id" ON "payment_accounts"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "idx_payment_account_stripe_payment_method_id" ON "payment_accounts"("stripePaymentMethodId");
