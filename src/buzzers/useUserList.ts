import { useEffect, useState } from "react";
import { BuzzerClickPresence, RealtimeStatus } from "./ably-realtime";

export const useUserList = () => {
  const [otherUsers, setOtherUsers] = useState<{
    [key: string]: BuzzerClickPresence;
  }>({});
  useEffect(() => {
    const unsubscribe = RealtimeStatus.buzzerClick.subscribePresent(
      (event, type) => {
        switch (type) {
          case "present":
          case "update":
          case "enter": {
            setOtherUsers((prev) => {
              return {
                ...prev,
                [event.clientId]: event.data,
              };
            });
            break;
          }
          case "leave": {
            setOtherUsers((prev) => {
              return Object.fromEntries(
                Object.entries(prev).filter(
                  ([clientId]) => clientId !== event.clientId
                )
              );
            });
            break;
          }
        }
      }
    );
    return () => {
      unsubscribe();
    };
  });

  return Object.values(otherUsers);
};
