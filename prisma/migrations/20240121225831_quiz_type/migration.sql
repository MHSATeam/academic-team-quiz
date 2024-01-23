/*
  Warnings:

  - Added the required column `quiz` to the `UserQuizSession` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuizType" AS ENUM ('Flashcards', 'Written', 'Test');

-- AlterTable
ALTER TABLE "AlphabetRound" ALTER COLUMN "letter" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "CategoryTeamGroup" ALTER COLUMN "team" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "UserQuizSession" ADD COLUMN     "quizType" "QuizType" NOT NULL;
