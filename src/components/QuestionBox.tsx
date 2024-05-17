import DisplayFormattedText from "@/components/utils/DisplayFormattedText";
import { QuestionWithRoundData } from "@/src/utils/quiz-session-type-extension";
import { ArrowRight, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type QuestionBoxProps = {
  question: QuestionWithRoundData;
  questionId: number;
  quiet: boolean;
  isLastQuestion: boolean;
  autoNext: boolean;
  onNext: () => void;
  openInfo: () => void;
};

export default function QuestionBox({
  autoNext,
  isLastQuestion,
  onNext,
  openInfo,
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
      {question.round?.alphabetRound && (
        <span className="text-slate-600 max-sm:text-lg dark:text-slate-400">
          Alphabet Round Letter:{" "}
          {question.round.alphabetRound.letter.toUpperCase()}
        </span>
      )}
      {question.round?.themeRound && (
        <span className="text-slate-600 max-sm:text-lg dark:text-slate-400">
          Part of a theme round:{" "}
          <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
            {question.round.themeRound.theme}
          </p>
        </span>
      )}
      <DisplayFormattedText text={question.question} />
      <div className="mt-4 flex">
        {!answerShown ? (
          <button
            onClick={() => {
              setAnswerShown(true);
              if (autoNext) {
                onNext();
              }
            }}
            className="rounded-md bg-blue-500 px-3 py-1 hover:bg-blue-600"
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
        <div className="ml-auto flex flex-col gap-2">
          <button
            onClick={() => openInfo()}
            className="rounded-md bg-gray-500 px-3 py-1 hover:bg-gray-600"
          >
            Question Info
          </button>
          {answerShown && isLastQuestion && !autoNext && (
            <button
              disabled={clickedNext}
              onClick={() => {
                if (!clickedNext) {
                  setClickedNext(true);
                  onNext();
                }
              }}
              className="ml-auto h-fit shrink-0 rounded-md bg-blue-500 px-3 py-1 hover:bg-blue-600"
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
      </div>
    </div>
  );
}
