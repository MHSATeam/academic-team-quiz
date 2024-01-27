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
  const name = round.name && round.name.length > 0 ? round.name : null;
  let fullName: string;
  if (name) {
    fullName = `${roundType}: ${name}`;
  } else {
    fullName = `${roundType}: Unnamed`;
  }

  return {
    roundType,
    fullName,
    name,
  };
}
