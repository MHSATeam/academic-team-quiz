import {
  PresenceSubscribeCallback,
  RealtimeClient,
} from "@/src/lib/buzzers/ably-realtime";
import { PlayerPresence } from "@/src/lib/buzzers/message-types";
import { Types } from "ably";
import { useCallback, useEffect, useState } from "react";

export const usePlayerList = () => {
  const [otherUsers, setOtherUsers] = useState<{
    [key: string]: PlayerPresence;
  }>({});

  const eventHandler = useCallback((event, type) => {
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
              ([clientId]) => clientId !== event.clientId,
            ),
          );
        });
        break;
      }
    }
  }, []) as PresenceSubscribeCallback<PlayerPresence>;

  useEffect(() => {
    const unsubscribe = RealtimeClient.player.subscribePresent(eventHandler);
    return () => {
      unsubscribe();
    };
  }, [eventHandler]);

  const refreshUsers = useCallback(async () => {
    const presentUsers = await RealtimeClient.player.getPresent();
    setOtherUsers({});
    for (const presentUser of presentUsers) {
      eventHandler(
        presentUser,
        presentUser.action as Exclude<Types.PresenceAction, "absent">,
      );
    }
  }, [eventHandler]);

  return [
    Object.values(otherUsers),
    Object.keys(otherUsers),
    refreshUsers,
  ] as const;
};
