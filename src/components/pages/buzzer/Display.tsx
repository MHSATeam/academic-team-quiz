"use client";

import BoxPresenceProvider from "@/components/buzzer/BoxPresenceProvider";
import BuzzerBox from "@/components/buzzer/box/BuzzerBox";
import GameIdInput from "@/components/buzzer/player/GameIdInput";
import { useState } from "react";

export default function DisplayPage() {
  const [connected, setConnected] = useState(false);
  if (!connected) {
    return <GameIdInput onSuccessfulJoin={() => setConnected(true)} />;
  } else {
    return (
      <BoxPresenceProvider isBox={false}>
        <BuzzerBox inDisplayMode />
      </BoxPresenceProvider>
    );
  }
}
