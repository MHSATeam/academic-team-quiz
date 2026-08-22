"use client";

import BoxPresenceProvider from "@/components/buzzer/BoxPresenceProvider";
import ConnectedPlayer from "@/components/buzzer/player/ConnectedPlayer";
import GameIdInput from "@/components/buzzer/player/GameIdInput";
import NameInput from "@/components/buzzer/player/NameInput";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

type PlayerPageProps = {
  name?: string;
  gameId?: number;
};

const BuzzerNameKey = "buzzer-name";

export default function PlayerPage(props: PlayerPageProps) {
  const [name, setName] = useState(props.name ?? "");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loadedName = window.localStorage.getItem(BuzzerNameKey);
      if (loadedName) {
        setName(loadedName);
      }
    }
  }, []);

  const updateName: Dispatch<SetStateAction<string>> = (nameOrAction) => {
    let newName;
    if (typeof nameOrAction === "function") {
      newName = nameOrAction(name);
    } else {
      newName = nameOrAction;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(BuzzerNameKey, newName);
    }
    setName(nameOrAction);
  };

  if (name.trim().length === 0) {
    return <NameInput onSetName={updateName} />;
  } else if (!connected) {
    return (
      <GameIdInput
        defaultGameId={props.gameId}
        onSuccessfulJoin={() => setConnected(true)}
      />
    );
  } else {
    return (
      <BoxPresenceProvider isBox={false}>
        <ConnectedPlayer name={name} setName={updateName} />
      </BoxPresenceProvider>
    );
  }
}
