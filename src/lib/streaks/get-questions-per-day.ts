import { prismaClient } from "@/src/utils/clients";
import "server-only";

type ActiveDay = {
  date: Date;
  userId: string;
  correct_count: BigInt;
  question_count: BigInt;
};

export default async function getQuestionsPerDay(
  userId: string
): Promise<ActiveDay[]> {
  return (
    (await prismaClient.$queryRaw`
  	select "createdOn"::date as date, 
    "userId",
    COUNT(case result when 'Correct' then 1 else null end) as correct_count, 
    COUNT(case when result != 'Incomplete' then 1 else null end) as question_count
  	from "UserQuestionTrack"
  	where "userId" = ${userId}
  	group by "createdOn"::date, "userId"`) ?? []
  );
}
