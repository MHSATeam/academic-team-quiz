import { prismaClient } from "@/src/utils/clients";
import { compareDateWithoutTime } from "@/src/utils/date-utils";
import "server-only";

export type Streak = {
  userId: string;
  start_at: Date;
  end_at: Date;
  days_count: BigInt;
  question_count: BigInt;
};

export default async function getStreaks(userId: string): Promise<{
  streaks: Streak[];
  isActive: boolean;
  hasCompletedToday: boolean;
}> {
  const streaks: Streak[] =
    (await prismaClient.$queryRaw`with
    session_with_count as (
      select u.*, COUNT(t.id) as question_count 
      from "UserQuizSession" u 
      left join "UserQuestionTrack" t 
      on u.id = t."quizSessionId" and t."quizSessionId" is not null 
      group by u.id
    ),
    user_day_sessions as (
      select "completedOn"::date as date, s."userId", COUNT(*) as session_count, SUM(s.question_count) as question_count, MAX("completedOn") as last_created
      from session_with_count s
      where s."userId" = ${userId}
      and "completedOn" is not null
      group by "completedOn"::date, s."userId"
    ),
    user_session_streaks as (
      select *, row_number() over (partition by "userId" order by "date"::date)::integer,
      (("date")::date - row_number() over (partition by "userId" order by "date"::date)::integer) as streak_group
      from "user_day_sessions"
      order by "date"
    )
    select
      "userId",
      MIN("last_created") AS start_at,
      MAX("last_created") AS end_at,
      COUNT(*) AS days_count,
      SUM(question_count) as question_count
    FROM user_session_streaks
    GROUP BY streak_group, "userId"
    HAVING COUNT(*) >= 1
    order by end_at DESC;`) ?? [];

  const today = new Date();
  const yesterday = new Date();
  yesterday.setUTCDate(today.getUTCDate() - 1);
  const isActive =
    streaks.length !== 0 &&
    (compareDateWithoutTime(
      streaks[0].end_at,
      new Date(today.toDateString())
    ) ||
      compareDateWithoutTime(
        streaks[0].end_at,
        new Date(yesterday.toDateString())
      ));
  const hasCompletedToday =
    streaks.length !== 0 &&
    compareDateWithoutTime(streaks[0].end_at, new Date(today.toDateString()));
  return {
    streaks,
    isActive,
    hasCompletedToday,
  };
}
