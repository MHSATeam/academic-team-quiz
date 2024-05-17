import classNames from "classnames";
import { useState } from "react";
import { getTeamColors } from "@/src/lib/buzzers/get-team-colors";
import { useBuzzerBox } from "@/src/lib/buzzers/use-buzzer-box";
import ExpandingInput from "../../inputs/ExpandingInput";
import { RealtimeStatus } from "@/src/lib/buzzers/ably-realtime";

export default function Scorekeeper() {
  const [teamScores, , isHostConnected] = useBuzzerBox();
  const addPoints = (increment: number, team: string) => {
    RealtimeStatus.boxChannel.publish({
      type: "score",
      amount: increment,
      team,
    });
  };
  const tieBreaker = Math.abs(
    (teamScores[0]?.score ?? 0) - (teamScores[1]?.score ?? 0),
  );
  const [customScoreInputs, setCustomScoreInputs] = useState({ a: 0, b: 0 });

  function createScoreButton(
    score: number,
    team: "a" | "b",
    key?: string | number,
  ) {
    if (score === 0) {
      return null;
    }
    return (
      <button
        key={key}
        onClick={() => {
          addPoints(score, team);
        }}
        className="rounded-md bg-gray-400 p-2 px-4 active:bg-gray-300"
      >
        {score > 0 ? "+" : score < 0 ? "-" : ""}
        {Math.abs(score)}
      </button>
    );
  }
  if (!isHostConnected) {
    return (
      <div
        className={classNames(
          "absolute",
          "top-1/2",
          "left-1/2",
          "-translate-x-1/2",
          "-translate-y-1/2",
          "flex",
          "flex-col",
          "text-center",
          "dark:text-white",
        )}
      >
        <span>Scorekeeper</span>
        <span>Waiting for host to connect...</span>
      </div>
    );
  }
  return (
    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-2 p-2">
      <span className="text-center text-3xl dark:text-white">Scorekeeper</span>
      <div className="flex flex-wrap gap-4 text-xl">
        {(["a", "b"] as ("a" | "b")[]).map((team) => (
          <div
            key={team}
            className={classNames(
              "p-2",
              "flex",
              "flex-col",
              "rounded-md",
              "gap-2",
              "items-center",
              getTeamColors(team),
            )}
          >
            <span className="text-2xl">
              Team {team.toUpperCase()}:{" "}
              <span className="text-red-400">
                {teamScores.find((teamScore) => teamScore.team === team)
                  ?.score ?? NaN}
              </span>
            </span>
            <div className="flex gap-2">
              {[1, 2, -1].map((increment, index) =>
                createScoreButton(increment, team, index),
              )}
            </div>
            <span>Custom Input</span>
            <div className="flex gap-2">
              <ExpandingInput
                type="text"
                className="rounded-md bg-white p-3 py-1"
                placeholder=" "
                value={
                  Number.isNaN(customScoreInputs[team])
                    ? ""
                    : customScoreInputs[team]
                }
                onChange={(e) => {
                  const filteredValue = e.target.value.replaceAll(
                    /\s|[-.]|(?:^[^0-9])/g,
                    "",
                  );
                  try {
                    const newValue = parseInt(filteredValue);
                    setCustomScoreInputs((old) => {
                      return {
                        ...old,
                        [team]: Math.abs(newValue),
                      };
                    });
                  } catch (e) {
                    /* empty */
                  }
                }}
              />
              {[true, false].map((isAdding) =>
                createScoreButton(
                  Number.isNaN(customScoreInputs[team])
                    ? 0
                    : (isAdding ? 1 : -1) * customScoreInputs[team],
                  team,
                  isAdding ? "add" : "sub",
                ),
              )}
            </div>
            {tieBreaker > 2 && (
              <>
                <span>Tie Breaker</span>
                {createScoreButton(tieBreaker, team)}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
