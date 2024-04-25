"use client";

import DisplayFormattedText from "@/components/utils/DisplayFormattedText";
import QuestionInfoDialog from "@/components/utils/QuestionInfoDialog";
import QuizFinished from "@/components/utils/QuizFinished";
import { updateQuestionStatus } from "@/src/lib/quiz-sessions/update-question-status";
import { filterNotEmpty } from "@/src/utils/array-utils";
import {
  QuizSessionWithQuestions,
  QuestionWithRoundData,
} from "@/src/utils/quiz-session-type-extension";
import { CategoryBar, Flex, Title } from "@tremor/react";
import { Check, HelpCircle, Undo2, X } from "lucide-react";
import { useMemo, useState } from "react";

type FlashcardsProps = {
  quizSession: QuizSessionWithQuestions;
};

export default function Flashcards(props: FlashcardsProps) {
  // Initialize values from database
  const questions = useMemo(
    () =>
      props.quizSession.questionsTrackers
        .map(({ question }) => question)
        .filter(filterNotEmpty),
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
  const [hiddenCards, setHiddenCards] = useState<number[]>(
    initialCorrect.concat(initialIncorrect),
  );
  const [correctQuestions, setCorrectQuestions] = useState(initialCorrect);
  const [incorrectQuestions, setIncorrectQuestions] =
    useState(initialIncorrect);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestionIndex = useMemo(() => {
    return correctQuestions.length + incorrectQuestions.length;
  }, [correctQuestions, incorrectQuestions]);

  const currentQuestion = questions[currentQuestionIndex];

  async function markQuestion(correct: boolean) {
    if (currentQuestion !== undefined) {
      const tracker = props.quizSession.questionsTrackers.find(
        ({ questionId }) => questionId === currentQuestion.id,
      );
      if (!tracker) {
        alert("Failed to save question response!");
        return;
      }
      setIsSaving(true);
      try {
        if (
          await updateQuestionStatus(
            tracker.id,
            correct ? "Correct" : "Incorrect",
          )
        ) {
          if (currentQuestionIndex === questions.length - 1) {
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
            setCorrectQuestions((prev) => [...prev, currentQuestion.id]);
          } else {
            setIncorrectQuestions((prev) => [...prev, currentQuestion.id]);
          }
        }
      } finally {
        setIsSaving(false);
      }
    }
  }

  async function undoQuestion() {
    const lastQuestion = questions[currentQuestionIndex - 1];
    if (lastQuestion) {
      const tracker = props.quizSession.questionsTrackers.find(
        ({ questionId }) => questionId === lastQuestion.id,
      );
      if (!tracker) {
        alert("Failed to undo question!");
        return;
      }
      setIsSaving(true);
      try {
        if (await updateQuestionStatus(tracker.id, "Incomplete")) {
          setHiddenCards((prev) => prev.filter((id) => lastQuestion.id !== id));
          setCorrectQuestions((prev) =>
            prev.filter((id) => lastQuestion.id !== id),
          );
          setIncorrectQuestions((prev) =>
            prev.filter((id) => lastQuestion.id !== id),
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
          {currentQuestionIndex} / {questions.length}
        </Title>
      )}
      <CategoryBar
        className="w-full"
        values={[
          (incorrectQuestions.length * 100) / questions.length,
          (correctQuestions.length * 100) / questions.length,
          ((questions.length - currentQuestionIndex) * 100) / questions.length,
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
        {!currentQuestion && (
          <div className="absolute left-0 flex h-full w-full flex-col justify-center text-center">
            <QuizFinished quizType="Flashcards" />
          </div>
        )}
        {currentQuestion &&
          questions.map((question, index) => {
            if (hiddenCards.includes(question.id)) {
              return null;
            }
            return (
              <Flashcard
                key={question.id}
                isCurrent={question.id === currentQuestion.id}
                question={question}
                isDisappearing={index < currentQuestionIndex}
                onDisappear={() => {
                  setHiddenCards((prev) =>
                    [...prev, question.id].filter(
                      (id, index, arr) => arr.indexOf(id) === index,
                    ),
                  );
                }}
              />
            );
          })}
      </div>
      <div className="flex justify-between">
        <button
          disabled={!currentQuestion || isSaving}
          onClick={() => undoQuestion()}
          className="aspect-square rounded-full border-2 border-tremor-border p-2 text-tremor-content active:bg-tremor-content-subtle disabled:bg-tremor-content-subtle dark:border-dark-tremor-border dark:text-dark-tremor-content dark:active:bg-dark-tremor-content-subtle disabled:dark:bg-dark-tremor-content-subtle "
        >
          <Undo2 />
        </button>
        <div className="flex grow justify-center gap-16 max-sm:gap-12">
          <button
            disabled={currentQuestion === undefined || isSaving}
            onClick={() => markQuestion(false)}
            className="aspect-square rounded-full border-2 border-red-500 p-2 text-red-500 active:bg-red-900 disabled:bg-tremor-content-subtle disabled:dark:bg-dark-tremor-content-subtle"
          >
            <X />
          </button>
          <button
            disabled={currentQuestion === undefined || isSaving}
            onClick={() => markQuestion(true)}
            className="aspect-square rounded-full border-2 border-green-500 p-2 text-green-500 active:bg-green-800 disabled:bg-tremor-content-subtle disabled:dark:bg-dark-tremor-content-subtle"
          >
            <Check />
          </button>
        </div>
        <button
          onClick={() => {
            if (currentQuestion) {
              setIsInfoOpen(true);
            }
          }}
          disabled={!currentQuestion}
          className="aspect-square rounded-full border-2 border-tremor-border p-2 text-tremor-content disabled:bg-tremor-content-subtle dark:border-dark-tremor-border dark:text-dark-tremor-content disabled:dark:bg-dark-tremor-content-subtle"
        >
          <HelpCircle />
        </button>
      </div>
      <QuestionInfoDialog
        open={isInfoOpen}
        setOpen={setIsInfoOpen}
        question={currentQuestion}
      />
    </main>
  );
}

type FlashcardProps = {
  question: QuestionWithRoundData;
  isCurrent: boolean;
  isDisappearing: boolean;
  onDisappear?: () => void;
};
function Flashcard({
  question,
  isCurrent,
  isDisappearing,
  onDisappear,
}: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      data-question-id={question.id}
      className="absolute left-0 h-full w-full cursor-pointer rounded-lg text-center"
      style={{
        perspective: "1000px",
        transition: "all cubic-bezier(0.4, 0, 0.2, 1) 400ms",
        transform: isDisappearing ? "scale(0)" : "scale(1)",
        bottom: isDisappearing ? "100%" : "0%",
        ...(isDisappearing ? { zIndex: 40 } : isCurrent ? { zIndex: 30 } : {}),
      }}
      onTransitionEnd={() => {
        if (isDisappearing) {
          onDisappear?.();
        }
      }}
      onClick={() => {
        setFlipped(!flipped);
      }}
    >
      <div
        className="relative h-full w-full transition-transform"
        style={{
          transform: flipped ? "rotateX(180deg)" : "rotateX(0deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {(isCurrent || isDisappearing) && (
          <>
            <div
              className="front absolute left-0 top-0 z-10 flex h-full w-full flex-col justify-center overflow-hidden rounded-lg bg-slate-100 p-4 shadow-lg dark:bg-dark-tremor-background"
              style={{
                backfaceVisibility: "hidden",
              }}
            >
              <div className="overflow-auto">
                {question.round?.alphabetRound && (
                  <span className="text-xl text-slate-600 max-sm:text-lg dark:text-slate-400">
                    Alphabet Round Letter: {question.round.alphabetRound.letter}
                  </span>
                )}
                {question.round?.themeRound && (
                  <span className="text-xl text-slate-600 max-sm:text-lg dark:text-slate-400">
                    Part of a theme round, see question info
                  </span>
                )}
                <DisplayFormattedText
                  className="text-3xl max-sm:text-2xl dark:text-white"
                  text={question.question}
                />
              </div>
            </div>
            <div
              className="back absolute left-0 top-0 flex h-full w-full flex-col justify-center overflow-hidden rounded-lg bg-slate-100 p-4 shadow-lg dark:bg-dark-tremor-background"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateX(180deg)",
              }}
            >
              <DisplayFormattedText
                className="overflow-auto text-3xl max-sm:text-2xl dark:text-white"
                text={question.answer}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
