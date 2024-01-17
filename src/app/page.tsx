import QuestionDisplay from "@/components/utils/QuestionDisplay";
import { getQuestion } from "@/src/questions/get-question";
import { getSession } from "@auth0/nextjs-auth0";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import {
  AreaChart,
  Bold,
  Card,
  Flex,
  Grid,
  List,
  ListItem,
  Metric,
  ProgressBar,
  Text,
  Title,
  Tracker,
} from "@tremor/react";
import { Medal } from "lucide-react";

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
  const question = await getQuestion(Math.floor(Math.random() * 2) + 1);
  return (
    <main className="py-12 px-6">
      <Metric>Welcome {user.name as string}!</Metric>
      <Grid numItems={1} numItemsMd={2} numItemsLg={3} className="gap-2 mt-4">
        {question && (
          <Card>
            <Title>Question of the Day</Title>
            <QuestionDisplay question={question} />
          </Card>
        )}
        <Card>
          <Title>Current Streak</Title>
          <Metric className="mt-2">31 Days!</Metric>
          <Tracker
            data={new Array(15).fill(0).map((_, i) => {
              return { color: "emerald", tooltip: `Jan ${i + 17}` };
            })}
            className="mt-4"
          />
          <Flex>
            <Text>Jan 17</Text>
            <Text>Jan 31</Text>
          </Flex>
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
          <Flex className="mt-4">
            <Text>Name</Text>
            <Text>Streak</Text>
          </Flex>
          <List>
            {[
              { name: "Test User", streak: 31 },
              { name: "Sasha Pinyayev", streak: 30 },
              { name: "Ben Turcotte", streak: 28 },
              { name: "Seth Rane", streak: 26 },
            ].map(({ name, streak }, i) => (
              <ListItem key={name}>
                <Text>
                  {i + 1 <= 3 ? (
                    <Medal
                      className="inline"
                      style={{
                        color: i === 0 ? "gold" : i === 1 ? "silver" : "brown",
                      }}
                    />
                  ) : (
                    `#${i + 1}. `
                  )}{" "}
                  {name}
                </Text>
                <Text>
                  {i === 0 ? <Bold className="text-xl">{streak}</Bold> : streak}
                </Text>
              </ListItem>
            ))}
          </List>
        </Card>
        <Card>
          <Title>Questions Studied Per Day</Title>
          <AreaChart
            className="h-72 mt-4"
            data={new Array(31).fill(0).map((_, i) => ({
              date: `Jan ${i + 1}`,
              Questions: Math.floor((Math.cos(i * (1 / 4) + 2) + 1) * 3) + 4,
            }))}
            colors={["blue"]}
            index="date"
            yAxisWidth={30}
            categories={["Questions"]}
          />
        </Card>
      </Grid>
    </main>
  );
}
