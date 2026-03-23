-- AlterTable
ALTER TABLE "parcels" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledById" UUID,
ADD COLUMN     "notesById" UUID,
ADD COLUMN     "notesCreatedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_notesById_fkey" FOREIGN KEY ("notesById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
