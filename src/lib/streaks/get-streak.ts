import { prismaClient } from "@/src/utils/clients";
import {
  compareDateWithoutTime,
  newDateInTimeZone,
} from "@/src/utils/date-utils";
import "server-only";

export type Streak = {
  userId: string;
  start_at: Date;
  end_at: Date;
  day_count: bigint;
  question_count: bigint;
};

export default async function getStreaks(userId: string): Promise<{
  streaks: Streak[];
  isActive: boolean;
  hasCompletedToday: boolean;
}> {
  const streaks: Streak[] =
    (await prismaClient.$queryRaw`with daily_questions as (
      select "userId", timezone('America/New_York', "modifiedOn")::date as day,
      COUNT(*) as question_count
      from "UserQuestionTrack"
      where result != 'Incomplete'
      group by day, "userId"
      order by day desc
    ),
    question_streaks as (
      select *, 
      row_number() over (partition by "userId" order by day)::integer, 
      (day - row_number() over (partition by "userId" order by day)::integer) as streak_group
      from daily_questions
      where question_count >= 10
    )
    select "userId",
    MIN("day") as start_at,
    MAX("day") as end_at,
    count(*) as day_count,
    sum(question_count) as question_count
    from question_streaks
    where "userId" = ${userId}
    group by streak_group, "userId"
    having count(*) >= 1
    order by end_at desc;`) ?? [];

  const today = newDateInTimeZone();
  const yesterday = newDateInTimeZone();
  yesterday.setDate(today.getDate() - 1);
  const isActive =
    streaks.length !== 0 &&
    (compareDateWithoutTime(streaks[0].end_at, today, false) ||
      compareDateWithoutTime(streaks[0].end_at, yesterday, false));
  const hasCompletedToday =
    streaks.length !== 0 &&
    compareDateWithoutTime(streaks[0].end_at, today, false);
  return {
    streaks,
    isActive,
    hasCompletedToday,
  };
}
