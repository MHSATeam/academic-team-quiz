import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import { useDebounce } from "@/src/hooks/use-debounce";
import { RealtimeClient } from "@/src/lib/buzzers/ably-realtime";
import { getTeamColors } from "@/src/lib/buzzers/get-team-colors";
import { usePlayerList } from "@/src/lib/buzzers/use-player-list";
import classNames from "classnames";
import { useCallback, useContext, useMemo } from "react";

type BuzzerProps = {
  name: string;
  team: string;
};

export default function Buzzer(props: BuzzerProps) {
  const boxPresence = useContext(BoxPresenceContext);
  const [playerList, clientIdList] = usePlayerList();
  const onBuzz = useDebounce(
    useCallback(() => {
      if (!boxPresence) {
        return;
      }
      if (!boxPresence.locked) {
        RealtimeClient.player.publish({
          type: "buzz",
          name: props.name,
          team: props.team,
          clientId: RealtimeClient.clientId,
          questionIndex: boxPresence.questionIndex,
          timestamp: Date.now(),
        });
      }
    }, [boxPresence, props.name, props.team]),
    500,
  );

  const teammates = useMemo(
    () =>
      playerList.filter(
        (player, i) =>
          RealtimeClient.clientId !== clientIdList[i] &&
          player.team === props.team,
      ),
    [playerList, clientIdList, props.team],
  );
  if (!boxPresence) {
    return null;
  }

  return (
    <div className="flex h-full flex-col justify-center">
      <div
        onClick={onBuzz}
        className={classNames(
          "p-10",
          "rounded-full",
          "flex",
          "flex-col",
          "gap-1",
          "text-center",
          getTeamColors(props.team, "bg-"),
        )}
      >
        <span className="text-3xl font-semibold">
          {boxPresence.locked ? "Locked" : "Buzz"}
        </span>
        <span>Question #{boxPresence.questionIndex + 1}</span>
        {teammates.length > 0 && (
          <span className="font-semibold">Teammates:</span>
        )}
        {teammates.map((player, i) => {
          return <span key={i}>{player.name}</span>;
        })}
      </div>
    </div>
  );
}
