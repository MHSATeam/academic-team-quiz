import { useEffect, useState } from "react";
import { AnswerType, Problem } from "../lib/math/math-types";
import { MathJax } from "better-react-mathjax";
import { Card } from "@tremor/react";

type MathProblemProps = {
  problem: Problem;
};

export default function MathProblem({ problem }: MathProblemProps) {
  const [answerShown, setAnswerShown] = useState(false);
  return (
    <Card>
      <MathJax className="dark:text-white">{problem.question}</MathJax>
      <div className="mt-auto">
        <div className="mt-4 dark:text-white">
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
            <>
              <span className="font-bold">
                {problem.answerType === AnswerType.AllOrdered
                  ? "Answers in order:"
                  : problem.answerType === AnswerType.Any
                  ? "Answers (only one needed):"
                  : problem.answers.length === 1
                  ? "Answer:"
                  : "Answers:"}
              </span>
              <MathJax>{problem.answers.join(", ")}</MathJax>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
