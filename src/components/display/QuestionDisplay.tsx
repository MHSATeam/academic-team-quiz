"use client";

import QuestionText from "@/components/display/QuestionText";
import {
  QuestionWithRoundData,
  addRoundData,
} from "@/src/utils/quiz-session-type-extension";
import { Question } from "@prisma/client";
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
    <div className="dark:text-slate-200">
      <QuestionText question={questionWithData} />
      <div className="mt-4">
        {!answerShown ? (
          <button
            onClick={() => {
              setAnswerShown(true);
            }}
            className="rounded-md bg-blue-400 px-3 py-1 active:bg-blue-500"
          >
            Show Answer
          </button>
        ) : (
          <div className="flex gap-2">
            <div className="flex flex-col">
              <span className="font-bold">Answer: </span>
              <QuestionText question={questionWithData} showQuestion={false} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
