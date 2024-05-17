import { Prisma, PrismaClient } from "@prisma/client";

export default function getSets(
  round: NonNullable<
    Prisma.Result<
      PrismaClient["round"],
      {
        include: {
          alphabetRound: {
            include: {
              sets: true;
            };
          };
          categoryTeamGroup: {
            include: {
              categoryRound: {
                include: {
                  sets: true;
                };
              };
            };
          };
          themeRound: {
            include: {
              sets: true;
            };
          };
          sets: true;
        };
      },
      "findFirst"
    >
  >,
) {
  if (round.sets.length > 0) {
    return round.sets;
  }

  if (
    round.categoryTeamGroup &&
    round.categoryTeamGroup.categoryRound.sets.length > 0
  ) {
    return round.categoryTeamGroup.categoryRound.sets;
  }

  if (round.alphabetRound && round.alphabetRound.sets.length > 0) {
    return round.alphabetRound.sets;
  }

  if (round.themeRound && round.themeRound.sets.length > 0) {
    return round.themeRound.sets;
  }
  return [];
}
