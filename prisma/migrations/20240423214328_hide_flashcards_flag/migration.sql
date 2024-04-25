-- AlterTable
ALTER TABLE "AlphabetRound" ALTER COLUMN "letter" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "CategoryTeamGroup" ALTER COLUMN "team" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "hideInFlashcards" BOOLEAN NOT NULL DEFAULT false;
