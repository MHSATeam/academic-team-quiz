"use client";

import DisplayFormattedText from "@/components/utils/DisplayFormattedText";
import { Question } from "@prisma/client";
import { useState } from "react";

export default function QuestionDisplay({ question }: { question: Question }) {
  const [answerShown, setAnswerShown] = useState(false);

  return (
    <div className="dark:text-slate-200">
      <DisplayFormattedText text={question.question} />
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
              <DisplayFormattedText text={question.answer} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
