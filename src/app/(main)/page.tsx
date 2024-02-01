import StreakTracker from "@/components/dashboard/StreakTracker";
import QuestionDisplay from "@/components/display/QuestionDisplay";
import { getRandomQuestion } from "@/src/lib/questions/get-random-question";
import getStreaks, { Streak } from "@/src/lib/streaks/get-streak";
import { getSession } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import {
  Card,
  Col,
  Flex,
  Grid,
  Metric,
  ProgressBar,
  Subtitle,
  Text,
  Title,
} from "@tremor/react";
import formatUserName from "@/src/lib/users/format-user-name";
import StreakLeaderBoard from "@/components/dashboard/StreakLeaderBoard";
import getQuestionsPerDay from "@/src/lib/streaks/get-questions-per-day";
import Link from "next/link";
import RefreshButton from "@/components/utils/RefreshButton";
import QuestionsPerDay from "@/components/dashboard/QuestionsPerDay";
import getUserList from "@/src/lib/users/get-user-ids";
import { formatMonthDateShort } from "@/src/utils/date-utils";
import getDefaultCategories from "@/src/lib/users/get-default-categories";

export type UserStreaks = {
  [key: string]: {
    streaks: Streak[];
    isActive: boolean;
    hasCompletedToday: boolean;
  };
};

export default async function Page() {
  const session = await getSession();
  let user: UserProfile;
  if (!session) {
    user = {
      name: "Test User",
      sub: "google-oauth2|448529395684503072105",
      email: "test@example.com",
      email_verified: true,
      nickname: "Test",
    };
  } else {
    user = session.user;
  }
  if (!user.sub || !user.name) {
    throw new Error("Missing user data!");
  }

  const users = await getUserList();

  const categories = await getDefaultCategories(user.sub);

  const questionOfTheDay = await getRandomQuestion(
    categories.map(({ id }) => id)
  );
  const { streaks, isActive: isStreakActive } = await getStreaks(user.sub);
  const activeStreak = isStreakActive ? streaks[0] : undefined;
  const goalPercent =
    Math.round(Number(activeStreak?.days_count ?? 0) * (100 / 0.6)) / 100;

  const currentUserDaysActive = await getQuestionsPerDay(user.sub);
  const numDaysInTimeFrame = 8;
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - numDaysInTimeFrame);
  const otherUserDays = (
    await Promise.all(
      users
        .filter((u) => u.user_id !== user.sub)
        .map(async (u) => {
          return {
            name: formatUserName(u.name),
            userId: u.user_id,
            days: await getQuestionsPerDay(u.user_id),
          };
        })
    )
  ).filter((userDays) => {
    if (userDays.days.length === 0) {
      return false;
    }
    return userDays.days[0].date.getTime() >= startDate.getTime();
  });

  const otherStreaks: UserStreaks = {};

  for (const user of users) {
    const userStreaks = await getStreaks(user.user_id);
    otherStreaks[user.user_id] = userStreaks;
  }

  const firstName = formatUserName(user.name).split(" ")[0];

  return (
    <main className="py-12 px-6">
      <Flex>
        <Metric>
          Welcome{" "}
          <Link className="text-blue-500" href={"/profile"}>
            {firstName}
          </Link>
          !
        </Metric>
        <RefreshButton />
      </Flex>
      <Grid numItems={1} numItemsMd={2} numItemsLg={3} className="gap-4 mt-4">
        <Col numColSpan={1} numColSpanSm={2}>
          <Card>
            <Title>
              {questionOfTheDay ? (
                <Link
                  href={`/static/question/${questionOfTheDay.id}`}
                  className="text-blue-500"
                >
                  Question of the Day
                </Link>
              ) : (
                "Question of the Day"
              )}
            </Title>
            {questionOfTheDay && (
              <Subtitle>{questionOfTheDay.category.name}</Subtitle>
            )}
            {questionOfTheDay ? (
              <QuestionDisplay question={questionOfTheDay} />
            ) : (
              <Text>Couldn't find question of the day!</Text>
            )}
          </Card>
        </Col>
        <Card>
          <Title>Current Streak</Title>
          <Metric className="mt-2">
            {activeStreak ? String(activeStreak.days_count) : "0"} Days!
          </Metric>
          <StreakTracker user={user} isStreakActive={isStreakActive} />
        </Card>
        <Card>
          <Flex>
            <Title>Streak Goal</Title>
            <Subtitle color="blue">Keep Going!</Subtitle>
          </Flex>
          <Flex className="mt-2 mb-1">
            <Text>Goal: 2 Month</Text>
            <Text>{goalPercent}%</Text>
          </Flex>
          <ProgressBar value={goalPercent} />
        </Card>
        <Card>
          <Title>Questions Studied Per Day</Title>
          <QuestionsPerDay
            showAll={false}
            streaks={otherStreaks}
            timeFrameDays={numDaysInTimeFrame}
            currentUserDays={currentUserDaysActive}
            otherUsers={otherUserDays}
          />
        </Card>
        <Card>
          <Flex>
            <Title>Streak Tracker</Title>
            <Title>{formatMonthDateShort(new Date())}</Title>
          </Flex>
          <StreakLeaderBoard streaks={otherStreaks} />
          <QuestionsPerDay
            showAll={true}
            streaks={otherStreaks}
            timeFrameDays={numDaysInTimeFrame}
            currentUserDays={currentUserDaysActive}
            otherUsers={otherUserDays}
          />
        </Card>
      </Grid>
    </main>
  );
}
