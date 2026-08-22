-- CreateTable
CREATE TABLE "InterviewEvaluationNote" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewEvaluationNote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "InterviewEvaluationNote" ADD CONSTRAINT "InterviewEvaluationNote_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "InterviewEvaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewEvaluationNote" ADD CONSTRAINT "InterviewEvaluationNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
