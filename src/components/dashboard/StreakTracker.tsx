import getDaysActive from "@/src/lib/streaks/get-days-active";
import {
  compareDateWithoutTime,
  formatMonthDateShort,
} from "@/src/utils/date-utils";
import { UserProfile } from "@auth0/nextjs-auth0/client";
import { Flex, Text, Tracker } from "@tremor/react";

export default async function StreakTracker({
  user,
  isStreakActive,
}: {
  user: UserProfile;
  isStreakActive: boolean;
}) {
  if (!user.sub) {
    throw new Error("Missing user id");
  }
  const daysActive = await getDaysActive(user.sub);
  const numDaysInTimeFrame = 15;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (numDaysInTimeFrame - 1));
  const today = new Date();
  return (
    <>
      <Tracker
        data={new Array(numDaysInTimeFrame).fill(0).map((_, i) => {
          const date = new Date();
          const isToday = i === numDaysInTimeFrame - 1;
          date.setDate(date.getDate() - (numDaysInTimeFrame - 1) + i);
          const activeDay = daysActive.find((activeDay) =>
            compareDateWithoutTime(activeDay.date, date, false)
          );

          return {
            color: activeDay
              ? "emerald"
              : isToday && isStreakActive
              ? "yellow"
              : "gray",
            tooltip: isToday ? "Today" : formatMonthDateShort(date),
          };
        })}
        className="mt-4"
      />
      <Flex>
        <Text>{formatMonthDateShort(startDate)}</Text>
        <Text>{formatMonthDateShort(today)}</Text>
      </Flex>
    </>
  );
}
