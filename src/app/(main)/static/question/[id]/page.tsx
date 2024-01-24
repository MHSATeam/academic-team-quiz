import QuestionDisplay from "@/components/display/QuestionDisplay";
import { prismaClient } from "@/src/utils/clients";
import { Subtitle, Title } from "@tremor/react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page({ params }: { params: { id: string } }) {
  const numberId = parseInt(params.id);
  if (Number.isNaN(numberId)) {
    return redirect("/404");
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
    return redirect("/404");
  }

  return (
    <>
      <span className="dark:text-white text-2xl">
        Question Id: #{question.id}
      </span>
      <Title>
        Category:{" "}
        <Link
          href={`/static/category/${question.categoryId}`}
          className="text-blue-500"
        >
          {question.category.name}
        </Link>
      </Title>
      {question.round && (
        <Title>
          Part of a round:{" "}
          <Link
            href={`/static/round/${question.roundId}`}
            className="text-blue-500"
          >
            {question.round.name}
          </Link>
        </Title>
      )}
      <Title>Created in: {question.createdYear}</Title>
      <hr className="my-2" />
      <QuestionDisplay question={question} />
    </>
  );
}
