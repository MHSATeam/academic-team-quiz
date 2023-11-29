import { ArrowRight, Loader2 } from "lucide-react";
import { Key, useEffect, useRef, useState } from "react";

type QuestionBoxProps = {
  question: string;
  questionId: number;
  answer: string;
  quiet: boolean;
  isLastQuestion: boolean;
  autoNext: boolean;
  onNext: () => void;
};

export default function QuestionBox(props: QuestionBoxProps) {
  const [answerShown, setAnswerShown] = useState(false);
  const [animate, setAnimate] = useState(props.quiet);
  const [clickedNext, setClickedNext] = useState(false);
  const questionBoxElement = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      setAnimate(true);
      questionBoxElement.current?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  }, []);
  useEffect(() => {
    const onKeyPress = (e: KeyboardEvent) => {
      if (e.key === " " && props.isLastQuestion) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!answerShown) {
          setAnswerShown(true);
          if (props.autoNext && !clickedNext) {
            props.onNext();
            setClickedNext(true);
          }
        } else if (!clickedNext) {
          props.onNext();
          setClickedNext(true);
        }
      }
    };
    const onkeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") {
        e.preventDefault();
      }
    };
    document.addEventListener("keypress", onKeyPress);
    document.addEventListener("keyup", onkeyUp);
    return () => {
      document.removeEventListener("keypress", onKeyPress);
      document.removeEventListener("keyup", onkeyUp);
    };
  }, [answerShown, props.onNext, props.autoNext, clickedNext]);

  useEffect(() => {
    if (!props.autoNext && props.isLastQuestion) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [answerShown]);

  useEffect(() => {
    if (props.isLastQuestion && answerShown && props.autoNext && !clickedNext) {
      props.onNext();
      setClickedNext(true);
    }
  }, [props.autoNext]);

  useEffect(() => {
    setAnswerShown(false);
    setClickedNext(false);
  }, [props.questionId]);
  return (
    <div
      ref={questionBoxElement}
      className={
        "transition-transform " +
        (!animate ? "-translate-x-[200%]" : "translate-x-0")
      }
    >
      <span>{props.question}</span>
      <div className="mt-4">
        {!answerShown ? (
          <button
            onClick={() => {
              setAnswerShown(true);
              if (props.autoNext) {
                props.onNext();
              }
            }}
            className="bg-blue-400 rounded-md px-3 py-1 active:bg-blue-500"
          >
            Show Answer
          </button>
        ) : (
          <div className="flex gap-2">
            <div className="flex flex-col">
              <span className="font-bold">Answer: </span>
              <span>{props.answer}</span>
            </div>
            {props.isLastQuestion && !props.autoNext && (
              <button
                disabled={clickedNext}
                onClick={() => {
                  if (!clickedNext) {
                    setClickedNext(true);
                    props.onNext();
                  }
                }}
                className="bg-blue-400 h-fit rounded-md px-3 py-1 shrink-0 ml-auto"
              >
                <span className="flex gap-1">
                  Next
                  {clickedNext ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <ArrowRight />
                  )}
                </span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
