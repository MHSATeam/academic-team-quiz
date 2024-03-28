import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type QuestionBoxProps = {
  question: string;
  questionId: number;
  answer: string;
  quiet: boolean;
  isLastQuestion: boolean;
  autoNext: boolean;
  onNext: () => void;
};

export default function QuestionBox({
  answer,
  autoNext,
  isLastQuestion,
  onNext,
  question,
  questionId,
  quiet,
}: QuestionBoxProps) {
  const [answerShown, setAnswerShown] = useState(false);
  const [animate, setAnimate] = useState(quiet);
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
      if (e.key === " " && isLastQuestion) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!answerShown) {
          setAnswerShown(true);
          if (autoNext && !clickedNext) {
            onNext();
            setClickedNext(true);
          }
        } else if (!clickedNext) {
          onNext();
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
  }, [answerShown, onNext, autoNext, clickedNext, isLastQuestion]);

  useEffect(() => {
    if (!autoNext && isLastQuestion) {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answerShown]);

  useEffect(() => {
    if (isLastQuestion && answerShown && autoNext && !clickedNext) {
      onNext();
      setClickedNext(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoNext]);

  useEffect(() => {
    setAnswerShown(false);
    setClickedNext(false);
  }, [questionId]);
  return (
    <div
      ref={questionBoxElement}
      className={
        "transition-transform " +
        (!animate ? "-translate-x-[200%]" : "translate-x-0")
      }
    >
      <span>{question}</span>
      <div className="mt-4">
        {!answerShown ? (
          <button
            onClick={() => {
              setAnswerShown(true);
              if (autoNext) {
                onNext();
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
              <span>{answer}</span>
            </div>
            {isLastQuestion && !autoNext && (
              <button
                disabled={clickedNext}
                onClick={() => {
                  if (!clickedNext) {
                    setClickedNext(true);
                    onNext();
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
