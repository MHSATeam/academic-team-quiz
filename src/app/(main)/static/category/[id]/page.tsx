import QuestionList from "@/components/display/QuestionList";
import { prismaClient } from "@/src/utils/clients";
import { Divider, Title } from "@tremor/react";
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

  const category = await prismaClient.category.findFirst({
    where: {
      id: numberId,
    },
    include: {
      questions: {
        skip: QuestionsPerPage * (pageNumber - 1),
        take: 20,
      },
      _count: {
        select: {
          questions: true,
        },
      },
    },
  });

  if (category === null) {
    return redirect("/404");
  }

  const totalPages = Math.ceil(category._count.questions / QuestionsPerPage);

  return (
    <div className="flex flex-col">
      <span className="dark:text-white text-2xl">
        Category: {category.name}
      </span>
      <Divider />
      <Title>Related Questions:</Title>
      <QuestionList questions={category.questions} totalPages={totalPages} />
    </div>
  );
}
