"use client";

import QuestionDisplay from "@/components/display/QuestionDisplay";
import { QuestionWithRoundData } from "@/src/utils/prisma-extensions";
import { Button, Subtitle, Text, Title } from "@tremor/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type MostMissedQuestionsProps = {
  questions: QuestionWithRoundData[];
};

export default function MostMissedQuestions(props: MostMissedQuestionsProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const question = props.questions[questionIndex];
  return (
    <div className="flex h-full flex-col gap-2">
      <Title>Most Missed Questions</Title>
      {props.questions.length === 0 ? (
        <Title>You haven&apos;t missed any questions!</Title>
      ) : (
        <>
          <div>
            <Title>
              <Link
                href={`/static/question/${question.id}`}
                className="text-blue-500"
              >
                Question #{question.id}
              </Link>
            </Title>
            <Subtitle>{question.category.name}</Subtitle>
            <QuestionDisplay question={question} key={questionIndex} />
          </div>
          <div className="mt-auto flex items-center justify-between">
            <Button
              size="xs"
              onClick={() => {
                setQuestionIndex((prev) => Math.max(0, prev - 1));
              }}
            >
              <ChevronLeft />
            </Button>
            <Text>
              {questionIndex + 1} / {props.questions.length}
            </Text>
            <Button
              size="xs"
              onClick={() => {
                setQuestionIndex((prev) =>
                  Math.min(prev + 1, props.questions.length - 1),
                );
              }}
            >
              <ChevronRight />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
