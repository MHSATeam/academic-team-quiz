import StreakTracker from "@/components/dashboard/StreakTracker";
import QuestionDisplay from "@/components/display/QuestionDisplay";
import { getRandomQuestion } from "@/src/lib/questions/get-random-question";
import getStreaks from "@/src/lib/streaks/get-streak";
import { getSession } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import {
  AreaChart,
  Bold,
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
import {
  compareDateWithoutTime,
  formatMonthDateShort,
} from "@/src/utils/date-utils";
import Link from "next/link";
import RefreshButton from "@/components/utils/RefreshButton";

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
  const activeStreak = isStreakActive ? streaks[0] : undefined;
  const goalPercent =
    Math.round(Number(activeStreak?.days_count ?? 0) * (100 / 0.6)) / 100;

  const daysActive = await getQuestionsPerDay(user.sub);
  const numDaysInTimeFrame = 31;
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - numDaysInTimeFrame);

  return (
    <main className="py-12 px-6">
      <Flex>
        <Metric>Welcome {formatUserName(user.name).split(" ")[0]}!</Metric>
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
                compareDateWithoutTime(activeDay.date, date, false)
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
