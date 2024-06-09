import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import TeamDisplay from "@/components/buzzer/box/TeamDisplay";
import AblyStatusSymbol from "@/components/utils/AblyStatusSymbol";
import { RealtimeClient } from "@/src/lib/buzzers/ably-realtime";
import { CompleteSet } from "@/src/utils/prisma-extensions";
import { Button, Flex, Metric, Title } from "@tremor/react";
import { useCallback, useContext } from "react";
import QRCode from "react-qr-code";

type TeamJoinProps = {
  onStartGame: () => void;
  questionSet?: CompleteSet;
};

export default function TeamJoin(props: TeamJoinProps) {
  const boxPresence = useContext(BoxPresenceContext);
  if (!boxPresence) {
    throw new Error("Team join was used outside of context!");
  }
  const movePlayer = useCallback((playerId: string, newTeam: string) => {
    RealtimeClient.box.publish({
      type: "change-team",
      clientId: playerId,
      newTeam: newTeam,
    });
  }, []);
  return (
    <>
      <div className="flex h-full w-full flex-col gap-2">
        <div className="flex items-center justify-between border-b-2 border-tremor-border bg-tremor-background-subtle p-4 dark:bg-dark-tremor-background-subtle">
          <div className="flex items-center gap-4">
            <QRCode
              size={150}
              level="M"
              className="shrink-0 rounded-md"
              value={`${location.origin}/buzzer?id=${boxPresence.gameId}`}
            />
            <Flex flexDirection="col" alignItems="start">
              <Title>Playing Set:</Title>
              <Metric>
                {props.questionSet
                  ? props.questionSet.name
                  : boxPresence.setType === "oac-paper"
                    ? "Paper OAC Set"
                    : "Other Set"}
              </Metric>
            </Flex>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="h-fit rounded-md bg-tremor-background-muted p-2 text-5xl text-tremor-content-emphasis dark:bg-dark-tremor-background-muted dark:text-dark-tremor-content-emphasis">
              Game ID:{" "}
              <b>
                {boxPresence.gameId
                  .toString()
                  .split("")
                  .toSpliced(3, 0, " ")
                  .join("")}
              </b>
            </span>
            <span className="text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
              Join at <b>{location.host}/buzzer</b>
            </span>
          </div>
        </div>
        <div className="mt-6 flex w-full justify-around overflow-hidden">
          <TeamDisplay
            team="a"
            canMovePlayers
            onMovePlayer={(playerId) => {
              movePlayer(playerId, "b");
            }}
          />
          <TeamDisplay
            team="b"
            canMovePlayers
            onMovePlayer={(playerId) => {
              movePlayer(playerId, "a");
            }}
          />
        </div>
        <div className="m-2 mt-auto flex justify-center">
          <Button
            className="w-1/2"
            size="xl"
            onClick={() => {
              props.onStartGame();
            }}
          >
            Start
          </Button>
        </div>
      </div>
      <AblyStatusSymbol buttonClass="absolute bottom-0 left-0 m-3 dark:text-white" />
    </>
  );
}
