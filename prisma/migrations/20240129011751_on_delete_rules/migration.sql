-- DropForeignKey
ALTER TABLE "AlphabetRound" DROP CONSTRAINT "AlphabetRound_roundId_fkey";

-- DropForeignKey
ALTER TABLE "CategoryTeamGroup" DROP CONSTRAINT "CategoryTeamGroup_categoryRoundId_fkey";

-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_roundId_fkey";

-- DropForeignKey
ALTER TABLE "ThemeRound" DROP CONSTRAINT "ThemeRound_roundId_fkey";

-- AlterTable
ALTER TABLE "AlphabetRound" ALTER COLUMN "letter" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "CategoryTeamGroup" ALTER COLUMN "team" SET DATA TYPE CHAR;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlphabetRound" ADD CONSTRAINT "AlphabetRound_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeRound" ADD CONSTRAINT "ThemeRound_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTeamGroup" ADD CONSTRAINT "CategoryTeamGroup_categoryRoundId_fkey" FOREIGN KEY ("categoryRoundId") REFERENCES "CategoryRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;
