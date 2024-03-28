"use client";
import { AlertTriangle, Loader2 } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import useLocalStorage from "@/src/utils/use-local-storage";

export default function QuizPage({ categories }: { categories: Category[] }) {
  const [questions, setQuestions] = useState<
    { id: number; question: string; answer: string; quiet: boolean }[]
  >([]);
  const [selectedSets, setSelectedSets] = useLocalStorage<number[]>(
    "set-list",
    []
  );
  const [autoNext, setAutoNext] = useLocalStorage("auto-next", false);

  const swapValue = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getNextQuestion = useCallback(
    async (
      quiet: boolean = false,
      errorCount = 0
    ): Promise<{
      id: number;
      question: string;
      answer: string;
      quiet: boolean;
    }> => {
      const question = {
        id: 0,
        question: "",
        answer: "",
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
        question.question = response.question;
        question.id = response.id;
        question.answer = response.answer;
      } catch (e) {
        console.error(e);
        if (errorCount < 3) {
          return getNextQuestion(quiet, errorCount + 1);
        } else {
          alert(
            "There was an error fetching the question. Please try again later."
          );
          throw new Error("Failed to fetch new question");
        }
      }
      return question;
    },
    [questions, selectedSets]
  );

  const swapLastQuestion = useCallback(
    async (swap: number) => {
      const newQuestion = await getNextQuestion(true);
      if (swap === swapValue.current) {
        setQuestions((prev) => {
          const newArray = [...prev];
          newArray.splice(prev.length - 1, 1, newQuestion);
          return newArray;
        });
      }
    },
    [getNextQuestion]
  );

  useEffect(() => {
    swapLastQuestion(++swapValue.current);
  }, [selectedSets, swapLastQuestion]);

  return (
    <div
      className="px-6 py-12 dark:text-white h-full overflow-auto"
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
              .filter((number) => !Number.isNaN(number))
          );
        }}
      >
        {categories.map((category) => (
          <MultiSelectItem key={category.id} value={category.id.toString()}>
            {category.name}
          </MultiSelectItem>
        ))}
      </MultiSelect>
      <div className="flex m-2 gap-2">
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
              answer={question.answer}
              questionId={question.id}
              quiet={question.quiet}
              isLastQuestion={isLast}
            />
          </React.Fragment>
        );
      })}
      {questions.length === 0 && (
        <span className="justify-center text-2xl flex gap-2">
          Loading
          <Loader2 className="animate-spin my-auto" />
        </span>
      )}
      <ScrollToTop scrollParent={scrollRef} />
    </div>
  );
}
