/*
  Warnings:

  - You are about to drop the column `categoryId` on the `CategoryTeamGroup` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CategoryTeamGroup" DROP CONSTRAINT "CategoryTeamGroup_categoryId_fkey";

-- AlterTable
ALTER TABLE "AlphabetRound" ALTER COLUMN "letter" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "CategoryTeamGroup" DROP COLUMN "categoryId",
ALTER COLUMN "team" SET DATA TYPE CHAR;
