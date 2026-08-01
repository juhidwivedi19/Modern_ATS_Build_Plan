-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrganizationRole" ADD VALUE 'ADMIN';
ALTER TYPE "OrganizationRole" ADD VALUE 'RECRUITER';
ALTER TYPE "OrganizationRole" ADD VALUE 'INTERVIEWER';

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "companySize" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "website" TEXT,
ALTER COLUMN "name" DROP NOT NULL;
