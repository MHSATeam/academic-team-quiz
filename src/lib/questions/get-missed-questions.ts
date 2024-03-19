import { prismaClient } from "@/src/utils/clients";
import { Question } from "@prisma/client";
import "server-only";

export async function getMissedQuestions(
  userId: string,
  take: number = 20
): Promise<Question[]> {
  return prismaClient.$queryRaw`select q.*
    from "Question" q 
    inner join "UserQuestionTrack" uqt 
    ON uqt."questionId" = q.id 
    where uqt."userId" = ${userId} 
    group by q.id
    order by SUM(case uqt."result" when 'Incorrect' then 1 else 0 end) desc, 
    SUM(case when uqt."result" != 'Incomplete' then 1 else 0 end) asc
    limit ${take};`;
}
