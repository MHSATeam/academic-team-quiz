"use client";
import { AlertTriangle, Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import QuestionBox from "../QuestionBox";
import ScrollToTop from "../utils/ScrollToTop";
import {
  Callout,
  Metric,
  MultiSelect,
  MultiSelectItem,
  Switch,
} from "@tremor/react";
import { Category } from "@prisma/client";
import { QuestionWithRoundData } from "@/src/utils/quiz-session-type-extension";
import QuestionInfoDialog from "@/components/utils/QuestionInfoDialog";
import useLocalStorage from "@/src/hooks/use-local-storage";

type QuizQuestion = {
  id: number;
  question: QuestionWithRoundData;
  quiet: boolean;
};

export default function QuizPage({ categories }: { categories: Category[] }) {
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
