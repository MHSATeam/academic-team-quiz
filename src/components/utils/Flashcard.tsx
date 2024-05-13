"use client";
import DisplayFormattedText from "@/components/utils/DisplayFormattedText";
import { QuestionWithRoundData } from "@/src/utils/quiz-session-type-extension";
import { useState } from "react";
import { animated, useSpring } from "@react-spring/web";

type FlashcardProps = {
  question: QuestionWithRoundData;
};
export function Flashcard({ question }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);
  const { transform, opacity } = useSpring({
    opacity: flipped ? 1 : 0,
    transform: `perspective(600px) rotateX(${flipped ? 180 : 0}deg)`,
    config: { mass: 5, tension: 500, friction: 80 },
  });
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
      </animated.div>
      <animated.div
        className="back absolute left-0 top-0 flex h-full w-full flex-col justify-center overflow-hidden rounded-lg bg-slate-100 p-4 shadow-lg dark:bg-dark-tremor-background"
        style={{
          opacity,
          transform,
          rotateX: "180deg",
        }}
      >
        <DisplayFormattedText
          className="overflow-auto text-3xl max-sm:text-2xl dark:text-white"
          text={question.answer}
        />
      </animated.div>
    </div>
  );
}
