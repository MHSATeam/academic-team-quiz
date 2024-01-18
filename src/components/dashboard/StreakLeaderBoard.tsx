import getStreaks from "@/src/lib/streaks/get-streak";
import formatUserName from "@/src/lib/users/format-user-name";
import getUserList from "@/src/lib/users/get-user-ids";
import { User } from "@/src/lib/users/types";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import { Bold, Color, Flex, List, ListItem, Text } from "@tremor/react";
import { Medal } from "lucide-react";

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

  const streaks: { [key: string]: number } = {};

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
    includeSelf && currentUserId && currentUserName && currentPlace > 6;

  return (
    <>
      <Flex className="mt-4">
        <Text>Name</Text>
        <Text>Streak</Text>
      </Flex>
      <List>
        {topUsers
          .slice(0, shouldAppendSelf ? 5 : 6)
          .map((user, i) =>
            createLeaderboardListItem(
              user.user_id,
              user.name,
              i + 1,
              user.user_id === currentUserId
            )
          )}
        {shouldAppendSelf &&
          createLeaderboardListItem(
            currentUserId,
            currentUserName,
            currentPlace,
            true
          )}
      </List>
    </>
  );

  function createLeaderboardListItem(
    userId: string,
    name: string,
    place: number,
    isCurrent = false
  ) {
    const textColor: Color = isCurrent ? "blue" : "gray";
    return (
      <ListItem key={userId}>
        <Text className="gap-2 flex">
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
        </Text>
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
}
