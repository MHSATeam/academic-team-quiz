export function compareDateWithoutTime(d1: Date, d2: Date) {
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}

export function formatMonthDateShort(date: Date) {
  return (
    date.toLocaleString("en-US", { month: "short" }) + " " + date.getUTCDate()
  );
}
