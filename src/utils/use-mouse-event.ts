"use client";

import { useEffect } from "react";

type MouseEventMap = {
  [Property in keyof GlobalEventHandlersEventMap as GlobalEventHandlersEventMap[Property] extends MouseEvent
    ? Property
    : never]: MouseEvent;
};

export default function useMouseEvent<K extends keyof MouseEventMap>(
  eventType: K,
  callback: (event: MouseEvent) => void,
  element: Document | HTMLElement | null = document
) {
  useEffect(() => {
    if (element) {
      (element as HTMLElement).addEventListener(eventType, callback);
    }
    return () => {
      if (element) {
        (element as HTMLElement).removeEventListener(eventType, callback);
      }
    };
  }, [eventType, callback, element]);
}
