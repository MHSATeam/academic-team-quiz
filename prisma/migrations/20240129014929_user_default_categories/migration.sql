-- AlterTable
ALTER TABLE "AlphabetRound" ALTER COLUMN "letter" SET DATA TYPE CHAR;

-- AlterTable
ALTER TABLE "CategoryTeamGroup" ALTER COLUMN "team" SET DATA TYPE CHAR;

-- CreateTable
CREATE TABLE "UserDefaultCategories" (
    "userId" TEXT NOT NULL,
    "modifiedOn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserDefaultCategories_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "_CategoryToUserDefaultCategories" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToUserDefaultCategories_AB_unique" ON "_CategoryToUserDefaultCategories"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToUserDefaultCategories_B_index" ON "_CategoryToUserDefaultCategories"("B");

-- AddForeignKey
ALTER TABLE "_CategoryToUserDefaultCategories" ADD CONSTRAINT "_CategoryToUserDefaultCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToUserDefaultCategories" ADD CONSTRAINT "_CategoryToUserDefaultCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "UserDefaultCategories"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
