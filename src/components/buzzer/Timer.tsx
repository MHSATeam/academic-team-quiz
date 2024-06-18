import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import { getTimeFormat, useTimer } from "@/src/lib/buzzers/timer";
import { Button } from "@tremor/react";
import classNames from "classnames";
import { useContext } from "react";

type TimerProps = {
  showControls?: boolean;
  size?: "sm" | "lg";
  className?: string;
  onSetTimerDuration?: (duration: number) => void;
  onStartTimer?: () => void;
  onResetTimer?: () => void;
  onTogglePause?: () => void;
};

export default function Timer(props: TimerProps) {
  const {
    showControls,
    size,
    onSetTimerDuration,
    onStartTimer,
    onResetTimer,
    onTogglePause,
  } = Object.assign({ showControls: false, size: "lg" }, props);
  const boxPresence = useContext(BoxPresenceContext);
  if (!boxPresence) {
    throw new Error("Buzzer box was used outside of context!");
  }
  const timeLeft = useTimer(
    boxPresence.timer.duration,
    boxPresence.timer.startTime,
    boxPresence.timer.unpauseTime,
    boxPresence.timer.pauseLeft,
  );
  const isTimerRunning = boxPresence.timer.startTime !== -1;
  const isTimerPaused =
    boxPresence.timer.unpauseTime === -1 && boxPresence.timer.pauseLeft !== -1;
  return (
    <div
      className={classNames(
        "flex",
        "flex-col",
        "gap-2",
        "rounded-t-md",
        "w-fit",
        "h-fit",
        "bg-tremor-background-muted",
        "dark:bg-dark-tremor-background-muted",
        {
          "p-3": size === "lg",
          "p-1 px-2": size === "sm",
        },
        props.className,
      )}
    >
      <span
        className={classNames("text-center", "font-semibold", "font-mono", {
          "text-red-500": timeLeft === 0 && isTimerRunning,
          "text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis":
            !isTimerRunning || timeLeft > 0,
          "text-5xl": size === "lg",
          "text-2xl": size === "sm",
        })}
      >
        {getTimeFormat(timeLeft)}
      </span>
      {showControls && (
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            color={isTimerRunning ? "red" : "green"}
            onClick={() => {
              if (isTimerRunning) {
                onResetTimer?.();
              } else {
                onStartTimer?.();
              }
            }}
          >
            {isTimerRunning ? "Reset" : "Start"}
          </Button>
          <Button
            disabled={!isTimerRunning}
            onClick={() => {
              if (isTimerRunning) {
                onTogglePause?.();
              }
            }}
          >
            {isTimerPaused ? "Unpause" : "Pause"}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onSetTimerDuration?.(
                Math.max(boxPresence.timer.duration - 5000, 0),
              );
            }}
          >
            -5s
          </Button>
          <Button
            size="sm"
            onClick={() => {
              onSetTimerDuration?.(boxPresence.timer.duration + 5000);
            }}
          >
            +5s
          </Button>
        </div>
      )}
    </div>
  );
}
