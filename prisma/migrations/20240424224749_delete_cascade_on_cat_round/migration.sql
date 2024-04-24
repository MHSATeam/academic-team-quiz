-- DropForeignKey
ALTER TABLE "CategoryTeamGroup" DROP CONSTRAINT "CategoryTeamGroup_roundId_fkey";

-- AlterTable
ALTER TABLE "AlphabetRound" ALTER COLUMN "letter" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "CategoryTeamGroup" ALTER COLUMN "team" SET DATA TYPE CHAR;

-- AddForeignKey
ALTER TABLE "CategoryTeamGroup" ADD CONSTRAINT "CategoryTeamGroup_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;
