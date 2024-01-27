/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `ManagementTokens` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "AlphabetRound" ALTER COLUMN "letter" SET DATA TYPE CHAR,
ALTER COLUMN "createdOn" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "modifiedOn" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "createdOn" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "modifiedOn" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "CategoryRound" ALTER COLUMN "createdOn" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "modifiedOn" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "CategoryTeamGroup" ALTER COLUMN "team" SET DATA TYPE CHAR,
ALTER COLUMN "createdOn" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "modifiedOn" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "ManagementTokens" ALTER COLUMN "expiresOn" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "createdOn" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "Question" ALTER COLUMN "createdOn" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "modifiedOn" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "Round" ALTER COLUMN "createdOn" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "modifiedOn" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "Set" ALTER COLUMN "createdOn" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "modifiedOn" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "ThemeRound" ALTER COLUMN "createdOn" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "modifiedOn" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "UserQuestionTrack" ALTER COLUMN "createdOn" SET DATA TYPE TIMESTAMPTZ(3);

-- CreateIndex
CREATE UNIQUE INDEX "ManagementTokens_token_key" ON "ManagementTokens"("token");
