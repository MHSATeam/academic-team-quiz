import QuestionList from "@/components/display/QuestionList";
import getRoundName from "@/src/lib/round/getRoundName";
import getSets from "@/src/lib/round/getSets";
import { prismaClient } from "@/src/utils/clients";
import { Flex, List, ListItem, Subtitle, Text, Title } from "@tremor/react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page: string };
}) {
  const numberId = parseInt(params.id);
  const pageNumber = Number(searchParams.page ?? "1");
  if (Number.isNaN(numberId)) {
    return redirect("/404");
  }

  const QuestionsPerPage = 20;

  const round = await prismaClient.round.findFirst({
    where: {
      id: numberId,
    },
    include: {
      questions: {
        skip: QuestionsPerPage * (pageNumber - 1),
        take: QuestionsPerPage,
      },
      _count: {
        select: {
          questions: true,
        },
      },
      alphabetRound: {
        include: {
          sets: true,
        },
      },
      categoryTeamGroup: {
        include: {
          categoryRound: {
            include: {
              sets: true,
            },
          },
        },
      },
      themeRound: {
        include: {
          sets: true,
        },
      },
      sets: true,
    },
  });

  if (!round) {
    return redirect("/404");
  }

  const totalPages = Math.ceil(round._count.questions / QuestionsPerPage);

  const sets = getSets(round);

  return (
    <>
      <span className="text-2xl dark:text-white">
        {getRoundName(round).roundType}
      </span>
      {round.name && <Title>{round.name}</Title>}
      {round.alphabetRound && (
        <Title>Letter: {round.alphabetRound.letter.toUpperCase()}</Title>
      )}
      {round.themeRound && (
        <>
          <Title>Theme:</Title>
          <Subtitle>{round.themeRound.theme}</Subtitle>
        </>
      )}
      {sets.length > 0 && (
        <>
          <hr className="my-2" />
          <Title>Connected Sets:</Title>
          <List>
            {sets.map((set) => (
              <ListItem key={set.id}>
                <Link href={`/static/set/${set.id}`}>
                  <Flex className="gap-2">
                    <Title>#{set.id}</Title>
                    <Text color="blue">{set.name}</Text>
                  </Flex>
                </Link>
              </ListItem>
            ))}
          </List>
        </>
      )}
      <hr className="my-2" />
      <Title>Questions:</Title>
      <QuestionList questions={round.questions} totalPages={totalPages} />
    </>
  );
}
