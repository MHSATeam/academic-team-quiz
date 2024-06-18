"use client";

import { useEffect } from "react";

type KeyboardEventMap = {
  [Property in keyof GlobalEventHandlersEventMap as GlobalEventHandlersEventMap[Property] extends KeyboardEvent
    ? Property
    : never]: KeyboardEvent;
};
type EventParam = keyof KeyboardEventMap | (keyof KeyboardEventMap)[];

export default function useKeyboardEvent(
  callback: (event: KeyboardEvent) => void,
  eventType: EventParam = "keydown",
  key?: string
) {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (!key || event.key === key) {
        callback(event);
      }
    };

    const eventArray = parseEventParam(eventType);

    for (const event of eventArray) {
      document.addEventListener(event, listener, true);
    }
    return () => {
      const eventArray = parseEventParam(eventType);
      for (const event of eventArray) {
        document.removeEventListener(event, listener, true);
      }
    };
  }, [key, eventType, callback]);
}

function parseEventParam(eventType: EventParam) {
  let eventArray;
  if (!Array.isArray(eventType)) {
    eventArray = [eventType];
  } else {
    eventArray = eventType;
  }
  return eventArray;
}
