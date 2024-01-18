import { prismaClient } from "@/src/utils/clients";
import { compareDateWithoutTime } from "@/src/utils/date-utils";
import "server-only";

type Streak = {
  userId: string;
  start_at: Date;
  end_at: Date;
  days_count: BigInt;
};

export default async function getStreaks(userId?: string): Promise<{
  streaks: Streak[];
  isActive: boolean;
  hasCompletedToday: boolean;
}> {
  const streaks: Streak[] =
    (await prismaClient.$queryRaw`with
  user_day_questions as (
  	select "createdOn"::date as date, "userId", COUNT(*) as question_count
  	from "UserQuestionTrack"
  	where "userId" = ${userId}
  	group by "createdOn"::date, "userId"
  ),
  user_question_streaks as (
    select *, row_number() over (partition by "userId" order by "date"::date)::integer,
    (("date")::date - row_number() over (partition by "userId" order by "date"::date)::integer) as streak_group
    from "user_day_questions"
    order by "date"
  ),
  
  streak_groups AS (
    select
      "userId",
      MIN("date") AS start_at,
      MAX("date") AS end_at,
      COUNT(*) AS days_count,
      SUM(question_count) as question_count
    FROM user_question_streaks
    GROUP BY streak_group, "userId"
    HAVING COUNT(*) >= 1
    order by end_at DESC
  )
  
  select *
  from "streak_groups";`) ?? [];

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const isActive =
    streaks.length !== 0 &&
    (compareDateWithoutTime(streaks[0].end_at, today) ||
      compareDateWithoutTime(streaks[0].end_at, yesterday));
  const hasCompletedToday =
    streaks.length !== 0 && compareDateWithoutTime(streaks[0].end_at, today);
  return {
    streaks,
    isActive,
    hasCompletedToday,
  };
}
