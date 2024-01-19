import QuestionDisplay from "@/components/utils/QuestionDisplay";
import { prismaClient } from "@/src/utils/clients";
import { Subtitle, Title } from "@tremor/react";
import Link from "next/link";

export default async function Page({ params }: { params: { id: string } }) {
  const numberId = parseInt(params.id);
  if (Number.isNaN(numberId)) {
    return null;
  }

  const question = await prismaClient.question.findFirst({
    where: {
      id: numberId,
    },
    include: {
      category: true,
      round: {
        include: {
          sets: true,
        },
      },
    },
  });

  if (question === null) {
    return null;
  }

  return (
    <main className="py-12 px-6">
      <span className="dark:text-white text-2xl">
        Question Id: #{question.id}
      </span>
      <Title>
        Category:{" "}
        <Link
          href={`/category/${question.categoryId}`}
          className="text-blue-500"
        >
          {question.category.name}
        </Link>
      </Title>
      {question.round && (
        <Title>
          Part of a round:{" "}
          <Link href={`/round/${question.roundId}`} className="text-blue-500">
            {question.round.name}
          </Link>
        </Title>
      )}
      <hr className="my-2" />
      <QuestionDisplay question={question} />
      {/* <pre className="dark:text-white">{JSON.stringify(question, null, 2)}</pre> */}
    </main>
  );
}
