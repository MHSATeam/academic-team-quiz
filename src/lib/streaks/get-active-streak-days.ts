import { prismaClient } from "@/src/utils/clients";

export default async function getActiveStreakDays(userId: string) {
  const streakDays: { completedOn: Date }[] = await prismaClient.$queryRaw`
  select "completedOn"::date
  from "UserQuizSession"
  where "userId" = ${userId}
  and "completedOn" is not null
  group by "completedOn"::date
  order by "completedOn"::date
  `;

  return streakDays;
}
