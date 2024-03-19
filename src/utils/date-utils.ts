export function compareDateWithoutTime(
  d1: Date,
  d2: Date,
  d1HasTime = true,
  d2HasTime = true
) {
  const getFunctionName = (num: number, utc: boolean): keyof Date => {
    switch (num) {
      case 0: {
        return `get${utc ? "UTC" : ""}FullYear`;
      }
      case 1: {
        return `get${utc ? "UTC" : ""}Month`;
      }
      case 2: {
        return `get${utc ? "UTC" : ""}Date`;
      }
      default: {
        throw new Error("Function name index out of bounds");
      }
    }
  };
  return new Array(3)
    .fill(0)
    .every(
      (_, i) =>
        (d1[getFunctionName(i, !d1HasTime)] as () => number)() ===
        (d2[getFunctionName(i, !d2HasTime)] as () => number)()
    );
}

export function formatMonthDateShort(date: Date) {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "America/New_York",
  });
}

export function newDateInTimeZone(timeZone = "America/New_York") {
  return new Date(new Date().toLocaleString("en-US", { timeZone }));
}
