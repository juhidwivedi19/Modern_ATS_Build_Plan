-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('SCREENING', 'TECHNICAL', 'HR', 'MANAGERIAL');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Interview" (
    "id" SERIAL NOT NULL,
    "applicationId" INTEGER NOT NULL,
    "type" "InterviewType" NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "meetingLink" TEXT,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewInterviewer" (
    "id" SERIAL NOT NULL,
    "interviewId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "InterviewInterviewer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewInterviewer_interviewId_userId_key" ON "InterviewInterviewer"("interviewId", "userId");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewInterviewer" ADD CONSTRAINT "InterviewInterviewer_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewInterviewer" ADD CONSTRAINT "InterviewInterviewer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
