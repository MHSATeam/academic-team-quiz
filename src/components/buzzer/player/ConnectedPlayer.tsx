import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import Timer from "@/components/buzzer/Timer";
import AlphabetPlayer from "@/components/buzzer/player/AlphabetPlayer";
import Buzzer from "@/components/buzzer/player/Buzzer";
import SettingsDialog from "@/components/buzzer/player/SettingsDialog";
import AblyStatusSymbol from "@/components/utils/AblyStatusSymbol";
import { RealtimeClient } from "@/src/lib/buzzers/ably-realtime";
import { getTeamColors } from "@/src/lib/buzzers/get-team-colors";
import useBuzz from "@/src/lib/buzzers/use-buzz";
import { usePlayerList } from "@/src/lib/buzzers/use-player-list";
import { Button, Title } from "@tremor/react";
import classNames from "classnames";
import { ArrowLeftRight, Settings } from "lucide-react";
import React, { useContext, useEffect, useState } from "react";

type ConnectedPlayerProps = {
  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;
};
export default function ConnectedPlayer({
  name,
  setName,
}: ConnectedPlayerProps) {
  const boxPresence = useContext(BoxPresenceContext);
  const [firstBuzz] = useBuzz();
  const [playerList, clientIdList] = usePlayerList();

  const [team, setTeam] = useState(() => {
    if (Math.random() > 0.5) {
      return "a";
    } else {
      return "b";
    }
  });
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    RealtimeClient.player.update({
      name: name,
      team: team,
    });
  }, [name, team]);

  useEffect(() => {
    const unsubscribe = RealtimeClient.box.subscribe((message) => {
      if (message.type === "change-team") {
        if (message.clientId === RealtimeClient.clientId) {
          setTeam(message.newTeam);
        }
      }
    });
    return () => unsubscribe();
  });

  if (!boxPresence) {
    return <Title>Host has disconnected!</Title>;
  }
  return (
    <div
      className="flex h-full flex-col items-center"
      style={{
        backgroundColor: !firstBuzz
          ? "unset"
          : firstBuzz.team === team
            ? "#0cc23c"
            : "red",
      }}
    >
      <div className="flex w-full items-center gap-4 border-b-2 border-tremor-border p-4 dark:text-white">
        <Title className="h-fit grow">Good luck {name}!</Title>
        <button onClick={() => setSettingsOpen(true)}>
          <Settings size={36} />
        </button>
        <AblyStatusSymbol />
      </div>
      <div className="w-full grow overflow-hidden">
        {boxPresence.gamePhase === "team-picker" && (
          <div className="flex h-full w-full flex-col items-center justify-center">
            <div
              className={classNames(
                "p-10",
                "rounded-full",
                "flex",
                "flex-col",
                "gap-1",
                "text-center",
                "w-fit",
                getTeamColors(team, "bg-"),
              )}
            >
              <span>Waiting for host...</span>
              <span className="text-2xl">Team {team.toUpperCase()}:</span>
              <span>{name}</span>
              {playerList.map((player, i) => {
                if (
                  RealtimeClient.clientId === clientIdList[i] ||
                  player.team !== team
                ) {
                  return null;
                }
                return <span key={i}>{player.name}</span>;
              })}
              <Button
                onClick={() => {
                  setTeam((prev) => (prev === "a" ? "b" : "a"));
                }}
                size="xs"
                color="gray"
                className="mt-2"
              >
                <div className="flex gap-1">
                  <ArrowLeftRight />
                </div>
              </Button>
            </div>
          </div>
        )}
        {boxPresence.gamePhase === "buzzer" && (
          <Buzzer name={name} team={team} />
        )}
        {boxPresence.gamePhase === "alphabet-round" && <AlphabetPlayer />}
      </div>
      <div className="relative flex w-full items-end justify-between">
        <div
          className={classNames(
            "text-center",
            "overflow-hidden",
            "rounded-tr-md",
            "p-2",
            getTeamColors("a", "bg-"),
          )}
        >
          <span className="my-2 text-center text-5xl text-red-400">
            {boxPresence.teamScores.a}
          </span>
        </div>
        <Timer
          size="sm"
          className="absolute bottom-0 left-1/2 -translate-x-1/2"
        />
        <div
          className={classNames(
            "text-center",
            "overflow-hidden",
            "rounded-tl-md",
            "p-2",
            getTeamColors("b", "bg-"),
          )}
        >
          <span className="my-2 text-center text-5xl text-red-400">
            {boxPresence.teamScores.b}
          </span>
        </div>
      </div>
      <SettingsDialog
        isOpen={isSettingsOpen}
        name={name}
        setName={setName}
        setOpen={setSettingsOpen}
        team={team}
        setTeam={() => setTeam(team === "a" ? "b" : "a")}
      />
    </div>
  );
}
