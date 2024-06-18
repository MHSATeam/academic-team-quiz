import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import { Tooltip } from "@/components/utils/Tooltip";
import { getTeamColors } from "@/src/lib/buzzers/get-team-colors";
import useBuzz from "@/src/lib/buzzers/use-buzz";
import { Button } from "@tremor/react";
import classNames from "classnames";
import { Check, CheckCheck, X } from "lucide-react";
import { useContext } from "react";

type CurrentBuzzProps = {
  onClearBuzzer?: () => void;
  onMarkQuestion?: (
    result: "correct" | "incorrect" | "correct-2-attempt",
  ) => void;
  onToggleBuzzerLock?: () => void;
  isShowingQuestions: boolean;
  inDisplayMode: boolean;
};

export default function CurrentBuzz(props: CurrentBuzzProps) {
  const boxPresence = useContext(BoxPresenceContext);
  const [firstBuzz, buzzList] = useBuzz();
  if (!boxPresence) {
    throw new Error(
      "Current buzz must be used within a connected game context!",
    );
  }

  const isSmall = firstBuzz === null && props.isShowingQuestions;
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
          "grow-0": isSmall,
          grow: !isSmall,
        },
      )}
    >
      {!props.inDisplayMode && (
        <div className="flex gap-2 rounded-md bg-tremor-background-subtle p-2 dark:bg-dark-tremor-background">
          <Button
            size={!isSmall ? "sm" : "xs"}
            className="transition-[padding,_font-size]"
            onClick={props.onToggleBuzzerLock}
            color="gray"
          >
            {boxPresence.locked ? "Unlock" : "Lock"}
          </Button>
          <Tooltip triggerAsChild content="Correct">
            <Button
              disabled={firstBuzz === null}
              size={!isSmall ? "sm" : "xs"}
              className="transition-[padding,_font-size]"
              color="green"
              onClick={() => props.onMarkQuestion?.("correct")}
            >
              <Check />
            </Button>
          </Tooltip>
          <Tooltip triggerAsChild content="Correct on second attempt">
            <Button
              disabled={firstBuzz === null}
              size={!isSmall ? "sm" : "xs"}
              className="transition-[padding,_font-size]"
              color="green"
              onClick={() => {
                props.onMarkQuestion?.("correct-2-attempt");
              }}
            >
              <CheckCheck />
            </Button>
          </Tooltip>
          <Tooltip triggerAsChild content="Incorrect">
            <Button
              disabled={firstBuzz === null}
              size={!isSmall ? "sm" : "xs"}
              className="transition-[padding,_font-size]"
              color="red"
              onClick={() => props.onMarkQuestion?.("incorrect")}
            >
              <X />
            </Button>
          </Tooltip>
        </div>
      )}
      <span
        className={classNames(
          "text-tremor-content-emphasis",
          "dark:text-dark-tremor-content-emphasis",
          "transition-[font-size,_line-height]",
          {
            "text-xl": isSmall,
            "text-6xl": !isSmall,
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
