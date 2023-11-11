import { useEffect, useState } from "react";
import { RealtimeStatus } from "../buzzers/ably-realtime";
import buttonImg from "/big-red-button.jpeg?url";

type JoinStatus = "joined" | "joining" | "naming";
export default function BuzzerPage() {
  const [name, setName] = useState<string | null>(null);
  const [status, setStatus] = useState<JoinStatus>("naming");

  useEffect(() => {
    const onBuzz = () => {
      if (name !== null && status === "joined") {
        RealtimeStatus.buzzerClick.publish({
          name,
          timestamp: Date.now(),
        });
      } else {
        alert("You are missing a name!");
        setStatus("naming");
      }
    };
    if (status === "joined") {
      document.addEventListener("touchstart", onBuzz);
      document.addEventListener("mousedown", onBuzz);
    }
    return () => {
      document.removeEventListener("touchstart", onBuzz);
      document.removeEventListener("mousedown", onBuzz);
    };
  }, [status]);

  if (status === "naming") {
    return (
      <div className="flex flex-col gap-3 justify-center p-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg border-2">
        <label className="text-center">Type your name</label>
        <input
          className="border-2 rounded-md p-2"
          value={name ?? ""}
          onChange={(e) => {
            setName(e.target.value);
          }}
        />
        <button
          onClick={() => {
            if (name === null) {
              alert("Please type a name!");
              return;
            }
            setStatus("joined");
          }}
          className="bg-blue-400 rounded-md active:bg-blue-500 p-2"
        >
          Join
        </button>
      </div>
    );
  } else {
    return (
      <div className="flex flex-col justify-center h-screen w-screen">
        <img src={buttonImg} className="max-w-lg w-full mx-auto" />
      </div>
    );
  }
}
