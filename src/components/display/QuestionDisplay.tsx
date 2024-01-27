"use client";

import { Question } from "@prisma/client";
import { useState } from "react";

export default function QuestionDisplay({ question }: { question: Question }) {
  const [answerShown, setAnswerShown] = useState(false);

  return (
    <div className="dark:text-slate-200">
      <span>{question.question}</span>
      <div className="mt-4">
        {!answerShown ? (
          <button
            onClick={() => {
              setAnswerShown(true);
            }}
            className="bg-blue-400 rounded-md px-3 py-1 active:bg-blue-500"
          >
            Show Answer
          </button>
        ) : (
          <div className="flex gap-2">
            <div className="flex flex-col">
              <span className="font-bold">Answer: </span>
              <span>{question.answer}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
