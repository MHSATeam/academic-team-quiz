"use client";

import QuestionText from "@/components/display/QuestionText";
import {
  QuestionWithRoundData,
  addRoundData,
} from "@/src/utils/prisma-extensions";
import { Question } from "@prisma/client";
import { Button } from "@tremor/react";
import { useState } from "react";

export default function QuestionDisplay({
  question,
}: {
  question: Question | QuestionWithRoundData;
}) {
  const [answerShown, setAnswerShown] = useState(false);

  let questionWithData: QuestionWithRoundData;
  if (!("category" in question)) {
    questionWithData = addRoundData(question);
  } else {
    questionWithData = question;
  }

  return (
    <div>
      <QuestionText
        className="text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis"
        question={questionWithData}
      />
      <div className="mt-4">
        {!answerShown ? (
          <Button
            size="xs"
            onClick={() => {
              setAnswerShown(true);
            }}
          >
            Show Answer
          </Button>
        ) : (
          <div className="flex gap-2">
            <div className="flex flex-col text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
              <span className="font-bold">Answer: </span>
              <QuestionText question={questionWithData} showQuestion={false} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
