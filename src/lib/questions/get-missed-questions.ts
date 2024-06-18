import { prismaClient } from "@/src/utils/clients";
import { QuestionWithRoundData } from "@/src/utils/prisma-extensions";
import "server-only";

export async function getMissedQuestions(
  userId: string,
  take: number = 20,
): Promise<QuestionWithRoundData[]> {
  const questionIds: { id: number }[] = await prismaClient.$queryRaw`select q.id
    from "Question" q 
    inner join "UserQuestionTrack" uqt 
    ON uqt."questionId" = q.id 
    where uqt."userId" = ${userId} 
    group by q.id
    order by SUM(case uqt."result" when 'Incorrect' then 1 else 0 end) desc, 
    SUM(case when uqt."result" != 'Incomplete' then 1 else 0 end) asc
    limit ${take};`;
  if (questionIds.length === 0) {
    return [];
  }
  return prismaClient.question.findMany({
    where: {
      id: {
        in: questionIds.map(({ id }) => id),
      },
    },
    include: {
      category: true,
      round: {
        include: {
          alphabetRound: true,
          themeRound: true,
        },
      },
    },
  });
}
