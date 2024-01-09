import { useRef, useEffect } from "react";

type Timer = ReturnType<typeof setTimeout>;

export function useDebounce<Func extends (...args: any[]) => void>(
  func: Func,
  delay = 1000
) {
  const timer = useRef<Timer>();
  const hasBeenCalled = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      hasBeenCalled.current = false;
    };
  }, []);

  const debouncedFunction = ((...args) => {
    if (!hasBeenCalled.current) {
      hasBeenCalled.current = true;
      func(...args);
      const newTimer = setTimeout(() => {
        hasBeenCalled.current = false;
      }, delay);
      clearTimeout(timer.current);
      timer.current = newTimer;
    }
  }) as Func;

  return debouncedFunction;
}
