import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import useBuzz from "@/src/lib/buzzers/use-buzz";
import { Title } from "@tremor/react";
import React, { useCallback, useContext, useRef } from "react";
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

  if (!boxPresence) {
    if (props.inDisplayMode) {
      return <Title>Host has disconnected!</Title>;
    } else {
      throw new Error("Buzzer box was used outside of context!");
    }
  }

  const question = props.inDisplayMode
    ? undefined
    : props.questionSet?.questionList[boxPresence.questionIndex];
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
