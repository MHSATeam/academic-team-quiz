import { RealtimeClient } from "@/src/lib/buzzers/ably-realtime";
import { BoxPresence } from "@/src/lib/buzzers/message-types";
import { ReactNode, createContext, useEffect, useState } from "react";

type BoxPresenceProviderProps = {
  children: ReactNode;
} & (({ isBox: true } & BoxPresence) | { isBox: false });

export const BoxPresenceContext = createContext<BoxPresence | undefined>(
  undefined,
);

export default function BoxPresenceProvider(props: BoxPresenceProviderProps) {
  const [receivedPresenceValue, setReceivedPresenceValue] =
    useState<BoxPresence>();
  useEffect(() => {
    if (props.isBox) {
      const { children: _, isBox: __, ...presence } = props;
      RealtimeClient.box.update(presence);
    } else {
      const unsubscribe = RealtimeClient.box.subscribePresent((event) => {
        if (event.action === "leave") {
          setReceivedPresenceValue(undefined);
        } else {
          setReceivedPresenceValue(event.data);
        }
      });
      return () => unsubscribe();
    }
  }, [props]);

  let presence: BoxPresence | undefined;
  if (props.isBox) {
    const { children: _, isBox: __, ...presenceProp } = props;
    presence = presenceProp;
  } else {
    presence = receivedPresenceValue;
  }

  return (
    <BoxPresenceContext.Provider value={presence}>
      {props.children}
    </BoxPresenceContext.Provider>
  );
}
