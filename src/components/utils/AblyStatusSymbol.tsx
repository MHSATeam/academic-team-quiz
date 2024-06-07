import { RealtimeClient } from "@/src/lib/buzzers/ably-realtime";
import { Types } from "ably";
import { Cloud, CloudCog, CloudOff, LucideProps } from "lucide-react";
import { useEffect, useState } from "react";

type StatusSymbol = "server" | "server-off" | "server-cog";

export default function AblyStatusSymbol(
  props: LucideProps & { buttonClass?: string },
) {
  const [statusSymbol, setStatusSymbol] = useState<StatusSymbol>("server-off");

  useEffect(() => {
    const handleStateChange = (stateChange: Types.ConnectionStateChange) => {
      switch (stateChange.current) {
        case "connected": {
          setStatusSymbol("server");
          break;
        }
        case "initialized":
        case "closing":
        case "connecting": {
          setStatusSymbol("server-cog");
          break;
        }
        case "closed":
        case "disconnected":
        case "failed":
        case "suspended": {
          setStatusSymbol("server-off");
          if (stateChange.current !== "closed") {
            alert("You are disconnected! You may need to restart the app.");
          }
          break;
        }
      }
    };
    handleStateChange({
      current: RealtimeClient.stateManager.state,
      previous: "initialized",
    });
    RealtimeClient.stateManager.subscribe(handleStateChange);
    return () => {
      RealtimeClient.stateManager.unsubscribe(handleStateChange);
    };
  }, []);
  let Symbol;

  switch (statusSymbol) {
    case "server": {
      Symbol = Cloud;
      break;
    }
    case "server-cog": {
      Symbol = CloudCog;
      break;
    }
    case "server-off": {
      Symbol = CloudOff;
      break;
    }
  }

  const capitalize = (str: string) =>
    str.slice(0, 1).toUpperCase() + str.slice(1);
  const title = `Connection Status: ${capitalize(
    RealtimeClient.stateManager.state,
  )}`;

  const { buttonClass, ...lucideProps } = props;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        alert(title);
        if (
          ["suspended", "disconnected"].includes(
            RealtimeClient.stateManager.state,
          )
        ) {
          RealtimeClient.connect();
        }
      }}
      title={title}
      className={buttonClass}
    >
      <Symbol size={36} {...lucideProps} />
    </button>
  );
}
