-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ActivityAction" ADD VALUE 'JOB_CREATED';
ALTER TYPE "ActivityAction" ADD VALUE 'APPLICATION_SUBMITTED';
ALTER TYPE "ActivityAction" ADD VALUE 'RESUME_UPLOADED';
ALTER TYPE "ActivityAction" ADD VALUE 'INTERVIEW_SCHEDULED';
ALTER TYPE "ActivityAction" ADD VALUE 'FEEDBACK_ADDED';
ALTER TYPE "ActivityAction" ADD VALUE 'OFFER_SENT';
