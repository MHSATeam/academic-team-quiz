import { UserStreaks } from "@/src/app/(main)/page";
import getQuestionsPerDay, {
  ActiveDay,
} from "@/src/lib/streaks/get-questions-per-day";
import getStreaks, { Streak } from "@/src/lib/streaks/get-streak";
import formatUserName from "@/src/lib/users/format-user-name";
import getUserList from "@/src/lib/users/get-user-ids";
import { newDateInTimeZone } from "@/src/utils/date-utils";
import { Bold, Subtitle, Text, Tracker } from "@tremor/react";

export default async function StreakLeaderBoard({
  streaks,
}: {
  streaks: UserStreaks;
}) {
  const users = await getUserList();

  const activeDays: { [userId: string]: ActiveDay[] } = {};

  for (const user of users) {
    const questions = await getQuestionsPerDay(user.user_id);
    activeDays[user.user_id] = questions;
  }

  function getMostRecentStreak(userId: string) {
    return streaks[userId].isActive
      ? streaks[userId].streaks[0]
      : { day_count: 0n, question_count: 0n };
  }

  const topUsers = users.sort((a, b) => {
    const streakB = getMostRecentStreak(b.user_id);
    const streakA = getMostRecentStreak(a.user_id);
    const diff = Number(streakB.day_count) - Number(streakA.day_count);
    if (diff === 0) {
      return Number(streakB.question_count) - Number(streakA.question_count);
    }
    return diff;
  });

  const oneWeekAgo = newDateInTimeZone();
  oneWeekAgo.setUTCDate(oneWeekAgo.getUTCDate() - 7);

  const isUserActive = (userId: string) => {
    const userStreaks = streaks[userId];
    return (
      userStreaks.isActive ||
      (activeDays[userId].length > 0 &&
        activeDays[userId][0].date.getTime() >= oneWeekAgo.getTime())
    );
  };
  const activeUsers = topUsers.filter((user) => {
    return isUserActive(user.user_id);
  });

  return (
    <Tracker
      data={activeUsers.map((user) => {
        const streak = streaks[user.user_id];
        const currentStreak = getMostRecentStreak(user.user_id);
        return {
          key: user.user_id,
          color: streak.hasCompletedToday
            ? "emerald"
            : streak.isActive
            ? "yellow"
            : "gray",
          tooltip: `${formatUserName(user.name)}: ${currentStreak.day_count}`,
        };
      })}
      className="mt-4"
    />
  );
}
