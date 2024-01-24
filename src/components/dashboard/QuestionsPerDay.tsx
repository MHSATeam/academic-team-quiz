"use client";

import { ActiveDay } from "@/src/lib/streaks/get-questions-per-day";
import {
  compareDateWithoutTime,
  formatMonthDateShort,
} from "@/src/utils/date-utils";
import { AreaChart, Flex, Legend, Switch } from "@tremor/react";
import { useMemo, useState } from "react";

type QuestionsPerDayProps = {
  timeFrameDays: number;
  currentUserDays: ActiveDay[];
  otherUsers: { name: string; userId: string; days: ActiveDay[] }[];
};

export default function QuestionsPerDay(props: QuestionsPerDayProps) {
  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - props.timeFrameDays);
  const [showAll, setShowAll] = useState(false);

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
      showAll
        ? ["You", ...otherUsersSorted.map(({ name }) => name)]
        : ["Answered", "Correct"],
    [showAll, otherUsersSorted]
  );
  const colors = useMemo(
    () =>
      showAll
        ? ["blue", ...otherUsersSorted.map(() => "gray")]
        : ["blue", "green"],
    [showAll, otherUsersSorted]
  );

  return (
    <Flex
      flexDirection="col"
      justifyContent="start"
      className="items-start mt-4 w-full overflow-hidden"
    >
      <Flex justifyContent="end" className="gap-2">
        <label htmlFor="show-all" className="text-gray-500">
          Show others
        </label>
        <Switch
          id="show-all"
          checked={showAll}
          onChange={(value) => setShowAll(value)}
        />
      </Flex>
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

          if (showAll) {
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
        enableLegendSlider={showAll}
      />
    </Flex>
  );
}
