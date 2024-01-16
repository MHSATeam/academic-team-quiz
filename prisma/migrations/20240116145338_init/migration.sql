-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdYear" SMALLINT NOT NULL,
    "catagoryId" INTEGER NOT NULL,
    "roundId" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Set" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "author" TEXT,
    "difficulty" INTEGER NOT NULL,
    "categoryRoundId" INTEGER,
    "alphabetRoundId" INTEGER,
    "lightningRoundId" INTEGER,
    "themeRoundId" INTEGER,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Catagory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Catagory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AlphabetRound" (
    "roundId" INTEGER NOT NULL,
    "letter" CHAR NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlphabetRound_pkey" PRIMARY KEY ("roundId")
);

-- CreateTable
CREATE TABLE "ThemeRound" (
    "roundId" INTEGER NOT NULL,
    "theme" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ThemeRound_pkey" PRIMARY KEY ("roundId")
);

-- CreateTable
CREATE TABLE "CategoryRound" (
    "id" SERIAL NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryTeamGroup" (
    "int" SERIAL NOT NULL,
    "team" CHAR NOT NULL,
    "roundId" INTEGER NOT NULL,
    "categoryRoundId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modifiedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CategoryTeamGroup_pkey" PRIMARY KEY ("int")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryTeamGroup_roundId_key" ON "CategoryTeamGroup"("roundId");

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_catagoryId_fkey" FOREIGN KEY ("catagoryId") REFERENCES "Catagory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_categoryRoundId_fkey" FOREIGN KEY ("categoryRoundId") REFERENCES "CategoryRound"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_alphabetRoundId_fkey" FOREIGN KEY ("alphabetRoundId") REFERENCES "AlphabetRound"("roundId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_lightningRoundId_fkey" FOREIGN KEY ("lightningRoundId") REFERENCES "Round"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_themeRoundId_fkey" FOREIGN KEY ("themeRoundId") REFERENCES "ThemeRound"("roundId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlphabetRound" ADD CONSTRAINT "AlphabetRound_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ThemeRound" ADD CONSTRAINT "ThemeRound_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTeamGroup" ADD CONSTRAINT "CategoryTeamGroup_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTeamGroup" ADD CONSTRAINT "CategoryTeamGroup_categoryRoundId_fkey" FOREIGN KEY ("categoryRoundId") REFERENCES "CategoryRound"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoryTeamGroup" ADD CONSTRAINT "CategoryTeamGroup_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Catagory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
