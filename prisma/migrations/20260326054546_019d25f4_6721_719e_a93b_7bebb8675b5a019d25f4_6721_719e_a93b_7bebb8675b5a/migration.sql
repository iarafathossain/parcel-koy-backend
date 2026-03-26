-- AlterTable
ALTER TABLE "payouts" ADD COLUMN     "paymentGatewayData" JSONB,
ADD COLUMN     "stripeEventId" VARCHAR(300);
