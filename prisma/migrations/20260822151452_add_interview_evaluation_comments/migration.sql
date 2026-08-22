-- CreateTable
CREATE TABLE "InterviewEvaluationComment" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewEvaluationComment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InterviewEvaluationComment" ADD CONSTRAINT "InterviewEvaluationComment_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "InterviewEvaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewEvaluationComment" ADD CONSTRAINT "InterviewEvaluationComment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
