import QuestionList from "@/components/display/QuestionList";
import getRoundName from "@/src/lib/round/get-round-name";
import { Prisma, PrismaClient } from "@prisma/client";
import { Card, Subtitle, Title } from "@tremor/react";
import Link from "next/link";

type RoundCardProps = {
  round: NonNullable<
    Prisma.Result<
      PrismaClient["round"],
      {
        include: {
          _count: {
            select: {
              questions: true;
            };
          };
          alphabetRound: true;
          themeRound: true;
          categoryTeamGroup: true;
          questions: true;
        };
      },
      "findFirst"
    >
  >;
};

export default function RoundCard(props: RoundCardProps) {
  const { fullName, roundType, name } = getRoundName(props.round);

  return (
    <Card key={props.round.id}>
      <Link href={`/static/round/${props.round.id}`}>
        <Title>{name ?? fullName}</Title>
        <Subtitle>{roundType}</Subtitle>
        <Subtitle>{props.round._count.questions} Questions</Subtitle>
      </Link>
      <hr className="my-2" />
      <Title>Sample Questions</Title>
      <QuestionList questions={props.round.questions} />
    </Card>
  );
}
