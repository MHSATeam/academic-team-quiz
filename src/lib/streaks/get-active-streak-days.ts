import { prismaClient } from "@/src/utils/clients";

export default async function getActiveStreakDays(userId: string) {
  const streakDays: { day: Date }[] = await prismaClient.$queryRaw`
    select "userId", timezone('America/New_York', "modifiedOn")::date as day,
    COUNT(*) as question_count
    from "UserQuestionTrack"
    where result != 'Incomplete'
    and "userId" = ${userId}
    group by day, "userId"
    having COUNT(*) >= 10
    order by day desc
  `;

  return streakDays;
}
