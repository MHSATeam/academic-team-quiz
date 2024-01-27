-- AlterEnum
ALTER TYPE "Result" ADD VALUE 'Incomplete';

-- AlterTable
ALTER TABLE "AlphabetRound" ALTER COLUMN "letter" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "CategoryTeamGroup" ALTER COLUMN "team" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "UserQuestionTrack" ADD COLUMN     "quizSessionId" INTEGER;

-- CreateTable
CREATE TABLE "UserQuizSession" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "completedOn" TIMESTAMPTZ(3),
    "createdOn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserQuizSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToUserQuizSession" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToUserQuizSession_AB_unique" ON "_CategoryToUserQuizSession"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToUserQuizSession_B_index" ON "_CategoryToUserQuizSession"("B");

-- AddForeignKey
ALTER TABLE "UserQuestionTrack" ADD CONSTRAINT "UserQuestionTrack_quizSessionId_fkey" FOREIGN KEY ("quizSessionId") REFERENCES "UserQuizSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToUserQuizSession" ADD CONSTRAINT "_CategoryToUserQuizSession_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToUserQuizSession" ADD CONSTRAINT "_CategoryToUserQuizSession_B_fkey" FOREIGN KEY ("B") REFERENCES "UserQuizSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
