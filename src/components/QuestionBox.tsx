import { useEffect, useRef, useState } from "react";

type QuestionBoxProps = {
  question: string;
  questionId: number;
  answer: string;
  quiet: boolean;
  onNext: () => void;
};

export default function QuestionBox(props: QuestionBoxProps) {
  const [answerShown, setAnswerShown] = useState(false);
  const [animate, setAnimate] = useState(props.quiet);
  const questionBoxElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      setAnimate(true);
      questionBoxElement.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }, []);
  return (
    <div
      ref={questionBoxElement}
      className={"question-box" + (!animate ? " hidden-left " : "")}
    >
      <h2>{props.question}</h2>
      <p className="question-correct-answer-container">
        Answer:&nbsp;
        {!answerShown && (
          <button
            onClick={() => {
              setAnswerShown(true);
              props.onNext();
            }}
            className="show-answer-button"
          ></button>
        )}
        {answerShown && <span>{props.answer}</span>}
      </p>
    </div>
  );
}
