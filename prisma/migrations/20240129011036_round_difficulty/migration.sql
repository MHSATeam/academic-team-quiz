/*
  Warnings:

  - You are about to drop the column `difficulty` on the `Set` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AlphabetRound" ALTER COLUMN "letter" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "CategoryTeamGroup" ALTER COLUMN "team" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "Round" ADD COLUMN     "difficulty" SMALLINT NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Set" DROP COLUMN "difficulty";
