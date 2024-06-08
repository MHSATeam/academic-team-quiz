import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import { getTeamColors } from "@/src/lib/buzzers/get-team-colors";
import useBuzz from "@/src/lib/buzzers/use-buzz";
import { Button } from "@tremor/react";
import classNames from "classnames";
import { useContext } from "react";

type CurrentBuzzProps = {
  onClearBuzzer?: () => void;
  onToggleBuzzerLock?: () => void;
  isShowingQuestions: boolean;
};

export default function CurrentBuzz(props: CurrentBuzzProps) {
  const boxPresence = useContext(BoxPresenceContext);
  const [firstBuzz, buzzList] = useBuzz();
  if (!boxPresence) {
    throw new Error(
      "Current buzz must be used within a connected game context!",
    );
  }
  return (
    <div
      className={classNames(
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "gap-4",
        "transition-[flex-grow]",
        {
          "grow-0": firstBuzz === null && props.isShowingQuestions,
          grow: firstBuzz !== null || !props.isShowingQuestions,
        },
      )}
    >
      <div className="flex gap-2 rounded-md bg-tremor-background-subtle p-2 dark:bg-dark-tremor-background">
        <Button
          size={firstBuzz !== null || !props.isShowingQuestions ? "sm" : "xs"}
          className="transition-[padding,_font-size]"
          onClick={props.onToggleBuzzerLock}
          color="gray"
        >
          {boxPresence.locked ? "Unlock" : "Lock"}
        </Button>
        <Button
          size={firstBuzz !== null || !props.isShowingQuestions ? "sm" : "xs"}
          className="transition-[padding,_font-size]"
          onClick={() => {
            props.onClearBuzzer?.();
          }}
          color="red"
        >
          Clear Buzzer
        </Button>
      </div>
      <span
        className={classNames(
          "text-tremor-content-emphasis",
          "dark:text-dark-tremor-content-emphasis",
          "transition-[font-size,_line-height]",
          {
            "text-xl": firstBuzz === null && props.isShowingQuestions,
            "text-6xl": firstBuzz !== null || !props.isShowingQuestions,
          },
        )}
      >
        {firstBuzz === null ? (
          boxPresence.locked ? (
            "Buzzers locked"
          ) : (
            "Waiting for buzz..."
          )
        ) : (
          <>
            <span
              className={classNames(
                "font-bold",
                getTeamColors(firstBuzz.team, "text-"),
              )}
            >
              {firstBuzz.name}
            </span>{" "}
            buzzed in!
          </>
        )}
      </span>
      {firstBuzz !== null &&
        buzzList
          .filter((buzz) => buzz.clientId !== firstBuzz.clientId)
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((buzz) => (
            <span
              key={buzz.clientId}
              className="text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis"
            >
              {buzz.name}: {(buzz.timestamp - firstBuzz.timestamp) / 1000}{" "}
              seconds later
            </span>
          ))}
    </div>
  );
}
