-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "education" JSONB,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "experience" JSONB,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "projects" JSONB,
ADD COLUMN     "skills" JSONB;
