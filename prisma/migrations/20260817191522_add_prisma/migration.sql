-- DropForeignKey
ALTER TABLE "ActivityLog" DROP CONSTRAINT "ActivityLog_performedById_fkey";

-- AddForeignKey
ALTER TABLE "ActivityLog" ADD CONSTRAINT "ActivityLog_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
