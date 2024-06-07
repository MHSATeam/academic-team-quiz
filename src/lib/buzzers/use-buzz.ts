import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import { RealtimeClient } from "@/src/lib/buzzers/ably-realtime";
import { BuzzMessage } from "@/src/lib/buzzers/message-types";
import { useContext, useEffect, useMemo, useState } from "react";

export default function useBuzz() {
  const boxPresence = useContext(BoxPresenceContext);
  const [rawBuzzList, setRawBuzzList] = useState<BuzzMessage[]>([]);
  useEffect(() => {
    RealtimeClient.player.subscribe((message) => {
      if (message.type === "buzz") {
        setRawBuzzList((prev) => {
          return [...prev, message];
        });
      }
    });
  }, []);

  const buzzList = useMemo(() => {
    const currentBuzzes = rawBuzzList.filter(
      (buzz) =>
        boxPresence &&
        buzz.timestamp > boxPresence.lastBuzzerClear &&
        buzz.questionIndex === boxPresence.questionIndex,
    );
    const deduplicatedBuzzes: BuzzMessage[] = [];
    for (const buzz of currentBuzzes) {
      if (
        deduplicatedBuzzes.findIndex(
          (deduped) => deduped.clientId === buzz.clientId,
        ) === -1
      ) {
        deduplicatedBuzzes.push(buzz);
      }
    }
    return deduplicatedBuzzes;
  }, [rawBuzzList, boxPresence]);

  const firstBuzz = useMemo(() => {
    return buzzList.reduce(
      (prev, buzz) => {
        if (prev === null) {
          return buzz;
        }
        if (buzz.timestamp < prev.timestamp) {
          return buzz;
        }
        return prev;
      },
      null as BuzzMessage | null,
    );
  }, [buzzList]);
  return [firstBuzz, buzzList, rawBuzzList] as const;
}
