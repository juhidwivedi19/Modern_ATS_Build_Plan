-- CreateEnum
CREATE TYPE "ResumeProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "processingStatus" "ResumeProcessingStatus" NOT NULL DEFAULT 'PENDING';
