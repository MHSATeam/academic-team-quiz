import QuestionList from "@/components/display/QuestionList";
import { prismaClient } from "@/src/utils/clients";
import { Title } from "@tremor/react";

export default async function Page({ params }: { params: { id: string } }) {
  const numberId = parseInt(params.id);
  if (Number.isNaN(numberId)) {
    return null;
  }

  const category = await prismaClient.category.findFirst({
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
    },
  });

  if (category === null) {
    return null;
  }

  return (
    <main className="py-12 px-6 flex flex-col">
      <span className="dark:text-white text-2xl">
        Category: {category.name}
      </span>
      <hr className="my-2" />
      <Title>Related Questions:</Title>
      <QuestionList
        questions={category.questions}
        totalQuestions={category._count.questions}
      />
    </main>
  );
}
