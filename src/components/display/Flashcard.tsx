"use client";
import { QuestionWithRoundData } from "@/src/utils/quiz-session-type-extension";
import { useCallback, useEffect, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import useKeyboardEvent from "@/src/hooks/use-keyboard-event";
import QuestionText from "@/components/display/QuestionText";

type FlashcardProps = {
  question: QuestionWithRoundData;
  isCurrent: boolean;
};
export function Flashcard({ question, isCurrent }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const { transform, opacity } = useSpring({
    opacity: flipped ? 1 : 0,
    transform: `perspective(600px) rotateX(${flipped ? 180 : 0}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  });

  useEffect(() => {
    if (!isCurrent) {
      setFlipped(false);
    }
  }, [isCurrent]);

  useKeyboardEvent(
    useCallback(
      (e) => {
        if (isCurrent) {
          e.preventDefault();
          setFlipped((prev) => !prev);
        }
      },
      [isCurrent],
    ),
    "keydown",
    " ",
  );

  return (
    <div
      data-question-id={question.id}
      className="absolute left-0 h-full w-full cursor-pointer rounded-lg text-center"
      onClick={() => {
        setFlipped(!flipped);
      }}
    >
      <animated.div
        className="front absolute left-0 top-0 flex h-full w-full flex-col justify-center overflow-hidden rounded-lg bg-slate-100 p-4 shadow-lg dark:bg-dark-tremor-background"
        style={{ opacity: opacity.to((o) => 1 - o), transform }}
      >
        <QuestionText
          question={question}
          subtitleClass="text-xl text-slate-600 max-sm:text-lg dark:text-slate-400"
          className="text-3xl max-sm:text-2xl dark:text-white"
        />
      </animated.div>
      <animated.div
        className="back absolute left-0 top-0 flex h-full w-full flex-col justify-center overflow-hidden rounded-lg bg-slate-100 p-4 shadow-lg dark:bg-dark-tremor-background"
        style={{
          opacity,
          transform,
          rotateX: "180deg",
        }}
      >
        <QuestionText
          question={question}
          showQuestion={false}
          subtitleClass="text-xl text-slate-600 max-sm:text-lg dark:text-slate-400"
          className="text-3xl max-sm:text-2xl dark:text-white"
        />
      </animated.div>
    </div>
  );
}
