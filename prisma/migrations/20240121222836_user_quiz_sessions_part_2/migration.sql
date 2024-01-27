-- AlterTable
ALTER TABLE "AlphabetRound" ALTER COLUMN "letter" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "CategoryTeamGroup" ALTER COLUMN "team" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "UserQuestionTrack" ALTER COLUMN "result" SET DEFAULT 'Incomplete';
