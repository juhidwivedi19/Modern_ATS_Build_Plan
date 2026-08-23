-- CreateTable
CREATE TABLE "InterviewEvaluationCommentMention" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewEvaluationCommentMention_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewEvaluationCommentMention_commentId_userId_key" ON "InterviewEvaluationCommentMention"("commentId", "userId");

-- AddForeignKey
ALTER TABLE "InterviewEvaluationCommentMention" ADD CONSTRAINT "InterviewEvaluationCommentMention_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "InterviewEvaluationComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewEvaluationCommentMention" ADD CONSTRAINT "InterviewEvaluationCommentMention_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
