import { useEffect, useRef, useState } from "react";
import { BuzzerClickMessage, RealtimeStatus } from "./ably-realtime";

export function useBuzzIn(
  onBuzzIn?: (message: BuzzerClickMessage, isFirst: boolean) => void
): [BuzzerClickMessage | null, BuzzerClickMessage[], () => void] {
  const [buzzList, setBuzzList] = useState<BuzzerClickMessage[]>([]);
  const [currentBuzz, setCurrentClick] = useState<BuzzerClickMessage | null>(
    null
  );
  const isFirst = useRef(true);
  useEffect(() => {
    const unsubscribeBuzzerClick = RealtimeStatus.buzzerClick.subscribe(
      (buzzerMessage) => {
        setBuzzList((currentList) => {
          if (
            currentList.findIndex(
              (buzz) => buzz.user.value === buzzerMessage.user.value
            ) === -1
          ) {
            return [...currentList, buzzerMessage];
          }
          return currentList;
        });
        setCurrentClick((currentClick) => {
          if (
            currentClick === null ||
            buzzerMessage.timestamp < currentClick.timestamp
          ) {
            return buzzerMessage;
          }
          return currentClick;
        });
        onBuzzIn?.(buzzerMessage, isFirst.current);
        isFirst.current = false;
      }
    );

    const unsubscribeBox = RealtimeStatus.boxChannel.subscribe((message) => {
      if (message.type === "reset") {
        setCurrentClick(null);
        setBuzzList([]);
        isFirst.current = true;
      }
    });

    return () => {
      unsubscribeBuzzerClick();
      unsubscribeBox();
    };
  }, [onBuzzIn]);

  function reset() {
    setCurrentClick(null);
    setBuzzList([]);
    RealtimeStatus.boxChannel.publish({
      type: "reset",
    });
  }

  return [currentBuzz, buzzList, reset];
}
