-- CreateTable
CREATE TABLE "cash_collections" (
    "id" UUID NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "riderId" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "hubId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_collections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_cash_rider_id" ON "cash_collections"("riderId");

-- CreateIndex
CREATE INDEX "idx_cash_admin_id" ON "cash_collections"("adminId");

-- CreateIndex
CREATE INDEX "idx_cash_hub_id" ON "cash_collections"("hubId");

-- AddForeignKey
ALTER TABLE "cash_collections" ADD CONSTRAINT "cash_collections_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "riders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_collections" ADD CONSTRAINT "cash_collections_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_collections" ADD CONSTRAINT "cash_collections_hubId_fkey" FOREIGN KEY ("hubId") REFERENCES "hubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
