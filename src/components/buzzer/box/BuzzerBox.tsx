import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import TeamDisplay from "@/components/buzzer/box/TeamDisplay";
import Timer from "@/components/buzzer/Timer";
import AblyStatusSymbol from "@/components/utils/AblyStatusSymbol";
import { RealtimeClient } from "@/src/lib/buzzers/ably-realtime";
import useBuzz from "@/src/lib/buzzers/use-buzz";
import { Metric, Title } from "@tremor/react";
import React, { useCallback, useContext } from "react";
import { CompleteSet } from "@/src/utils/prisma-extensions";
import CurrentBuzz from "@/components/buzzer/box/CurrentBuzz";
import DisplayFormattedText from "@/components/utils/DisplayFormattedText";
import classNames from "classnames";

type BuzzerBoxProps = {
  inDisplayMode: boolean;
  questionSet?: CompleteSet;
  onUpdateScore?: (changeInScore: number, team: string) => void;
  onSetLocked?: (locked: boolean) => void;
  onSetTimerDuration?: (duration: number) => void;
  onStartTimer?: () => void;
  onStopTimer?: () => void;
  onClearBuzzer?: () => void;
  onUpdateQuestionIndex?: React.Dispatch<React.SetStateAction<number>>;
};

export default function BuzzerBox(props: BuzzerBoxProps) {
  const boxPresence = useContext(BoxPresenceContext);
  const [firstBuzz] = useBuzz();

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

  const question = props.questionSet?.questionList[boxPresence.questionIndex];
  return (
    <div className="flex h-full w-full flex-col gap-2">
      <div className="flex items-center justify-center gap-4 border-b-2 border-tremor-border bg-tremor-background-subtle p-4 dark:bg-dark-tremor-background-subtle">
        <AblyStatusSymbol buttonClass="m-3 dark:text-white" />
        <Metric>Question #{boxPresence.questionIndex + 1}</Metric>
        <span className="ml-auto h-fit rounded-md bg-tremor-background-muted p-2 text-xl text-tremor-content-emphasis dark:bg-dark-tremor-background-muted dark:text-dark-tremor-content-emphasis">
          Game ID:{" "}
          <b>
            {boxPresence.gameId
              .toString()
              .split("")
              .toSpliced(3, 0, " ")
              .join("")}
          </b>
        </span>
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
            onClearBuzzer={props.onClearBuzzer}
            isShowingQuestions={question !== undefined}
            onToggleBuzzerLock={() => props.onSetLocked?.(!boxPresence.locked)}
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
            <button
              onClick={() => {
                props.onUpdateQuestionIndex?.((prev) => {
                  return Math.max(prev - 1, 0);
                });
              }}
              className="rounded-tl-md bg-dark-tremor-background-emphasis p-2 text-lg text-tremor-content-emphasis dark:bg-tremor-background-emphasis dark:text-dark-tremor-content-emphasis"
            >
              Previous Question
            </button>
            <Timer
              showControls={!props.inDisplayMode}
              onStartTimer={props.onStartTimer}
              onStopTimer={props.onStopTimer}
              onSetTimerDuration={props.onSetTimerDuration}
            />
            <button
              onClick={() => {
                props.onUpdateQuestionIndex?.((prev) => {
                  return prev + 1;
                });
              }}
              className="rounded-tr-md bg-dark-tremor-background-emphasis p-2 text-lg text-tremor-content-emphasis dark:bg-tremor-background-emphasis dark:text-dark-tremor-content-emphasis"
            >
              Next Question
            </button>
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
    </div>
  );
}
