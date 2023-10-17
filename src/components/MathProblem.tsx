import { useState } from "react";
import { AnswerType, Problem } from "../math-types";
import { MathJax } from "better-react-mathjax";

type MathProblemProps = {
  problem: Problem;
};

export default function MathProblem(props: MathProblemProps) {
  const [answerShown, setAnswerShown] = useState(false);
  const problem = props.problem;
  return (
    <div className="question">
      <MathJax>{problem.question}</MathJax>
      <div className="answer-container">
        <span>
          {problem.answerType === AnswerType.AllOrdered
            ? "Answers in order:"
            : problem.answerType === AnswerType.Any
            ? "Answers (only one needed):"
            : problem.answers.length === 1
            ? "Answer:"
            : "Answers:"}
        </span>
        {!answerShown ? (
          <button
            onClick={() => {
              setAnswerShown(true);
            }}
            className="show-answer-button"
          ></button>
        ) : (
          <span>
            <MathJax>{problem.answers.join(", ")}</MathJax>
          </span>
        )}
      </div>
    </div>
  );
}
