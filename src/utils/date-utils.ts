export function compareDateWithoutTime(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

export function formatMonthDateShort(date: Date) {
  return (
    date.toLocaleString("en-US", { month: "short" }) + " " + date.getDate()
  );
}
