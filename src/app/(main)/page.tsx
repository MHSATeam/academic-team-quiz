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
import {
  formatMonthDateShort,
  newDateInTimeZone,
} from "@/src/utils/date-utils";
import getDefaultCategories from "@/src/lib/users/get-default-categories";
import UpdateNotice from "@/components/dashboard/UpdateNotice";
import { getMissedQuestions } from "@/src/lib/questions/get-missed-questions";
import MostMissedQuestions from "@/components/dashboard/MostMissedQuestions";
import { getCategoryBreakdown } from "@/src/lib/questions/get-category-breakdown";
import CategoriesAnsweredDonut from "@/components/dashboard/CategoriesAnsweredDonut";
import QuestionsAnsweredLeaderboard from "@/components/dashboard/QuestionsAnsweredLeaderboard";
import { getAnswerCount } from "@/src/lib/questions/get-answer-count";

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
    categories.map(({ id }) => id),
  );
  const { streaks, isActive: isStreakActive } = await getStreaks(user.sub);
  const activeStreak = isStreakActive ? streaks[0] : undefined;

  const currentUserDaysActive = await getQuestionsPerDay(user.sub);
  const numDaysInTimeFrame = 8;
  const startDate = newDateInTimeZone();
  startDate.setDate(startDate.getDate() - numDaysInTimeFrame);
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
        }),
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

  const mostMissedQuestions = await getMissedQuestions(user.sub, 8);
  const categoryBreakdown = await getCategoryBreakdown(user.sub);
  const totalQuestionsByUser = await getAnswerCount(5);
  const totalQuestionsByName = totalQuestionsByUser.map((count) => {
    const user = users.find((u) => u.user_id === count.userId);
    return {
      ...count,
      name: user ? formatUserName(user.name) : undefined,
    };
  });

  return (
    <>
      <main className="px-6 py-12">
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
        <Grid numItems={1} numItemsMd={2} numItemsLg={3} className="mt-4 gap-4">
          <Col numColSpan={1} numColSpanSm={2}>
            <Card className="h-full">
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
                <Text>Couldn&apos;t find question of the day!</Text>
              )}
            </Card>
          </Col>
          <Card>
            <Title>Current Streak</Title>
            <Metric className="mt-2">
              {activeStreak ? String(activeStreak.day_count) : "0"} Days!
            </Metric>
            <StreakTracker user={user} isStreakActive={isStreakActive} />
          </Card>
          <Card className="grow">
            <MostMissedQuestions questions={mostMissedQuestions} />
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
          <Card>
            <CategoriesAnsweredDonut categories={categoryBreakdown} />
          </Card>
          <Card>
            <Title>Total Questions Answered Leaderboard</Title>
            <QuestionsAnsweredLeaderboard
              userQuestionData={totalQuestionsByName}
            />
          </Card>
        </Grid>
      </main>
      <UpdateNotice />
    </>
  );
}
