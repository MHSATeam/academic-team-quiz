import DisplayFormattedText from "@/components/utils/DisplayFormattedText";
import Pagination from "@/components/utils/Pagination";
import { Question } from "@prisma/client";
import { Flex, List, ListItem } from "@tremor/react";
import Link from "next/link";

type QuestionListProps = {
  questions: Question[];
  totalPages?: number;
};
export default function QuestionList(props: QuestionListProps) {
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
      <List className="mb-4">
        {props.questions.map((question) => {
          return (
            <ListItem key={question.id}>
              <Link href={`/static/question/${question.id}`}>
                <Flex className="gap-2">
                  <DisplayFormattedText
                    className="line-clamp-2 overflow-clip overflow-ellipsis text-tremor-default text-tremor-content dark:text-dark-tremor-content"
                    text={question.question}
                  />
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
