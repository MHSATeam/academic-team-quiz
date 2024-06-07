"use client";

import BoxPresenceProvider from "@/components/buzzer/BoxPresenceProvider";
import ConnectedPlayer from "@/components/buzzer/player/ConnectedPlayer";
import GameIdInput from "@/components/buzzer/player/GameIdInput";
import NameInput from "@/components/buzzer/player/NameInput";
import { useState } from "react";

type PlayerPageProps = {
  name?: string;
};

export default function PlayerPage(props: PlayerPageProps) {
  const [name, setName] = useState(props.name ?? "");
  const [connected, setConnected] = useState(false);
  if (name.trim().length === 0) {
    return <NameInput onSetName={setName} />;
  } else if (!connected) {
    return <GameIdInput onSuccessfulJoin={() => setConnected(true)} />;
  } else {
    return (
      <BoxPresenceProvider isBox={false}>
        <ConnectedPlayer name={name} setName={setName} />
      </BoxPresenceProvider>
    );
  }
}
