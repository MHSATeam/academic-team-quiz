import { getTeamColors } from "@/src/lib/buzzers/get-team-colors";
import { usePlayerList } from "@/src/lib/buzzers/use-player-list";
import classNames from "classnames";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useMemo } from "react";

type TeamDisplayProps = {
  team: string;
  roundingCorner?: "left" | "right";
  score?: number;
  showScore?: boolean;
  canMovePlayers?: boolean;
  onMovePlayer?: (playerId: string) => void;
  onUpdateScore?: (changeInScore: number, team: string) => void;
};

export default function TeamDisplay(props: TeamDisplayProps) {
  const [players, clientIds] = usePlayerList();
  const {
    team,
    roundingCorner,
    score,
    showScore,
    canMovePlayers,
    onMovePlayer,
    onUpdateScore,
  } = Object.assign({ canMovePlayers: false, showScore: false }, props);
  const teamMembers = useMemo(
    () =>
      players
        .map((player, i) => ({ ...player, clientId: clientIds[i] }))
        .filter((user) => user.team === team),
    [team, players, clientIds],
  );

  return (
    <div
      className={classNames(
        "flex",
        "flex-col",
        "text-center",
        "w-fit",
        "overflow-hidden",
        getTeamColors(team, "bg-"),
        {
          "rounded-md": roundingCorner === undefined,
          "rounded-tr-md": roundingCorner === "left",
          "rounded-tl-md": roundingCorner === "right",
        },
      )}
    >
      <span className="m-4 mx-8 text-tremor-metric">
        Team {team.toUpperCase()}
      </span>
      <hr />
      <div className="min-h-8 overflow-auto p-4 text-lg">
        {teamMembers.length === 0 && (
          <div className="flex justify-between">
            <span className="grow p-2">Waiting for players</span>
          </div>
        )}
        {teamMembers.map((player) => {
          const Arrow = team === "a" ? ChevronRight : ChevronLeft;
          const moveButton = (
            <button onClick={() => onMovePlayer?.(player.clientId)}>
              <Arrow />
            </button>
          );
          return (
            <div
              className="flex max-w-56 justify-between"
              key={player.clientId}
            >
              {canMovePlayers && team === "b" && moveButton}
              <span className="grow overflow-auto whitespace-nowrap p-2">
                {player.name}
              </span>
              {canMovePlayers && team === "a" && moveButton}
            </div>
          );
        })}
      </div>
      {showScore && score !== undefined && (
        <>
          <hr />
          <span className="my-2 text-center text-5xl text-red-400">
            {score}
          </span>
          {onUpdateScore && (
            <div className="flex">
              <button
                disabled={score === 0}
                onClick={() => onUpdateScore(-1, team)}
                className="flex grow justify-center bg-red-400 p-2 disabled:opacity-50"
              >
                <Minus />
              </button>
              <button
                onClick={() => onUpdateScore(1, team)}
                className="flex grow justify-center bg-green-400 p-2"
              >
                <Plus />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
