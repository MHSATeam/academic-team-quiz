import { Bold, List, ListItem, Text, Title } from "@tremor/react";
import { Medal } from "lucide-react";

type QuestionsAnsweredLeaderboardProps = {
  userQuestionData: {
    name: string | undefined;
    questionCount: number;
    correctCount: number;
    userId: string;
  }[];
};

export default function QuestionsAnsweredLeaderboard(
  props: QuestionsAnsweredLeaderboardProps,
) {
  return props.userQuestionData.length === 0 ? (
    <Title>Failed to load user data!</Title>
  ) : (
    <List>
      {props.userQuestionData.map(({ name, questionCount }, i) => (
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
            {name ?? "Couldn't load name"}
          </Text>
          <Text>
            {i === 0 ? (
              <Bold className="text-xl">{questionCount}</Bold>
            ) : (
              questionCount
            )}
          </Text>
        </ListItem>
      ))}
    </List>
  );
}
