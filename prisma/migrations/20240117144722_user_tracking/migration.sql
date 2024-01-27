/*
  Warnings:

  - The primary key for the `CategoryTeamGroup` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `int` on the `CategoryTeamGroup` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Result" AS ENUM ('Correct', 'Incorrect');

-- AlterTable
ALTER TABLE "AlphabetRound" ALTER COLUMN "letter" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "CategoryTeamGroup" DROP CONSTRAINT "CategoryTeamGroup_pkey",
DROP COLUMN "int",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "team" SET DATA TYPE CHAR,
ADD CONSTRAINT "CategoryTeamGroup_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "UserQuestionTrack" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" INTEGER,
    "result" "Result" NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserQuestionTrack_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserQuestionTrack" ADD CONSTRAINT "UserQuestionTrack_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
