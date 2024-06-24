"use client";

import { Flashcard } from "@/components/display/Flashcard";
import useKeyboardEvent from "@/src/hooks/use-keyboard-event";
import { QuestionWithRoundData } from "@/src/utils/prisma-extensions";
import { animated, useSprings } from "@react-spring/web";
import { Title } from "@tremor/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type FlashcardListProps = {
  questions: QuestionWithRoundData[];
};

const to = () => ({
  x: 0,
  y: 0,
  scale: 1,
  // delay: 100,
});

const from = () => ({ x: 0, y: -1000, scale: 0.5, delay: 0 });

export default function FlashcardList(props: FlashcardListProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [springs, api] = useSprings(props.questions.length, (i) => ({
    ...(i === 0 ? { ...to(), immediate: true } : {}),
    from: from(),
  }));

  const left = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    if (currentIndex !== 0) {
      api.start((i) => {
        if (i === currentIndex) {
          return from();
        }
        if (i === currentIndex - 1) {
          return to();
        }
      });
    }
  };

  const right = () => {
    setCurrentIndex((prev) => Math.min(props.questions.length - 1, prev + 1));
    if (currentIndex !== props.questions.length - 1) {
      api.start((i) => {
        if (i === currentIndex)
          return {
            scale: 0,
            from: to(),
            immediate: false,
          };
        if (i === currentIndex + 1) {
          return to();
        }
      });
    }
  };

  useKeyboardEvent((event) => {
    if (event.key === "ArrowLeft") {
      left();
    }
    if (event.key === "ArrowRight") {
      right();
    }
  }, "keydown");

  return (
    <div className="mx-auto flex min-h-96 flex-col gap-2 md:aspect-video md:w-2/3">
      <div className="relative grow">
        {springs.map(({ x, y, scale }, item) => {
          const question = props.questions[item];
          return (
            <animated.div
              key={item}
              className="absolute h-full w-full overflow-hidden"
              style={{ x, y, scale }}
            >
              <Flashcard
                question={question}
                isCurrent={item === currentIndex}
              />
            </animated.div>
          );
        })}
      </div>
      <div className="flex items-center justify-center gap-16 dark:text-white">
        <button
          onClick={() => {
            left();
          }}
          className="aspect-square rounded-full border-2 border-tremor-border p-2 text-tremor-content active:bg-tremor-content-subtle disabled:bg-tremor-content-subtle dark:border-dark-tremor-border dark:text-dark-tremor-content dark:active:bg-dark-tremor-content-subtle disabled:dark:bg-dark-tremor-content-subtle"
          disabled={currentIndex === 0}
        >
          <ChevronLeft />
        </button>
        <Title>
          {currentIndex + 1} / {props.questions.length}
        </Title>
        <button
          onClick={() => {
            right();
          }}
          disabled={currentIndex === props.questions.length - 1}
          className="aspect-square rounded-full border-2 border-tremor-border p-2 text-tremor-content active:bg-tremor-content-subtle disabled:bg-tremor-content-subtle dark:border-dark-tremor-border dark:text-dark-tremor-content dark:active:bg-dark-tremor-content-subtle disabled:dark:bg-dark-tremor-content-subtle"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
