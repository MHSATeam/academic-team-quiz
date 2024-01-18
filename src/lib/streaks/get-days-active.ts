import { prismaClient } from "@/src/utils/clients";
import "server-only";

type ActiveDay = {
  date: Date;
  userId: string;
  correct_count: BigInt;
  question_count: BigInt;
};

export default async function getDaysActive(
  userId: string
): Promise<ActiveDay[]> {
  return (
    (await prismaClient.$queryRaw`with
  user_day_questions as (
  	select "createdOn"::date as date, "userId", COUNT(case result when 'Correct' then 1 else null end) as correct_count, COUNT(*) as question_count
  	from "UserQuestionTrack"
  	where "userId" = ${userId}
  	group by "createdOn"::date, "userId"
  )
  
  select *
  from "user_day_questions";`) ?? []
  );
}
