import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import TeamDisplay from "@/components/buzzer/box/TeamDisplay";
import Timer from "@/components/buzzer/Timer";
import AblyStatusSymbol from "@/components/utils/AblyStatusSymbol";
import { RealtimeClient } from "@/src/lib/buzzers/ably-realtime";
import useBuzz from "@/src/lib/buzzers/use-buzz";
import { Button, Metric, Title } from "@tremor/react";
import React, { useCallback, useContext, useRef, useState } from "react";
import { CompleteSet } from "@/src/utils/prisma-extensions";
import CurrentBuzz from "@/components/buzzer/box/CurrentBuzz";
import DisplayFormattedText from "@/components/utils/DisplayFormattedText";
import classNames from "classnames";
import { BuzzMessage } from "@/src/lib/buzzers/message-types";
import GameIdDisplay from "@/components/buzzer/GameIdDisplay";
import GameIdDialog from "@/components/buzzer/GameIdDialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

const beepSound =
  typeof window === "undefined" ? { play: () => {} } : new Audio("/beep.mp3");

type BuzzerBoxProps = {
  inDisplayMode: boolean;
  questionSet?: CompleteSet;
  onUpdateScore?: (changeInScore: number, team: string) => void;
  onSetLocked?: (locked: boolean) => void;
  onSetTimerDuration?: (duration: number) => void;
  onStartTimer?: () => void;
  onResetTimer?: () => void;
  onTogglePauseTimer?: () => void;
  onPauseTimerAtTime?: (timestamp: number) => void;
  onClearBuzzer?: () => void;
  onUpdateQuestionIndex?: React.Dispatch<React.SetStateAction<number>>;
};

export default function BuzzerBox(props: BuzzerBoxProps) {
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

  const [idDialogOpen, setIdDialogOpen] = useState(false);

  const movePlayer = useCallback((playerId: string, newTeam: string) => {
    RealtimeClient.box.publish({
      type: "change-team",
      clientId: playerId,
      newTeam: newTeam,
    });
  }, []);

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
    <div className="flex h-full w-full flex-col gap-2">
      <div className="flex items-center justify-center gap-4 border-b-2 border-tremor-border bg-tremor-background-subtle p-4 dark:bg-dark-tremor-background-subtle">
        <AblyStatusSymbol buttonClass="m-3 dark:text-white" />
        <Metric>Question #{boxPresence.questionIndex + 1}</Metric>
        {!props.inDisplayMode && (
          <>
            <Button
              onClick={() => {
                props.onUpdateQuestionIndex?.((prev) => {
                  return Math.max(0, prev - 1);
                });
              }}
              color="gray"
              size="lg"
            >
              <ChevronLeft />
            </Button>
            <Button
              onClick={() => {
                props.onUpdateQuestionIndex?.((prev) => {
                  return prev + 1;
                });
              }}
              color="gray"
              size="lg"
            >
              <ChevronRight />
            </Button>
          </>
        )}
        <GameIdDisplay
          onClick={() => setIdDialogOpen(true)}
          gameId={boxPresence.gameId}
          className="ml-auto cursor-pointer"
        />
      </div>
      <div className="flex grow grid-cols-3 justify-between">
        <div className="flex shrink-0 grow basis-0 flex-col justify-end">
          <TeamDisplay
            team="a"
            roundingCorner="left"
            score={boxPresence.teamScores.a}
            showScore
            onUpdateScore={props.onUpdateScore}
            canMovePlayers
            onMovePlayer={(playerId) => movePlayer(playerId, "b")}
          />
        </div>
        <div className="flex shrink-0 grow-[3] basis-0 flex-col items-center gap-2">
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
          <div className="flex items-end">
            <Timer
              showControls={!props.inDisplayMode}
              onStartTimer={props.onStartTimer}
              onResetTimer={props.onResetTimer}
              onTogglePause={props.onTogglePauseTimer}
              onSetTimerDuration={props.onSetTimerDuration}
            />
          </div>
        </div>
        <div className="flex shrink-0 grow basis-0 flex-col items-end justify-end">
          <TeamDisplay
            team="b"
            roundingCorner="right"
            score={boxPresence.teamScores.b}
            showScore
            onUpdateScore={props.onUpdateScore}
            canMovePlayers
            onMovePlayer={(playerId) => movePlayer(playerId, "a")}
          />
        </div>
      </div>
      <GameIdDialog isOpen={idDialogOpen} setOpen={setIdDialogOpen} />
    </div>
  );
}
