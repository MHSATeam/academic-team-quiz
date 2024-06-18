"use client";
import { AlertTriangle, Loader2, ArrowRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import ScrollToTop from "../../utils/ScrollToTop";
import {
  Callout,
  Metric,
  MultiSelect,
  MultiSelectItem,
  Switch,
} from "@tremor/react";
import { Category } from "@prisma/client";
import { QuestionWithRoundData } from "@/src/utils/prisma-extensions";
import QuestionInfoDialog from "@/components/layout/QuestionInfoDialog";
import useLocalStorage from "@/src/hooks/use-local-storage";
import DisplayFormattedText from "@/components/utils/DisplayFormattedText";

type QuizQuestion = {
  id: number;
  question: QuestionWithRoundData;
  quiet: boolean;
};

export default function QuickQuiz({ categories }: { categories: Category[] }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedSets, setSelectedSets] = useLocalStorage<number[]>(
    "set-list",
    [],
  );
  const [autoNext, setAutoNext] = useLocalStorage("auto-next", false);
  const [infoQuestion, setInfoQuestion] =
    useState<QuestionWithRoundData | null>(null);

  const swapValue = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getNextQuestion = async (
    quiet: boolean = false,
    errorCount = 0,
  ): Promise<QuizQuestion> => {
    const question: Partial<QuizQuestion> = {
      quiet,
    };

    try {
      const response = await fetch("/api/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categories: selectedSets,
        }),
      }).then((response) => response.json());
      if (questions.find((q) => q.id === response.id)) {
        return getNextQuestion(quiet, errorCount + 0.5);
      }
      question.id = response.id;
      question.question = response as QuestionWithRoundData;
    } catch (e) {
      console.error(e);
      if (errorCount < 3) {
        return getNextQuestion(quiet, errorCount + 1);
      } else {
        alert(
          "There was an error fetching the question. Please try again later.",
        );
        throw new Error("Failed to fetch new question");
      }
    }
    return question as QuizQuestion;
  };

  const swapLastQuestion = async (swap: number) => {
    const newQuestion = await getNextQuestion(true);
    if (swap === swapValue.current) {
      setQuestions((prev) => {
        const newArray = [...prev];
        newArray.splice(prev.length - 1, 1, newQuestion);
        return newArray;
      });
    }
  };

  useEffect(() => {
    swapLastQuestion(++swapValue.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSets]);

  return (
    <div
      className="h-full overflow-auto px-6 py-12 dark:text-white"
      ref={scrollRef}
    >
      <Metric className="mb-4">Quick Quiz</Metric>
      <Callout
        title="Streak Notice"
        color="rose"
        className="mb-4"
        icon={AlertTriangle}
      >
        Answering questions here does NOT count towards your streak!
      </Callout>
      <MultiSelect
        className="mb-4"
        value={selectedSets.map((id) => id.toString())}
        onValueChange={(values) => {
          setSelectedSets(
            values
              .map((id) => Number(id))
              .filter((number) => !Number.isNaN(number)),
          );
        }}
      >
        {categories.map((category) => (
          <MultiSelectItem key={category.id} value={category.id.toString()}>
            {category.name}
          </MultiSelectItem>
        ))}
      </MultiSelect>
      <div className="m-2 flex gap-2">
        <label htmlFor="auto-next">Auto Switch Question</label>
        <Switch
          id="auto-next"
          checked={autoNext}
          onChange={(newValue) => {
            setAutoNext(newValue);
          }}
        />
      </div>
      {questions.map((question, index) => {
        const isLast = index + 1 === questions.length;
        return (
          <React.Fragment key={index}>
            <hr className="my-4" />
            <QuestionBox
              onNext={async () => {
                const newQuestion = await getNextQuestion();
                setQuestions((prev) => {
                  return [...prev, newQuestion];
                });
              }}
              autoNext={autoNext}
              question={question.question}
              questionId={question.id}
              quiet={question.quiet}
              isLastQuestion={isLast}
              openInfo={() => {
                setInfoQuestion(question.question);
              }}
            />
          </React.Fragment>
        );
      })}
      {questions.length === 0 && (
        <span className="flex justify-center gap-2 text-2xl">
          Loading
          <Loader2 className="my-auto animate-spin" />
        </span>
      )}
      <ScrollToTop scrollParent={scrollRef} />
      <QuestionInfoDialog
        open={infoQuestion !== null}
        setOpen={() => {
          setInfoQuestion(null);
        }}
        question={infoQuestion ?? undefined}
      />
    </div>
  );
}

type QuestionBoxProps = {
  question: QuestionWithRoundData;
  questionId: number;
  quiet: boolean;
  isLastQuestion: boolean;
  autoNext: boolean;
  onNext: () => void;
  openInfo: () => void;
};

function QuestionBox({
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
