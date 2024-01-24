import QuestionList from "@/components/display/QuestionList";
import getRoundName from "@/src/lib/round/getRoundName";
import { prismaClient } from "@/src/utils/clients";
import { Card, Flex, Grid, Metric, Subtitle, Title } from "@tremor/react";
import Link from "next/link";

export default async function Page() {
  const rounds = await prismaClient.round.findMany({
    include: {
      questions: {
        take: 5,
      },
      alphabetRound: true,
      categoryTeamGroup: {
        include: {
          category: true,
        },
      },
      themeRound: true,
      sets: true,
      _count: {
        select: {
          questions: true,
        },
      },
    },
    orderBy: {
      createdOn: "desc",
    },
  });

  return (
    <Flex flexDirection="col" className="gap-4" alignItems="start">
      <Metric>Rounds</Metric>
      <Grid
        numItems={1}
        numItemsMd={3}
        className="gap-4 justify-normal items-stretch"
      >
        {rounds.map((round) => {
          const { fullName, roundType, name } = getRoundName(round);

          return (
            <Card key={round.id}>
              <Link href={`/static/round/${round.id}`}>
                <Title>{name ?? fullName}</Title>
                <Subtitle>{roundType}</Subtitle>
                <Subtitle>{round._count.questions} Questions</Subtitle>
              </Link>
              <hr className="my-2" />
              <Title>Sample Questions</Title>
              <QuestionList questions={round.questions} />
            </Card>
          );
        })}
      </Grid>
    </Flex>
  );
}
