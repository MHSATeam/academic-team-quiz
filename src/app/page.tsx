import StreakTracker from "@/components/dashboard/StreakTracker";
import QuestionDisplay from "@/components/utils/QuestionDisplay";
import { getRandomQuestion } from "@/src/lib/questions/get-random-question";
import getStreaks from "@/src/lib/streaks/get-streak";
import { getSession } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import {
  AreaChart,
  Bold,
  Card,
  Flex,
  Grid,
  Metric,
  ProgressBar,
  Text,
  Title,
} from "@tremor/react";
import formatUserName from "@/src/lib/users/format-user-name";
import StreakLeaderBoard from "@/components/dashboard/StreakLeaderBoard";
import getDaysActive from "@/src/lib/streaks/get-days-active";
import {
  compareDateWithoutTime,
  formatMonthDateShort,
} from "@/src/utils/date-utils";

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
  const questionOfTheDay = await getRandomQuestion();
  const { streaks, isActive: isStreakActive } = await getStreaks(user.sub);

  const daysActive = await getDaysActive(user.sub);
  const numDaysInTimeFrame = 31;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - numDaysInTimeFrame);

  return (
    <main className="py-12 px-6">
      <Metric>Welcome {formatUserName(user.name).split(" ")[0]}!</Metric>
      <Grid numItems={1} numItemsMd={2} numItemsLg={3} className="gap-2 mt-4">
        <Card>
          <Title>Question of the Day</Title>
          {questionOfTheDay ? (
            <QuestionDisplay question={questionOfTheDay} />
          ) : (
            <Text>Couldn't find question of the day!</Text>
          )}
        </Card>
        <Card>
          <Title>Current Streak</Title>
          <Metric className="mt-2">
            {isStreakActive ? String(streaks[0].days_count) : "0"} Days!
          </Metric>
          <StreakTracker user={user} />
        </Card>
        <Card>
          <Title>Streak Goal</Title>
          <Flex className="mt-2 mb-1">
            <Text>Goal: 2 Month</Text>
            <Text>50%</Text>
          </Flex>
          <ProgressBar value={50} />
          <Title className="mt-4">
            <Bold>Half way there!</Bold>
          </Title>
        </Card>
        <Card>
          <Title>Streak Leaderboard</Title>
          <StreakLeaderBoard
            includeSelf
            currentUserId={user.sub}
            currentUserName={user.name}
          />
        </Card>
        <Card>
          <Title>Questions Studied Per Day</Title>
          <AreaChart
            className="h-72 mt-4"
            data={new Array(numDaysInTimeFrame).fill(0).map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - (numDaysInTimeFrame - 1) + i);
              const activeDay = daysActive.find((activeDay) =>
                compareDateWithoutTime(activeDay.date, date)
              );
              const Answered = Number(activeDay?.question_count ?? 0);
              const Correct = Number(activeDay?.correct_count ?? 0);

              return {
                date: formatMonthDateShort(date),
                Correct,
                Answered,
              };
            })}
            colors={["blue", "green"]}
            index="date"
            yAxisWidth={30}
            categories={["Answered", "Correct"]}
          />
        </Card>
      </Grid>
    </main>
  );
}
