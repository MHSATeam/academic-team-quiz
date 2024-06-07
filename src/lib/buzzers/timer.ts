import { useEffect, useRef, useState } from "react";

export function getTimeFormat(millisecondsLeft: number) {
  const secondsLeft = Math.round(millisecondsLeft / 1000);
  const minutesLeft = Math.floor(secondsLeft / 60);
  return `${minutesLeft.toString(10).padStart(2, "0")}:${(secondsLeft % 60).toString(10).padStart(2, "0")}`;
}

export function useTimer(
  duration: number,
  startTime: number,
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
          const newTimeLeft = Math.max(0, duration - (Date.now() - startTime));
          setTimeLeft(newTimeLeft);
          if (newTimeLeft === 0) {
            onEnd?.();
          }
        }
      };
      if (intervalId.current) {
        clearInterval(intervalId.current);
      }
      intervalId.current = window.setInterval(updateTime, 500);
      updateTime();
      return () => {
        if (intervalId.current) {
          clearInterval(intervalId.current);
        }
      };
    }
  }, [duration, startTime, onEnd]);

  return timeLeft;
}
