import { prismaClient } from "@/src/utils/clients";
import { Category } from "@prisma/client";
import "server-only";

export async function getCategoryBreakdown(
  userId: string,
): Promise<(Category & { questionCount: number; correctCount: number })[]> {
  return (
    (await prismaClient.$queryRaw`SELECT c.id, c."name", c."createdOn", c."modifiedOn",
  count(q.*) as "questionCount",
  sum(case uqt."result" when 'Correct' then 1 else 0 end) as "correctCount"
  FROM "Question" q
  INNER JOIN "UserQuestionTrack" uqt
  ON uqt."questionId" = q.id
  INNER JOIN "Category" c
  ON c.id = q."categoryId"
  WHERE uqt."result" != 'Incomplete'
  AND uqt."userId" = ${userId}
  GROUP BY c.id;`) as (Category & {
      questionCount: bigint;
      correctCount: bigint;
    })[]
  ).map((category) => ({
    ...category,
    questionCount: Number(category.questionCount),
    correctCount: Number(category.correctCount),
  }));
}
