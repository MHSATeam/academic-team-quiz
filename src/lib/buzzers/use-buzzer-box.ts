import { RealtimeStatus, TeamScore } from "@/src/lib/buzzers/ably-realtime";
import { useEffect, useRef, useState } from "react";

export function useBuzzerBox(): [TeamScore[], boolean, boolean] {
  const lastTimeStamp = useRef(0);
  const [isHostConnected, setIsHostConnected] = useState(false);
  const [scores, setScores] = useState<TeamScore[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  useEffect(() => {
    const unsubscribe = RealtimeStatus.boxChannel.subscribePresent(
      (event, type) => {
        const { data } = event;
        switch (type) {
          case "present":
          case "update":
          case "enter": {
            setIsHostConnected(true);
            if (data.timestamp >= lastTimeStamp.current) {
              setScores(data.scores);
              setIsLocked(data.locked);
            }
            break;
          }
          case "leave": {
            setIsHostConnected(false);
            setIsLocked(false);
            break;
          }
        }
      },
    );
    return () => {
      unsubscribe();
    };
  });

  return [scores, isLocked, isHostConnected];
}
