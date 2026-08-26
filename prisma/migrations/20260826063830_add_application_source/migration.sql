-- CreateEnum
CREATE TYPE "ApplicationSource" AS ENUM ('DIRECT', 'LINKEDIN', 'REFERRAL', 'JOB_BOARD', 'COMPANY_WEBSITE', 'OTHER');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "source" "ApplicationSource" NOT NULL DEFAULT 'DIRECT';
