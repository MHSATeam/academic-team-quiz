import { useEffect, useState } from "react";
import { BuzzerClickMessage, RealtimeStatus } from "./ably-realtime";

export function useBuzzIn(
  onBuzzIn?: (message: BuzzerClickMessage, isFirst: boolean) => void
): [BuzzerClickMessage | null, BuzzerClickMessage[], () => void] {
  const [buzzList, setBuzzList] = useState<BuzzerClickMessage[]>([]);
  const [currentBuzz, setCurrentClick] = useState<BuzzerClickMessage | null>(
    null
  );
  useEffect(() => {
    const unsubscribeBuzzerClick = RealtimeStatus.buzzerClick.subscribe(
      (buzzerMessage) => {
        if (
          buzzList.findIndex(
            (buzz) => buzz.user.value === buzzerMessage.user.value
          ) === -1
        ) {
          setBuzzList([...buzzList, buzzerMessage]);
        }
        let isFirst = false;
        if (
          currentBuzz === null ||
          buzzerMessage.timestamp < currentBuzz.timestamp
        ) {
          isFirst = true;
          setCurrentClick(buzzerMessage);
        }
        onBuzzIn?.(buzzerMessage, isFirst);
      }
    );

    const unsubscribeBox = RealtimeStatus.boxChannel.subscribe((message) => {
      if (message.type === "reset") {
        setCurrentClick(null);
        setBuzzList([]);
      }
    });

    return () => {
      unsubscribeBuzzerClick();
      unsubscribeBox();
    };
  }, [currentBuzz, buzzList]);

  function reset() {
    setCurrentClick(null);
    setBuzzList([]);
    RealtimeStatus.boxChannel.publish({
      type: "reset",
    });
  }

  return [currentBuzz, buzzList, reset];
}
