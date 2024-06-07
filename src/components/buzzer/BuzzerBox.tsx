import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import TeamDisplay from "@/components/buzzer/TeamDisplay";
import Timer from "@/components/buzzer/Timer";
import AblyStatusSymbol from "@/components/utils/AblyStatusSymbol";
import { RealtimeClient } from "@/src/lib/buzzers/ably-realtime";
import { getTeamColors } from "@/src/lib/buzzers/get-team-colors";
import useBuzz from "@/src/lib/buzzers/use-buzz";
import { Button, Metric, Title } from "@tremor/react";
import classNames from "classnames";
import { useCallback, useContext } from "react";

type BuzzerBoxProps = {
  inDisplayMode: boolean;
  onUpdateScore?: (changeInScore: number, team: string) => void;
  onSetLocked?: (locked: boolean) => void;
  onSetTimerDuration?: (duration: number) => void;
  onStartTimer?: () => void;
  onStopTimer?: () => void;
  onClearBuzzer?: () => void;
};

export default function BuzzerBox(props: BuzzerBoxProps) {
  const boxPresence = useContext(BoxPresenceContext);
  const [firstBuzz, buzzList] = useBuzz();

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
        <div className="flex shrink-0 grow-[3] basis-0 flex-col items-center">
          <div className="flex grow flex-col items-center justify-center gap-4">
            <span className="text-6xl text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
              {firstBuzz === null ? (
                "Waiting for buzz..."
              ) : (
                <>
                  <span
                    className={classNames(
                      "font-bold",
                      getTeamColors(firstBuzz.team, "text-"),
                    )}
                  >
                    {firstBuzz.name}
                  </span>{" "}
                  buzzed in!
                </>
              )}
            </span>
            {firstBuzz !== null &&
              buzzList
                .filter((buzz) => buzz.clientId !== firstBuzz.clientId)
                .sort((a, b) => a.timestamp - b.timestamp)
                .map((buzz) => (
                  <span
                    key={buzz.clientId}
                    className="text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis"
                  >
                    {buzz.name}: {(buzz.timestamp - firstBuzz.timestamp) / 1000}{" "}
                    seconds later
                  </span>
                ))}
            {buzzList.length > 0 && (
              <Button
                color="red"
                onClick={() => {
                  props.onClearBuzzer?.();
                }}
              >
                Clear Buzzer
              </Button>
            )}
          </div>
          <Timer
            showControls={!props.inDisplayMode}
            onStartTimer={props.onStartTimer}
            onStopTimer={props.onStopTimer}
            onSetTimerDuration={props.onSetTimerDuration}
          />
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
