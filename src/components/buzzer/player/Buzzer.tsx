import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import { useDebounce } from "@/src/hooks/use-debounce";
import { RealtimeClient } from "@/src/lib/buzzers/ably-realtime";
import { getTeamColors } from "@/src/lib/buzzers/get-team-colors";
import useBuzz from "@/src/lib/buzzers/use-buzz";
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
  const [firstBuzz, buzzList] = useBuzz();
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

  const myBuzz = buzzList.find(
    (buzz) => buzz.clientId === RealtimeClient.clientId,
  );

  if (!boxPresence) {
    return null;
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center">
      <div
        onClick={onBuzz}
        className={classNames(
          "p-10",
          "rounded-full",
          "flex",
          "flex-col",
          "gap-1",
          "w-fit",
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
      {firstBuzz && (
        <div className="absolute bottom-0 right-1/2 flex w-full translate-x-1/2 flex-col gap-2 py-2 text-center">
          <span>
            {firstBuzz.clientId === RealtimeClient.clientId
              ? "You buzzed in!"
              : `${firstBuzz.name} buzzed in!`}
          </span>
          {firstBuzz.clientId !== RealtimeClient.clientId && myBuzz && (
            <span>
              {((myBuzz.timestamp - firstBuzz.timestamp) / 1000).toFixed(3)}{" "}
              seconds behind
            </span>
          )}
        </div>
      )}
    </div>
  );
}
