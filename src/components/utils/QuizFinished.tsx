import { QuizType } from "@prisma/client";
import { Button, Flex, Title } from "@tremor/react";
import Link from "next/link";

export default function QuizFinished({ quizType }: { quizType: QuizType }) {
  return (
    <Flex flexDirection="col" className="gap-2">
      <Title>All Done!</Title>
      <Link href={`/study/quiz-session?type=${quizType}`}>
        <Button>Study Again?</Button>
      </Link>
      <Link href={`/`}>
        <Button>Go Home</Button>
      </Link>
    </Flex>
  );
}
