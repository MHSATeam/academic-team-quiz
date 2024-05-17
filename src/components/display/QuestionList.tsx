import DisplayFormattedText from "@/components/utils/DisplayFormattedText";
import Pagination from "@/components/utils/Pagination";
import { Question } from "@prisma/client";
import { Flex, List, ListItem, Subtitle } from "@tremor/react";
import Link from "next/link";

type QuestionListProps = {
  questions: Question[];
  totalPages?: number;
  showAnswer?: boolean;
};
export default function QuestionList(props: QuestionListProps) {
  const showAnswer = props.showAnswer ?? false;
  if (props.questions.length === 0) {
    return (
      <p className="dark:text-white">
        There are no questions here!
        <br />
        If you think this is a mistake, talk to your team captain(s) about
        adding some!
      </p>
    );
  }
  return (
    <Flex flexDirection="col" alignItems="start">
      {showAnswer && (
        <Flex>
          <Subtitle className="w-1/2">Questions</Subtitle>
          <Subtitle className="w-1/2">Answers</Subtitle>
        </Flex>
      )}
      <List className="mb-4">
        {props.questions.map((question) => {
          return (
            <ListItem key={question.id}>
              <Link href={`/static/question/${question.id}`} className="w-full">
                <Flex className="w-full gap-2">
                  <DisplayFormattedText
                    className={
                      "line-clamp-2 grow overflow-clip overflow-ellipsis text-tremor-default text-tremor-content dark:text-dark-tremor-content" +
                      (showAnswer ? " w-1/2" : "")
                    }
                    text={question.question}
                  />
                  {showAnswer && (
                    <DisplayFormattedText
                      className="line-clamp-2 w-1/2 grow overflow-clip overflow-ellipsis text-tremor-default text-tremor-content dark:text-dark-tremor-content"
                      text={question.answer}
                    />
                  )}
                </Flex>
              </Link>
            </ListItem>
          );
        })}
      </List>
      {props.totalPages && props.totalPages > 1 && (
        <Pagination totalPages={props.totalPages} />
      )}
    </Flex>
  );
}
