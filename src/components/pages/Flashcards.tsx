"use client";

import { updateQuestionStatus } from "@/src/lib/quiz-sessions/update-question-status";
import { filterNotEmpty } from "@/src/utils/array-utils";
import { QuizSessionWithQuestions } from "@/src/utils/quiz-session-type-extension";
import { Question, Result } from "@prisma/client";
import { Button, Flex, ProgressBar, Title } from "@tremor/react";
import { Check, Settings2, Undo2, X } from "lucide-react";
import Link from "next/link";
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
    [props.quizSession]
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
        }
      ),
    [props.quizSession]
  );

  // Setup program state based on loaded values
  const [hiddenCards, setHiddenCards] = useState<number[]>(
    initialCorrect.concat(initialIncorrect)
  );
  const [correctQuestions, setCorrectQuestions] = useState(initialCorrect);
  const [incorrectQuestions, setIncorrectQuestions] =
    useState(initialIncorrect);

  const currentQuestionIndex = useMemo(() => {
    return correctQuestions.length + incorrectQuestions.length;
  }, [correctQuestions, incorrectQuestions]);

  const currentQuestion = questions[currentQuestionIndex];

  async function markQuestion(correct: boolean) {
    if (currentQuestion !== undefined) {
      const tracker = props.quizSession.questionsTrackers.find(
        ({ questionId }) => questionId === currentQuestion.id
      );
      if (!tracker) {
        alert("Failed to save question response!");
        return;
      }
      if (
        await updateQuestionStatus(
          tracker.id,
          correct ? "Correct" : "Incorrect"
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
    }
  }

  async function undoQuestion() {
    const lastQuestion = questions[currentQuestionIndex - 1];
    if (lastQuestion) {
      const tracker = props.quizSession.questionsTrackers.find(
        ({ questionId }) => questionId === lastQuestion.id
      );
      if (!tracker) {
        alert("Failed to undo question!");
        return;
      }
      if (await updateQuestionStatus(tracker.id, "Incomplete")) {
        setHiddenCards((prev) => prev.filter((id) => lastQuestion.id !== id));
        setCorrectQuestions((prev) =>
          prev.filter((id) => lastQuestion.id !== id)
        );
        setIncorrectQuestions((prev) =>
          prev.filter((id) => lastQuestion.id !== id)
        );
      }
    }
  }

  return (
    <main className="h-full w-full flex flex-col p-8 gap-4">
      <Flex className="w-full gap-2" justifyContent="start" flexDirection="col">
        <div className="flex w-full justify-between p-2 gap-16 whitespace-nowrap">
          <span className="flex gap-2 items-center text-red-500 font-bold text-lg">
            <span className="text-red-200 bg-red-500 rounded-md px-2 py-1 ">
              {incorrectQuestions.length}
            </span>
            Still Learning
          </span>
          <Flex className="max-sm:hidden" flexDirection="col">
            <Title>
              {currentQuestionIndex} / {questions.length}
            </Title>
            <ProgressBar
              value={(currentQuestionIndex * 100) / questions.length}
            />
          </Flex>
          <span className="flex gap-2 items-center text-green-500 font-bold text-lg whitespace-nowrap">
            Know
            <span className="text-green-200 bg-green-500 rounded-md px-2 py-1">
              {correctQuestions.length}
            </span>
          </span>
        </div>
        <Flex className="hidden max-sm:flex" flexDirection="col">
          <ProgressBar
            value={(currentQuestionIndex * 100) / questions.length}
          />
        </Flex>
      </Flex>
      <div className="grow relative">
        {!currentQuestion && (
          <div className="w-full h-full absolute left-0 text-center flex flex-col justify-center">
            <Title>All Done!</Title>
            <Link href={"/study/quiz-session?type=Flashcards"}>
              <Button>Study Again?</Button>
            </Link>
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
                      (id, index, arr) => arr.indexOf(id) === index
                    )
                  );
                }}
              />
            );
          })}
      </div>
      <div className="flex justify-between">
        <button
          onClick={() => undoQuestion()}
          className="rounded-full aspect-square border-2 p-2 dark:border-dark-tremor-border border-tremor-border dark:text-dark-tremor-content text-tremor-content active:bg-tremor-content-subtle dark:active:bg-dark-tremor-content-subtle "
        >
          <Undo2 />
        </button>
        <div className="flex justify-center gap-16 max-sm:gap-12 grow">
          <button
            disabled={currentQuestion === undefined}
            onClick={() => markQuestion(false)}
            className="rounded-full aspect-square text-red-500 border-2 p-2 border-red-500 active:bg-red-900"
          >
            <X />
          </button>
          <button
            disabled={currentQuestion === undefined}
            onClick={() => markQuestion(true)}
            className="rounded-full aspect-square text-green-500 border-2 p-2 border-green-500 active:bg-green-800"
          >
            <Check />
          </button>
        </div>
        <button className="rounded-full aspect-square border-2 p-2 dark:border-dark-tremor-border border-tremor-border dark:text-dark-tremor-content text-tremor-content">
          <Settings2 />
        </button>
      </div>
    </main>
  );
}

type FlashcardProps = {
  question: Question;
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
      className="w-full h-full absolute left-0 text-center rounded-lg cursor-pointer"
      style={{
        perspective: "1000px",
        transition: "all cubic-bezier(0.4, 0, 0.2, 1) 400ms",
        transform: isDisappearing ? "scale(0)" : "scale(1)",
        bottom: isDisappearing ? "100%" : "0%",
        ...(isDisappearing
          ? { zIndex: 1000 }
          : isCurrent
          ? { zIndex: 900 }
          : {}),
      }}
      onTransitionEnd={(e) => {
        if (isDisappearing) {
          onDisappear?.();
        }
      }}
      onClick={() => {
        setFlipped(!flipped);
      }}
    >
      <div
        className="w-full h-full relative transition-transform"
        style={{
          transform: flipped ? "rotateX(180deg)" : "rotateX(0deg)",
          transformStyle: "preserve-3d",
        }}
      >
        {(isCurrent || isDisappearing) && (
          <>
            <div
              className="front w-full h-full overflow-hidden p-4 absolute top-0 left-0 z-10 bg-slate-100 shadow-lg dark:bg-dark-tremor-background rounded-lg flex flex-col justify-center"
              style={{
                backfaceVisibility: "hidden",
              }}
            >
              <span className="dark:text-white max-sm:text-2xl text-3xl overflow-auto">
                {question.question}
              </span>
            </div>
            <div
              className="back w-full h-full overflow-hidden p-4 absolute top-0 left-0 bg-slate-100 shadow-lg dark:bg-dark-tremor-background rounded-lg flex flex-col justify-center"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateX(180deg)",
              }}
            >
              <span className="dark:text-white max-sm:text-2xl text-3xl overflow-auto">
                {question.answer}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
