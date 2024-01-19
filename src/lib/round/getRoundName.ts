import { Prisma, PrismaClient, Round } from "@prisma/client";

export default function getRoundName(
  round: NonNullable<
    Prisma.Result<
      PrismaClient["round"],
      {
        include: {
          alphabetRound: true;
          themeRound: true;
          categoryTeamGroup: true;
        };
      },
      "findFirst"
    >
  >
) {
  let roundType: string;

  if (round.alphabetRound) {
    roundType = "Alphabet Round";
  } else if (round.categoryTeamGroup) {
    roundType = "Category Round";
  } else if (round.themeRound) {
    roundType = "Theme Round";
  } else {
    roundType = "Lightning Round";
  }
  let fullName: string;
  if (round.name) {
    fullName = `${roundType}: ${round.name}`;
  } else {
    fullName = roundType;
  }

  return {
    roundType,
    fullName,
    name: round.name,
  };
}
