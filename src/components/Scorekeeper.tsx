import classNames from "classnames";
import { RealtimeStatus } from "../buzzers/ably-realtime";
import { getTeamColors } from "../buzzers/get-team-colors";
import { useBuzzerBox } from "../buzzers/useBuzzerBox";

export default function Scorekeeper() {
  const [teamScores, _, isHostConnected] = useBuzzerBox();
  const addPoints = (increment: number, team: string) => {
    RealtimeStatus.boxChannel.publish({
      type: "score",
      amount: increment,
      team,
    });
  };
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
          "text-center"
        )}
      >
        <span>Scorekeeper</span>
        <span>Waiting for host to connect...</span>
      </div>
    );
  }
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 p-2 flex flex-col gap-2">
      <span className="text-3xl text-center">Scorekeeper</span>
      <div className="flex gap-4 text-xl flex-wrap">
        {["a", "b"].map((team) => (
          <div
            key={team}
            className={classNames(
              "p-2",
              "flex",
              "flex-col",
              "rounded-md",
              "gap-2",
              getTeamColors(team)
            )}
          >
            <span className="text-2xl text-center">
              Team {team.toUpperCase()}:{" "}
              <span className="text-red-400">
                {teamScores.find((teamScore) => teamScore.team === team)
                  ?.score ?? NaN}
              </span>
            </span>
            <div className="flex gap-2">
              {[1, 2, /*...(tieBreaker > 2 ? [tieBreaker] : []),*/ -1].map(
                (increment, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      addPoints(increment, team);
                    }}
                    className="p-2 px-4 bg-gray-400 active:bg-gray-300 rounded-md"
                  >
                    {increment > 0 ? "+" : ""}
                    {increment}
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
