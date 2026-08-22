import { getTeamColors } from "@/src/lib/buzzers/get-team-colors";
import { TeamColors } from "@/src/lib/buzzers/message-types";
import { usePlayerList } from "@/src/lib/buzzers/use-player-list";
import { Button } from "@tremor/react";
import classNames from "classnames";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import ColorPickerDialog from "./ColorPickerDialog";

type TeamDisplayProps = {
  team: string;
  roundingCorner?: "left" | "right";
  score?: number;
  showScore?: boolean;
  canMovePlayers?: boolean;
  teamColors: TeamColors;
  onMovePlayer?: (playerId: string) => void;
  onUpdateScore?: (changeInScore: number, team: string) => void;
  onSetColor?: (newColor: string) => void;
};

export default function TeamDisplay(props: TeamDisplayProps) {
  const [players, clientIds] = usePlayerList();
  const {
    team,
    roundingCorner,
    score,
    showScore,
    canMovePlayers,
    teamColors,
    onMovePlayer,
    onUpdateScore,
    onSetColor,
  } = Object.assign({ canMovePlayers: false, showScore: false }, props);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const teamMembers = useMemo(
    () =>
      players
        .map((player, i) => ({ ...player, clientId: clientIds[i] }))
        .filter((user) => user.team === team),
    [team, players, clientIds],
  );

  return (
    <div className="flex flex-col justify-center gap-2">
      {onSetColor && (
        <>
          <Button onClick={() => setIsColorPickerOpen(true)}>
            Change color
          </Button>
          <ColorPickerDialog
            isOpen={isColorPickerOpen}
            setIsOpen={setIsColorPickerOpen}
            setTeamColor={onSetColor}
          />
        </>
      )}
      <div
        style={getTeamColors(team, teamColors, "bg")}
        className={classNames(
          "flex",
          "flex-col",
          "text-center",
          "w-fit",
          "overflow-hidden",
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
    </div>
  );
}
