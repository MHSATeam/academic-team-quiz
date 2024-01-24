import getStreaks, { Streak } from "@/src/lib/streaks/get-streak";
import formatUserName from "@/src/lib/users/format-user-name";
import getUserList from "@/src/lib/users/get-user-ids";
import { Bold, Color, Flex, List, ListItem, Text } from "@tremor/react";
import { Medal } from "lucide-react";

type UserStreaks = { [key: string]: Streak | null };

function createLeaderboardListItem(
  userId: string,
  name: string,
  place: number,
  streaks: UserStreaks,
  isCurrent = false
) {
  const textColor: Color = isCurrent ? "blue" : "gray";
  const streakCount = Number(streaks[userId]?.days_count ?? 0);
  return (
    <ListItem key={userId}>
      <span className="gap-2 flex">
        {place <= 3 ? (
          <Medal
            style={{
              color: place === 1 ? "gold" : place === 2 ? "silver" : "brown",
            }}
          />
        ) : (
          `#${place}. `
        )}{" "}
        <Text color={textColor}>{formatUserName(name)}</Text>
      </span>
      <Text color={textColor}>
        {place === 1 ? (
          <Bold className="text-xl">{streakCount ?? NaN}</Bold>
        ) : (
          streakCount ?? NaN
        )}
      </Text>
    </ListItem>
  );
}

export default async function StreakLeaderBoard({
  includeSelf,
  currentUserId,
  currentUserName,
}: {
  includeSelf?: boolean;
  currentUserId?: string;
  currentUserName?: string;
}) {
  const users = await getUserList();

  const streaks: UserStreaks = {};

  for (const user of users) {
    const userStreaks = await getStreaks(user.user_id);
    streaks[user.user_id] = userStreaks.isActive
      ? userStreaks.streaks[0]
      : null;
  }

  const topUsers = users.sort((a, b) => {
    const diff =
      Number(streaks[b.user_id]?.days_count ?? 0) -
      Number(streaks[a.user_id]?.days_count ?? 0);
    if (diff === 0) {
      return (
        Number(streaks[b.user_id]?.question_count ?? 0) -
        Number(streaks[a.user_id]?.question_count ?? 0)
      );
    }
    return diff;
  });

  const userPlaces = topUsers.reduce(
    (placeLeaderBoard, user) => {
      const streak = streaks[user.user_id] ?? { days_count: 0n };
      const days = Number(streak.days_count);
      if (placeLeaderBoard.currentStreak === -1) {
        placeLeaderBoard.currentStreak = days;
      }
      if (days !== placeLeaderBoard.currentStreak) {
        placeLeaderBoard.currentPlace++;
        placeLeaderBoard.currentStreak = days;
      }
      placeLeaderBoard.userPlaces.push({
        place: placeLeaderBoard.currentPlace,
        streak: days,
        userId: user.user_id,
        name: user.name,
      });
      return placeLeaderBoard;
    },
    { currentPlace: 1, currentStreak: -1, userPlaces: [] } as {
      currentPlace: number;
      currentStreak: number;
      userPlaces: {
        place: number;
        streak: number;
        userId: string;
        name: string;
      }[];
    }
  ).userPlaces;

  const currentPlace =
    userPlaces.find((place) => place.userId === currentUserId)?.place ??
    userPlaces?.[userPlaces.length]?.place ??
    1;

  const shouldAppendSelf =
    includeSelf &&
    currentUserId &&
    currentUserName &&
    (currentPlace > 6 || Number(streaks[currentUserId]?.days_count ?? 0) === 0);

  const nonZeroUsers = userPlaces.filter((user) => user.streak !== 0);

  return (
    <>
      <Flex className="mt-4">
        <Text>Name</Text>
        <Text>Streak</Text>
      </Flex>
      <List>
        {nonZeroUsers
          .slice(0, Math.min(nonZeroUsers.length, shouldAppendSelf ? 5 : 6))
          .map((user) =>
            createLeaderboardListItem(
              user.userId,
              user.name,
              user.place,
              streaks,
              user.userId === currentUserId
            )
          )}
        {shouldAppendSelf &&
          createLeaderboardListItem(
            currentUserId,
            currentUserName,
            currentPlace,
            streaks,
            true
          )}
      </List>
    </>
  );
}
