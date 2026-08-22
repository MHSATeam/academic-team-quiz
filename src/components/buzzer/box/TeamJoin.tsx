import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import GameIdDisplay from "@/components/buzzer/GameIdDisplay";
import TeamDisplay from "@/components/buzzer/box/TeamDisplay";
import AblyStatusSymbol from "@/components/utils/AblyStatusSymbol";
import { RealtimeClient } from "@/src/lib/buzzers/ably-realtime";
import { TeamColors } from "@/src/lib/buzzers/message-types";
import { CompleteSet } from "@/src/utils/prisma-extensions";
import { Button, Flex, Metric, Title } from "@tremor/react";
import { Dispatch, SetStateAction, useCallback, useContext } from "react";
import QRCode from "react-qr-code";

type TeamJoinProps = {
  onStartGame: () => void;
  questionSet?: CompleteSet;
  setTeamColors: Dispatch<SetStateAction<TeamColors>>;
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
  const setTeamColor = (newColor: string, team: string) => {
    props.setTeamColors((prev) => {
      return {
        ...prev,
        [team]: newColor,
      };
    });
  };
  return (
    <>
      <div className="flex h-full w-full flex-col gap-2">
        <div className="flex items-center justify-between border-b-2 border-tremor-border bg-tremor-background-subtle p-4 dark:bg-dark-tremor-background-subtle">
          <div className="flex items-center gap-4">
            <QRCode
              size={150}
              level="M"
              className="shrink-0 rounded-md"
              value={`${location.origin === "http://localhost:3000" ? "http://mm.local:3000" : location.origin}/buzzer?id=${boxPresence.gameId}`}
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
          <GameIdDisplay showLink size="lg" gameId={boxPresence.gameId} />
        </div>
        <div className="mt-6 flex w-full justify-around overflow-hidden">
          <TeamDisplay
            team="a"
            canMovePlayers
            teamColors={boxPresence.teamColors}
            onMovePlayer={(playerId) => {
              movePlayer(playerId, "b");
            }}
            onSetColor={(newColor) => {
              setTeamColor(newColor, "a");
            }}
          />
          <TeamDisplay
            team="b"
            canMovePlayers
            teamColors={boxPresence.teamColors}
            onMovePlayer={(playerId) => {
              movePlayer(playerId, "a");
            }}
            onSetColor={(newColor) => {
              setTeamColor(newColor, "b");
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
