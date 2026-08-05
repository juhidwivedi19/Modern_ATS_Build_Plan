-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Permission" ADD VALUE 'JOB_VIEW';
ALTER TYPE "Permission" ADD VALUE 'JOB_CREATE';
ALTER TYPE "Permission" ADD VALUE 'JOB_UPDATE';
ALTER TYPE "Permission" ADD VALUE 'JOB_PUBLISH';
ALTER TYPE "Permission" ADD VALUE 'JOB_ARCHIVE';
