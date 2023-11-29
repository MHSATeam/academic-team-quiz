export const getTeamColors = (team: string, prefix = "bg-") => ({
  [`${prefix}yellow-300`]: team === "a",
  [`${prefix}blue-400`]: team === "b",
  [`${prefix}gray-500`]: !["a", "b"].includes(team),
});
