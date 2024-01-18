import getStreaks from "@/src/lib/streaks/get-streak";
import formatUserName from "@/src/lib/users/format-user-name";
import getUserList from "@/src/lib/users/get-user-ids";
import { Bold, Color, Flex, List, ListItem, Text } from "@tremor/react";
import { Medal } from "lucide-react";

type UserStreaks = { [key: string]: number };

function createLeaderboardListItem(
  userId: string,
  name: string,
  place: number,
  streaks: UserStreaks,
  isCurrent = false
) {
  const textColor: Color = isCurrent ? "blue" : "gray";
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
          <Bold className="text-xl">{streaks[userId] ?? NaN}</Bold>
        ) : (
          streaks[userId] ?? NaN
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
      ? Number(userStreaks.streaks[0].days_count)
      : 0;
  }

  const topUsers = users.sort(
    (a, b) => streaks[b.user_id] - streaks[a.user_id]
  );

  const currentPlace =
    1 + topUsers.findIndex((user) => user.user_id === currentUserId);

  const shouldAppendSelf =
    includeSelf &&
    currentUserId &&
    currentUserName &&
    (currentPlace > 6 || streaks[currentUserId] === 0);

  const nonZeroUsers = topUsers.filter((user) => streaks[user.user_id] !== 0);

  return (
    <>
      <Flex className="mt-4">
        <Text>Name</Text>
        <Text>Streak</Text>
      </Flex>
      <List>
        {nonZeroUsers
          .slice(0, Math.min(nonZeroUsers.length, shouldAppendSelf ? 5 : 6))
          .map((user, i) =>
            createLeaderboardListItem(
              user.user_id,
              user.name,
              i + 1,
              streaks,
              user.user_id === currentUserId
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
