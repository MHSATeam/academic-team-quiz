import RoundCard from "@/components/utils/RoundCard";
import { prismaClient } from "@/src/utils/clients";
import { Flex, Grid, Metric } from "@tremor/react";

export default async function Page() {
  const rounds = await prismaClient.round.findMany({
    include: {
      questions: {
        take: 5,
      },
      alphabetRound: true,
      categoryTeamGroup: true,
      themeRound: true,
      sets: true,
      _count: {
        select: {
          questions: true,
        },
      },
    },
    orderBy: [
      {
        createdOn: "desc",
      },
      {
        id: "asc",
      },
    ],
  });

  return (
    <Flex flexDirection="col" className="gap-4" alignItems="start">
      <Metric>Rounds</Metric>
      <Grid
        numItems={1}
        numItemsMd={3}
        className="items-stretch justify-normal gap-4"
      >
        {rounds.map((round) => {
          return <RoundCard key={round.id} round={round} />;
        })}
      </Grid>
    </Flex>
  );
}
