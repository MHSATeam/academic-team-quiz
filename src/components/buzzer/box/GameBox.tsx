import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import TeamDisplay from "@/components/buzzer/box/TeamDisplay";
import Timer from "@/components/buzzer/Timer";
import AblyStatusSymbol from "@/components/utils/AblyStatusSymbol";
import { RealtimeClient } from "@/src/lib/buzzers/ably-realtime";
import { Button, Metric, Title } from "@tremor/react";
import React, { ReactNode, useCallback, useContext, useState } from "react";
import { CompleteSet } from "@/src/utils/prisma-extensions";
import GameIdDisplay from "@/components/buzzer/GameIdDisplay";
import GameIdDialog from "@/components/buzzer/GameIdDialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

type GameBoxProps = {
  children?: ReactNode;
  inDisplayMode: boolean;
  questionSet?: CompleteSet;
  onUpdateScore?: (changeInScore: number, team: string) => void;
  onSetTimerDuration?: (duration: number) => void;
  onStartTimer?: () => void;
  onResetTimer?: () => void;
  onTogglePauseTimer?: () => void;
  onUpdateQuestionIndex?: React.Dispatch<React.SetStateAction<number>>;
  onStartAlphabetRound?: () => void;
  onEndAlphabetRound?: (scores: { a: number; b: number }) => void;
};

export default function GameBox(props: GameBoxProps) {
  const boxPresence = useContext(BoxPresenceContext);

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
            {boxPresence.setType !== "unknown" && (
              <Button
                disabled={
                  boxPresence.gamePhase === "alphabet-round" &&
                  boxPresence.alphabetRound?.isOpen
                }
                title={
                  boxPresence.gamePhase === "alphabet-round" &&
                  boxPresence.alphabetRound?.isOpen
                    ? "Use add points button instead"
                    : ""
                }
                color={boxPresence.gamePhase === "buzzer" ? "gray" : "red"}
                size="lg"
                onClick={() => {
                  if (boxPresence.gamePhase === "buzzer") {
                    props.onStartAlphabetRound?.();
                  } else {
                    props.onEndAlphabetRound?.({ a: 0, b: 0 });
                  }
                }}
              >
                {boxPresence.gamePhase === "buzzer" ? "Go to" : "Exit"} Alphabet
                Round
              </Button>
            )}
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
          {props.children}
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
