import { UserStreaks } from "@/src/app/(main)/page";
import { ActiveDay } from "@/src/lib/streaks/get-questions-per-day";
import {
  compareDateWithoutTime,
  formatMonthDateShort,
} from "@/src/utils/date-utils";
import { AreaChart, Flex, Switch } from "@tremor/react";
import { useMemo, useState } from "react";

type QuestionsPerDayProps = {
  showAll: boolean;
  streaks: UserStreaks;
  timeFrameDays: number;
  currentUserDays: ActiveDay[];
  otherUsers: { name: string; userId: string; days: ActiveDay[] }[];
};

export default function QuestionsPerDay(props: QuestionsPerDayProps) {
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - props.timeFrameDays);

  const averageDayCount = (days: ActiveDay[]) => {
    return (
      days
        .slice(0, props.timeFrameDays)
        .reduce((sum, day) => sum + Number(day.question_count), 0) /
      props.timeFrameDays
    );
  };

  const otherUsersSorted = useMemo(
    () =>
      props.otherUsers.sort(
        (a, b) => averageDayCount(b.days) - averageDayCount(a.days)
      ),
    [props.otherUsers]
  );

  const categories = useMemo(
    () =>
      props.showAll
        ? ["You", ...otherUsersSorted.map(({ name }) => name)]
        : ["Answered", "Correct"],
    [props.showAll, otherUsersSorted]
  );
  const colors = useMemo(
    () =>
      props.showAll
        ? [
            "blue",
            ...otherUsersSorted.map((user) => {
              const streaks = props.streaks[user.userId];
              return !streaks || !streaks.isActive
                ? "gray"
                : streaks.hasCompletedToday
                ? "emerald"
                : "yellow";
            }),
          ]
        : ["blue", "green"],
    [props.showAll, props.streaks, otherUsersSorted]
  );

  return (
    <AreaChart
      className="h-72"
      data={new Array(props.timeFrameDays).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (props.timeFrameDays - 1) + i);
        const activeDay = props.currentUserDays.find((activeDay) =>
          compareDateWithoutTime(activeDay.date, date, false)
        );
        const Answered = Number(activeDay?.question_count ?? 0);
        const Correct = Number(activeDay?.correct_count ?? 0);

        if (props.showAll) {
          const day: { [userName: string]: number | string } & {
            date: string;
          } = {
            date: formatMonthDateShort(date),
            You: Answered,
          };
          for (const user of props.otherUsers) {
            day[user.name] = Number(
              user.days.find((activeDay) =>
                compareDateWithoutTime(activeDay.date, date, false)
              )?.question_count ?? 0
            );
          }
          return day;
        } else {
          return {
            date: formatMonthDateShort(date),
            Correct,
            Answered,
          };
        }
      })}
      colors={colors}
      index="date"
      yAxisWidth={30}
      categories={categories}
      enableLegendSlider={props.showAll}
    />
  );
}
