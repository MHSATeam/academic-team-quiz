import { CSSProperties } from "react";
import { TeamColors } from "./message-types";

export const getTeamColors = (
  team: string,
  teamColors: TeamColors,
  type: "text" | "bg" = "bg",
): CSSProperties => {
  const color = teamColors[team];
  if (type === "text") {
    return {
      color,
    };
  }
  return {
    backgroundColor: color,
  };
  // return {
  //   [`${prefix}yellow-300`]: team === "a",
  //   [`${prefix}blue-400`]: team === "b",
  //   [`${prefix}gray-500`]: !["a", "b"].includes(team),
  // };
};

// bg-yellow-300
// bg-blue-400
// bg-gray-500
// text-yellow-300
// text-blue-400
// text-gray-500
