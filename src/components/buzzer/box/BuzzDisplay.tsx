import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import useBuzz from "@/src/lib/buzzers/use-buzz";
import { Button, Title } from "@tremor/react";
import React, { useCallback, useContext, useMemo, useRef } from "react";
import { CompleteSet } from "@/src/utils/prisma-extensions";
import CurrentBuzz from "@/components/buzzer/box/CurrentBuzz";
import DisplayFormattedText from "@/components/utils/DisplayFormattedText";
import classNames from "classnames";
import { BuzzMessage } from "@/src/lib/buzzers/message-types";

const beepSound =
  typeof window === "undefined" ? { play: () => {} } : new Audio("/beep.mp3");

type BuzzDisplayProps = {
  inDisplayMode: boolean;
  questionSet?: CompleteSet;
  onUpdateScore?: (changeInScore: number, team: string) => void;
  onSetLocked?: (locked: boolean) => void;
  onResetTimer?: () => void;
  onPauseTimerAtTime?: (timestamp: number) => void;
  onClearBuzzer?: () => void;
  onUpdateQuestionIndex?: React.Dispatch<React.SetStateAction<number>>;
  onStartAlphabetRound?: () => void;
};

export default function BuzzDisplay(props: BuzzDisplayProps) {
  const boxPresence = useContext(BoxPresenceContext);
  const { onPauseTimerAtTime } = props;
  const lastBuzzSound = useRef(-1);

  const onBuzz = useCallback(
    (message: BuzzMessage) => {
      if (
        boxPresence?.timer.startTime !== -1 &&
        (boxPresence?.timer.unpauseTime !== -1 ||
          boxPresence.timer.pauseLeft === -1)
      ) {
        onPauseTimerAtTime?.(message.timestamp);
      }
      if ((boxPresence?.lastBuzzerClear ?? 0) >= lastBuzzSound.current) {
        beepSound.play();
        lastBuzzSound.current = Date.now();
      }
    },
    [onPauseTimerAtTime, boxPresence?.timer, boxPresence?.lastBuzzerClear],
  );
  const [firstBuzz] = useBuzz(onBuzz);

  const question = useMemo(
    () =>
      props.inDisplayMode || boxPresence?.questionIndex === undefined
        ? undefined
        : props.questionSet?.questionList[boxPresence.questionIndex],
    [props.inDisplayMode, props.questionSet, boxPresence?.questionIndex],
  );

  const isAlphabetRoundQuestion = useMemo(() => {
    return (
      props.questionSet?.alphabetRound?.round.questions.findIndex(
        (q) => q.id === question?.id,
      ) !== -1
    );
  }, [question, props.questionSet]);

  if (!boxPresence) {
    if (props.inDisplayMode) {
      return <Title>Host has disconnected!</Title>;
    } else {
      throw new Error("Buzzer box was used outside of context!");
    }
  }

  return (
    <>
      <CurrentBuzz
        inDisplayMode={props.inDisplayMode}
        onClearBuzzer={props.onClearBuzzer}
        isShowingQuestions={question !== undefined}
        onToggleBuzzerLock={() => props.onSetLocked?.(!boxPresence.locked)}
        onMarkQuestion={(result) => {
          if (!firstBuzz) {
            return;
          }
          let scoreChange = 0;
          if (result === "correct") {
            scoreChange = 2;
          } else if (result === "correct-2-attempt") {
            scoreChange = 1;
          }
          props.onUpdateScore?.(scoreChange, firstBuzz.team);
          props.onClearBuzzer?.();
          if (result !== "incorrect") {
            props.onUpdateQuestionIndex?.((prev) => prev + 1);
            props.onResetTimer?.();
          }
        }}
      />
      {question && (
        <div
          className={classNames(
            "flex",
            "flex-col",
            "justify-center",
            "gap-2",
            "transition-[flex-grow]",
            {
              grow: firstBuzz === null,
              "grow-0": firstBuzz !== null,
            },
          )}
        >
          {isAlphabetRoundQuestion && (
            <div className="flex flex-col items-center gap-2">
              <Title>This question is part of the alphabet round</Title>
              <Button
                onClick={() => {
                  props.onStartAlphabetRound?.();
                }}
              >
                Start Alphabet Round
              </Button>
            </div>
          )}
          <div className="rounded-md bg-white p-2">
            <span
              className={classNames(
                "text-tremor-content-strong",
                "transition-[font-size,_line-height]",
                {
                  "text-xl": firstBuzz === null,
                  "text-sm": firstBuzz !== null,
                },
              )}
            >
              Question #{boxPresence.questionIndex + 1}:
            </span>

            <DisplayFormattedText
              text={question.question}
              className={classNames(
                "font-serif",
                "text-tremor-content-strong",
                "transition-[font-size,_line-height]",
                {
                  "text-2xl": firstBuzz === null,
                  "text-md": firstBuzz !== null,
                },
              )}
            />
          </div>
          <div className="rounded-md bg-white p-2">
            <span
              className={classNames(
                "text-tremor-content-strong",
                "transition-[font-size,_line-height]",
                {
                  "text-xl": firstBuzz === null,
                  "text-sm": firstBuzz !== null,
                },
              )}
            >
              Answer:
            </span>
            <DisplayFormattedText
              text={question.answer}
              className={classNames(
                "font-serif",
                "text-tremor-content-strong",
                "transition-[font-size,_line-height]",
                {
                  "text-2xl": firstBuzz === null,
                  "text-md": firstBuzz !== null,
                },
              )}
            />
          </div>
        </div>
      )}
    </>
  );
}
