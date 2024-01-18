-- AlterTable
ALTER TABLE "AlphabetRound" ALTER COLUMN "letter" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "CategoryTeamGroup" ALTER COLUMN "team" SET DATA TYPE CHAR;

-- CreateTable
CREATE TABLE "ManagementTokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expiresOn" TIMESTAMP(3) NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ManagementTokens_pkey" PRIMARY KEY ("id")
);
