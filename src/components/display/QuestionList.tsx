import { Question } from "@prisma/client";
import { Flex, List, ListItem, Text, Title } from "@tremor/react";
import { MoreVertical } from "lucide-react";
import Link from "next/link";

type QuestionListProps = {
  questions: Question[];
  totalQuestions: number;
};
export default function QuestionList(props: QuestionListProps) {
  if (props.questions.length === 0) {
    return (
      <p className="dark:text-white">
        There are no questions in this category!
        <br />
        If you think this is a mistake, talk to your team captain(s) about
        adding more!
      </p>
    );
  }
  return (
    <Flex flexDirection="col" alignItems="start">
      <List>
        {props.questions.map((question) => {
          return (
            <ListItem key={question.id}>
              <Link href={`/question/${question.id}`}>
                <Flex className="gap-2">
                  <Title>#{question.id}</Title>
                  <Text className="line-clamp-2 overflow-clip overflow-ellipsis">
                    {question.question}
                  </Text>
                </Flex>
              </Link>
            </ListItem>
          );
        })}
      </List>
      {props.totalQuestions > props.questions.length && (
        <>
          <MoreVertical className="dark:text-white mb-2" />
          <Title>{props.totalQuestions - props.questions.length} more</Title>
        </>
      )}
    </Flex>
  );
}
