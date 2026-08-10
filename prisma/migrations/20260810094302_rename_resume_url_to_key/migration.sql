/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `Resume` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fileKey]` on the table `Resume` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Resume_fileUrl_key";

-- AlterTable
ALTER TABLE "Resume" DROP COLUMN "fileUrl",
ADD COLUMN     "fileKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Resume_fileKey_key" ON "Resume"("fileKey");
