import { useEffect, useRef, useState } from "react";

export function getTimeFormat(millisecondsLeft: number) {
  const secondsLeft = Math.floor(millisecondsLeft / 1000);
  const minutesLeft = Math.floor(secondsLeft / 60);
  return `${minutesLeft.toString(10).padStart(2, "0")}:${(secondsLeft % 60).toString(10).padStart(2, "0")}${secondsLeft <= 5 ? "." + (Math.round((millisecondsLeft - secondsLeft * 1000) / 10) % 100).toString(10).padStart(2, "0") : ""}`;
}

export function useTimer(
  duration: number,
  startTime: number,
  unpauseTime: number,
  pauseLeft: number,
  onEnd?: () => void,
) {
  const intervalId = useRef<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(duration);
  useEffect(() => {
    if (startTime === -1) {
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
      setTimeLeft(duration);
    } else {
      const updateTime = () => {
        if (startTime !== -1) {
          let newTimeLeft = 0;
          if (unpauseTime === -1) {
            if (pauseLeft === -1) {
              newTimeLeft = Math.max(0, duration - (Date.now() - startTime));
            } else {
              newTimeLeft = Math.max(0, pauseLeft);
            }
          } else {
            newTimeLeft = Math.max(0, pauseLeft - (Date.now() - unpauseTime));
          }
          setTimeLeft(newTimeLeft);
          if (newTimeLeft === 0) {
            onEnd?.();
          }
        }
      };
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
      intervalId.current = window.setInterval(updateTime, 10);
      updateTime();
      return () => {
        if (intervalId.current) {
          clearInterval(intervalId.current);
        }
      };
    }
  }, [duration, startTime, unpauseTime, pauseLeft, onEnd]);

  return timeLeft;
}
