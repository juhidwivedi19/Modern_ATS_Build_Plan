/*
  Warnings:

  - You are about to drop the column `resetPasswordExpires` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verificationToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "resetPasswordExpires",
DROP COLUMN "resetPasswordToken",
DROP COLUMN "verificationToken";

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
