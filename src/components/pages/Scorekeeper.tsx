import classNames from "classnames";
import { useState } from "react";
import { RealtimeStatus } from "@/src/buzzers/ably-realtime";
import { getTeamColors } from "@/src/buzzers/get-team-colors";
import { useBuzzerBox } from "@/src/buzzers/useBuzzerBox";
import ExpandingInput from "../utils/ExpandingInput";

export default function Scorekeeper() {
  const [teamScores, _, isHostConnected] = useBuzzerBox();
  const addPoints = (increment: number, team: string) => {
    RealtimeStatus.boxChannel.publish({
      type: "score",
      amount: increment,
      team,
    });
  };
  const tieBreaker = Math.abs(
    (teamScores[0]?.score ?? 0) - (teamScores[1]?.score ?? 0)
  );
  const [customScoreInputs, setCustomScoreInputs] = useState({ a: 0, b: 0 });

  function createScoreButton(
    score: number,
    team: "a" | "b",
    key?: string | number
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
        className="p-2 px-4 bg-gray-400 active:bg-gray-300 rounded-md"
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
          "dark:text-white"
        )}
      >
        <span>Scorekeeper</span>
        <span>Waiting for host to connect...</span>
      </div>
    );
  }
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-2 flex flex-col gap-2">
      <span className="text-3xl text-center dark:text-white">Scorekeeper</span>
      <div className="flex gap-4 text-xl flex-wrap">
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
              getTeamColors(team)
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
                createScoreButton(increment, team, index)
              )}
            </div>
            <span>Custom Input</span>
            <div className="flex gap-2">
              <ExpandingInput
                type="text"
                className="py-1 p-3 rounded-md bg-white"
                placeholder=" "
                value={
                  Number.isNaN(customScoreInputs[team])
                    ? ""
                    : customScoreInputs[team]
                }
                onChange={(e) => {
                  const filteredValue = e.target.value.replaceAll(
                    /\s|[-\.]|(?:^[^0-9])/g,
                    ""
                  );
                  try {
                    const newValue = parseInt(filteredValue);
                    setCustomScoreInputs((old) => {
                      return {
                        ...old,
                        [team]: Math.abs(newValue),
                      };
                    });
                  } catch (e) {}
                }}
              />
              {[true, false].map((isAdding) =>
                createScoreButton(
                  Number.isNaN(customScoreInputs[team])
                    ? 0
                    : (isAdding ? 1 : -1) * customScoreInputs[team],
                  team,
                  isAdding ? "add" : "sub"
                )
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
