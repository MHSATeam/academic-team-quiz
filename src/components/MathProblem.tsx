import { useEffect, useState } from "react";
import { AnswerType, Problem } from "../math/math-types";
import { MathJax } from "better-react-mathjax";

type MathProblemProps = {
  problem: Problem;
};

export default function MathProblem({ problem }: MathProblemProps) {
  const [answerShown, setAnswerShown] = useState(false);
  return (
    <div className="flex flex-col border-2 rounded-md p-2 basis-1/5 grow">
      <MathJax>{problem.question}</MathJax>
      <div className="mt-auto">
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
    </div>
  );
}
