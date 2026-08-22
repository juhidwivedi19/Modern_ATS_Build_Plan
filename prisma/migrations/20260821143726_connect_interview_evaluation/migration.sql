/*
  Warnings:

  - You are about to drop the column `communnication` on the `InterviewEvaluation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[interviewerId]` on the table `InterviewEvaluation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `communication` to the `InterviewEvaluation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interviewerId` to the `InterviewEvaluation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "InterviewEvaluation" DROP COLUMN "communnication",
ADD COLUMN     "communication" INTEGER NOT NULL,
ADD COLUMN     "interviewerId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "InterviewEvaluation_interviewerId_key" ON "InterviewEvaluation"("interviewerId");

-- AddForeignKey
ALTER TABLE "InterviewEvaluation" ADD CONSTRAINT "InterviewEvaluation_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "InterviewInterviewer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
