import { prismaClient } from "@/src/utils/clients";
import "server-only";

export async function getAnswerCount(
  take: number,
): Promise<{ userId: string; questionCount: number; correctCount: number }[]> {
  return (
    (await prismaClient.$queryRaw`SELECT uqt."userId", count(q.*) as "questionCount",
  sum(case uqt."result" when 'Correct' then 1 else 0 end) as "correctCount"
  FROM "Question" q
  INNER JOIN "UserQuestionTrack" uqt
  ON uqt."questionId" = q.id
  WHERE uqt."result" != 'Incomplete'
  GROUP BY uqt."userId"
  ORDER BY count(q.*) DESC
  LIMIT ${take}`) as {
      userId: string;
      questionCount: bigint;
      correctCount: bigint;
    }[]
  ).map((u) => ({
    ...u,
    questionCount: Number(u.questionCount),
    correctCount: Number(u.correctCount),
  }));
}
