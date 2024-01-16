import { Types } from "ably";
import { Cloud, CloudCog, CloudOff } from "lucide-react";
import { useEffect, useState } from "react";
import { RealtimeStatus } from "@/src/buzzers/ably-realtime";

type StatusSymbol = "server" | "server-off" | "server-cog";

export default function AblyStatusSymbol() {
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
          break;
        }
      }
    };
    handleStateChange({
      current: RealtimeStatus.stateManager.state,
      previous: "initialized",
    });
    RealtimeStatus.stateManager.subscribe(handleStateChange);
    return () => {
      RealtimeStatus.stateManager.unsubscribe(handleStateChange);
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
    RealtimeStatus.stateManager.state
  )}`;

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        alert(title);
      }}
      title={title}
    >
      <Symbol size={36} />
    </button>
  );
}
