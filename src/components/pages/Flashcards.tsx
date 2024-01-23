"use client";

import { Question } from "@prisma/client";
import { Check, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

type FlashcardsProps = {
  categories?: number[];
  rounds?: number[];
};

export default function Flashcards(props: FlashcardsProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [disappearing, setDisappearing] = useState(false);
  const [loadingNewQuestion, setLoadingNewQuestion] = useState(false);
  const [numIncorrect, setNumIncorrect] = useState(0);
  const [numCorrect, setNumCorrect] = useState(0);

  async function loadNextQuestion() {
    setLoadingNewQuestion(true);
    try {
      const res = await fetch("/api/question", {
        method: "POST",
      });
      if (!res.ok) {
        throw new Error("Failed to load question!");
      }
      const newQuestion = await res.json();
      setQuestions((prev) => [newQuestion, ...prev]);
      if (questions.length > 0) {
        setDisappearing(true);
      }
    } finally {
      setLoadingNewQuestion(false);
    }
  }

  async function markQuestion(correct: boolean) {
    const currentQuestion = questions[0];
    if (correct) {
      setNumCorrect((prev) => prev + 1);
    } else {
      setNumIncorrect((prev) => prev + 1);
    }
    loadNextQuestion();
    const res = await fetch("/api/log-question", {
      method: "POST",
      body: JSON.stringify({
        result: correct ? "Correct" : "Incorrect",
        questionId: currentQuestion.id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      alert("There was an error while saving your question");
      return;
    }
  }

  useEffect(() => {
    loadNextQuestion();
  }, []);

  if (questions.length === 0) {
    return (
      <span className="dark:text-white text-3xl absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-2 items-center">
        Loading <Loader2 className="animate-spin" />
      </span>
    );
  }

  return (
    <main className="h-full w-full flex flex-col p-8 gap-4">
      <div className="flex justify-between p-2">
        <span className="flex gap-2 items-center text-red-500 font-bold text-lg">
          <span className="text-red-200 bg-red-500 rounded-md px-2 py-1 ">
            {numIncorrect}
          </span>
          Still Learning
        </span>
        <span className="flex gap-2 items-center text-green-500 font-bold text-lg">
          Know
          <span className="text-green-200 bg-green-500 rounded-md px-2 py-1">
            {numCorrect}
          </span>
        </span>
      </div>
      <div className="grow relative">
        {(loadingNewQuestion || disappearing) && (
          <Flashcard
            question={questions[disappearing ? 1 : 0]}
            isDisappearing={disappearing}
            onDisappear={() => {
              setDisappearing(false);
            }}
          />
        )}
        <Flashcard
          key={questions[0].id}
          question={questions[0]}
          isDisappearing={false}
        />
      </div>
      <div className="flex justify-center gap-16">
        <button
          onClick={() => markQuestion(false)}
          className="rounded-full aspect-square text-red-500 border-2 p-2 border-red-500 hover:bg-red-900"
        >
          <X />
        </button>
        <button
          onClick={() => markQuestion(true)}
          className="rounded-full aspect-square text-green-500 border-2 p-2 border-green-500 hover:bg-green-800"
        >
          <Check />
        </button>
      </div>
    </main>
  );
}

type FlashcardProps = {
  question: Question;
  isDisappearing: boolean;
  onDisappear?: () => void;
};
function Flashcard({ question, isDisappearing, onDisappear }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const [actuallyDisappearing, setActuallyDisappearing] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setActuallyDisappearing(isDisappearing);
    }, 0);
  }, [isDisappearing]);

  return (
    <div
      className="w-full h-full absolute left-0 text-center rounded-lg cursor-pointer"
      style={{
        perspective: "1000px",
        transition: "all cubic-bezier(0.4, 0, 0.2, 1) 400ms",
        transform: actuallyDisappearing ? "scale(0)" : "scale(1)",
        bottom: actuallyDisappearing ? "100%" : "0%",
        ...(actuallyDisappearing ? { zIndex: 1000 } : {}),
      }}
      onTransitionEnd={(e) => {
        onDisappear?.();
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
        <div
          className="front w-full h-full overflow-hidden p-4 absolute top-0 left-0 z-10 bg-slate-100 shadow-lg dark:bg-dark-tremor-background rounded-lg flex flex-col justify-center"
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          <span className="dark:text-white text-3xl overflow-auto">
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
          <span className="dark:text-white text-3xl overflow-auto">
            {question.answer}
          </span>
        </div>
      </div>
    </div>
  );
}
