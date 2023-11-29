export const getTeamColors = (team: string, prefix = "bg-") => ({
  [`${prefix}yellow-300`]: team === "a",
  [`${prefix}blue-400`]: team === "b",
  [`${prefix}gray-500`]: !["a", "b"].includes(team),
});

// bg-yellow-300
// bg-blue-400
// bg-gray-500
// text-yellow-300
// text-blue-400
// text-gray-500
