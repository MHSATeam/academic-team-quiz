import getQuestionsPerDay, {
  ActiveDay,
} from "@/src/lib/streaks/get-questions-per-day";
import getStreaks, { Streak } from "@/src/lib/streaks/get-streak";
import formatUserName from "@/src/lib/users/format-user-name";
import getUserList from "@/src/lib/users/get-user-ids";
import { Bold, Subtitle, Text, Tracker } from "@tremor/react";

type UserStreaks = {
  [key: string]: {
    streaks: Streak[];
    isActive: boolean;
    hasCompletedToday: boolean;
  };
};

export default async function StreakLeaderBoard({
  currentUserId,
  currentUserName,
}: {
  currentUserId?: string;
  currentUserName?: string;
}) {
  const users = await getUserList();

  const streaks: UserStreaks = {};
  const activeDays: { [userId: string]: ActiveDay[] } = {};

  for (const user of users) {
    const userStreaks = await getStreaks(user.user_id);
    const questions = await getQuestionsPerDay(user.user_id);
    streaks[user.user_id] = userStreaks;
    activeDays[user.user_id] = questions;
  }

  function getMostRecentStreak(userId: string) {
    return streaks[userId].isActive
      ? streaks[userId].streaks[0]
      : { days_count: 0n, question_count: 0n };
  }

  const topUsers = users.sort((a, b) => {
    const streakB = getMostRecentStreak(b.user_id);
    const streakA = getMostRecentStreak(a.user_id);
    const diff = Number(streakB.days_count) - Number(streakA.days_count);
    if (diff === 0) {
      return Number(streakB.question_count) - Number(streakA.question_count);
    }
    return diff;
  });

  const oneWeekAgo = new Date();
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

  const notCompletedTodayUsers = activeUsers.filter((user) => {
    const userStreaks = streaks[user.user_id];
    if (user.user_id === currentUserId) {
      return false;
    }
    return !userStreaks.hasCompletedToday;
  });

  const motivationUser =
    notCompletedTodayUsers.length !== 0
      ? notCompletedTodayUsers[
          Math.floor(Math.random() * notCompletedTodayUsers.length)
        ]
      : null;

  return (
    <>
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
            tooltip: `${formatUserName(user.name)}: ${
              currentStreak.days_count
            }`,
          };
        })}
        className="mt-4"
      />
      {motivationUser && (
        <>
          <Subtitle className="mt-2">
            <Bold>{formatUserName(motivationUser.name)}</Bold> hasn't extended
            their streak today!
          </Subtitle>
          <Text>Remind them to practice so they don't lose their streak!</Text>
        </>
      )}
    </>
  );
}
