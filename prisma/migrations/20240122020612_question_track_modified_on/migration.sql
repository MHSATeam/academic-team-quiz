-- AlterTable
ALTER TABLE "AlphabetRound" ALTER COLUMN "letter" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "CategoryTeamGroup" ALTER COLUMN "team" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "UserQuestionTrack" ADD COLUMN     "modifiedOn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
