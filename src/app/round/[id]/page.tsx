import QuestionList from "@/components/display/QuestionList";
import getRoundName from "@/src/lib/round/getRoundName";
import { prismaClient } from "@/src/utils/clients";
import { Flex, List, ListItem, Subtitle, Text, Title } from "@tremor/react";
import Link from "next/link";

export default async function Page({ params }: { params: { id: string } }) {
  const numberId = parseInt(params.id);
  if (Number.isNaN(numberId)) {
    return null;
  }

  const round = await prismaClient.round.findFirst({
    where: {
      id: numberId,
    },
    include: {
      questions: {
        take: 20,
      },
      _count: {
        select: {
          questions: true,
        },
      },
      alphabetRound: true,
      categoryTeamGroup: {
        include: {
          category: true,
        },
      },
      themeRound: true,
      sets: true,
    },
  });

  if (!round) {
    return null;
  }

  return (
    <main className="py-12 px-6">
      <span className="dark:text-white text-2xl">
        {getRoundName(round).roundType}
      </span>
      {round.name && <Title>{round.name}</Title>}
      {round.sets.length > 0 && (
        <>
          <hr className="my-2" />
          <Title>Connected Sets:</Title>
          <List>
            {round.sets.map((set) => (
              <ListItem key={set.id}>
                <Link href={`/set/${set.id}`}>
                  <Flex className="gap-2">
                    <Title>#{set.id}</Title>
                    <Text>{set.name}</Text>
                  </Flex>
                </Link>
              </ListItem>
            ))}
          </List>
        </>
      )}
      <hr className="my-2" />
      <Title>Questions:</Title>
      <QuestionList
        questions={round.questions}
        totalQuestions={round._count.questions}
      />
      <pre className="dark:text-white">{JSON.stringify(round, null, 2)}</pre>
    </main>
  );
}
