"use client";

import { Flashcard } from "@/components/utils/Flashcard";
import QuestionInfoDialog from "@/components/utils/QuestionInfoDialog";
import QuizFinished from "@/components/utils/QuizFinished";
import { updateQuestionStatus } from "@/src/lib/quiz-sessions/update-question-status";
import { filterNotEmpty } from "@/src/utils/array-utils";
import { QuizSessionWithQuestions } from "@/src/utils/quiz-session-type-extension";
import { CategoryBar, Flex, Title } from "@tremor/react";
import { Check, HelpCircle, Undo2, X } from "lucide-react";
import { useMemo, useState } from "react";

type FlashcardsProps = {
  quizSession: QuizSessionWithQuestions;
};

export default function Flashcards(props: FlashcardsProps) {
  // Initialize values from database
  const questionTrackers = useMemo(
    () =>
      props.quizSession.questionsTrackers.filter((q) =>
        filterNotEmpty(q.question),
      ),
    [props.quizSession],
  );

  const { initialCorrect, initialIncorrect } = useMemo(
    () =>
      props.quizSession.questionsTrackers.reduce(
        (acc, tracker) => {
          if (!tracker.question) {
            return acc;
          }
          if (tracker.result === "Correct") {
            acc.initialCorrect.push(tracker.question.id);
          }
          if (tracker.result === "Incorrect") {
            acc.initialIncorrect.push(tracker.question.id);
          }
          return acc;
        },
        { initialCorrect: [], initialIncorrect: [] } as {
          initialCorrect: number[];
          initialIncorrect: number[];
        },
      ),
    [props.quizSession],
  );

  // Setup program state based on loaded values
  const [correctQuestions, setCorrectQuestions] = useState(initialCorrect);
  const [incorrectQuestions, setIncorrectQuestions] =
    useState(initialIncorrect);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestionIndex = useMemo(() => {
    return correctQuestions.length + incorrectQuestions.length;
  }, [correctQuestions, incorrectQuestions]);

  const currentTracker = questionTrackers[currentQuestionIndex];

  async function markQuestion(correct: boolean) {
    if (currentTracker !== undefined) {
      setIsSaving(true);
      try {
        if (
          await updateQuestionStatus(
            currentTracker.id,
            correct ? "Correct" : "Incorrect",
          )
        ) {
          if (currentQuestionIndex === questionTrackers.length - 1) {
            const res = await fetch("/api/complete-quiz", {
              method: "POST",
              body: JSON.stringify({
                quizSessionId: props.quizSession.id,
              }),
              headers: {
                "Content-Type": "application/json",
              },
            });
            if (!res.ok) {
              alert("Failed to mark quiz as completed!");
              return;
            }
          }
          if (correct) {
            setCorrectQuestions((prev) => [...prev, currentTracker.id]);
          } else {
            setIncorrectQuestions((prev) => [...prev, currentTracker.id]);
          }
        }
      } finally {
        setIsSaving(false);
      }
    }
  }

  async function undoQuestion() {
    const lastTracker = questionTrackers[currentQuestionIndex - 1];
    if (lastTracker) {
      setIsSaving(true);
      try {
        if (await updateQuestionStatus(lastTracker.id, "Incomplete")) {
          setCorrectQuestions((prev) =>
            prev.filter((id) => lastTracker.id !== id),
          );
          setIncorrectQuestions((prev) =>
            prev.filter((id) => lastTracker.id !== id),
          );
        }
      } finally {
        setIsSaving(false);
      }
    }
  }

  const createProgressBar = (large: boolean) => (
    <Flex
      className={large ? "max-sm:hidden" : "hidden max-sm:flex"}
      flexDirection="col"
    >
      {large && (
        <Title>
          {currentQuestionIndex} / {questionTrackers.length}
        </Title>
      )}
      <CategoryBar
        className="w-full"
        values={[
          (incorrectQuestions.length * 100) / questionTrackers.length,
          (correctQuestions.length * 100) / questionTrackers.length,
          ((questionTrackers.length - currentQuestionIndex) * 100) /
            questionTrackers.length,
        ]}
        colors={["red", "green", "neutral"]}
        showLabels={false}
      />
    </Flex>
  );

  return (
    <main className="flex h-full w-full flex-col gap-4 p-8">
      <Flex className="w-full gap-2" justifyContent="start" flexDirection="col">
        <div className="flex w-full justify-between gap-16 whitespace-nowrap p-2">
          <span className="flex items-center gap-2 text-lg font-bold text-red-500">
            <span className="rounded-md bg-red-500 px-2 py-1 text-red-200 ">
              {incorrectQuestions.length}
            </span>
            Still Learning
          </span>
          {createProgressBar(true)}
          <span className="flex items-center gap-2 whitespace-nowrap text-lg font-bold text-green-500">
            Know
            <span className="rounded-md bg-green-500 px-2 py-1 text-green-200">
              {correctQuestions.length}
            </span>
          </span>
        </div>
        {createProgressBar(false)}
      </Flex>
      <div className="relative grow">
        {!currentTracker && (
          <div className="absolute left-0 flex h-full w-full flex-col justify-center text-center">
            <QuizFinished quizType="Flashcards" />
          </div>
        )}
        {currentTracker &&
          questionTrackers.map((tracker) => {
            return (
              <Flashcard
                key={tracker.question!.id}
                answer={tracker.result}
                question={tracker.question!}
                isCurrent={tracker === currentTracker}
              />
            );
          })}
      </div>
      <div className="flex justify-between">
        <button
          disabled={!currentTracker || isSaving}
          onClick={() => undoQuestion()}
          className="aspect-square rounded-full border-2 border-tremor-border p-2 text-tremor-content active:bg-tremor-content-subtle disabled:bg-tremor-content-subtle dark:border-dark-tremor-border dark:text-dark-tremor-content dark:active:bg-dark-tremor-content-subtle disabled:dark:bg-dark-tremor-content-subtle "
        >
          <Undo2 />
        </button>
        <div className="flex grow justify-center gap-16 max-sm:gap-12">
          <button
            disabled={currentTracker === undefined || isSaving}
            onClick={() => markQuestion(false)}
            className="aspect-square rounded-full border-2 border-red-500 p-2 text-red-500 active:bg-red-900 disabled:bg-tremor-content-subtle disabled:dark:bg-dark-tremor-content-subtle"
          >
            <X />
          </button>
          <button
            disabled={currentTracker === undefined || isSaving}
            onClick={() => markQuestion(true)}
            className="aspect-square rounded-full border-2 border-green-500 p-2 text-green-500 active:bg-green-800 disabled:bg-tremor-content-subtle disabled:dark:bg-dark-tremor-content-subtle"
          >
            <Check />
          </button>
        </div>
        <button
          onClick={() => {
            if (currentTracker) {
              setIsInfoOpen(true);
            }
          }}
          disabled={!currentTracker}
          className="aspect-square rounded-full border-2 border-tremor-border p-2 text-tremor-content disabled:bg-tremor-content-subtle dark:border-dark-tremor-border dark:text-dark-tremor-content disabled:dark:bg-dark-tremor-content-subtle"
        >
          <HelpCircle />
        </button>
      </div>
      <QuestionInfoDialog
        open={isInfoOpen}
        setOpen={setIsInfoOpen}
        question={currentTracker.question!}
      />
    </main>
  );
}
