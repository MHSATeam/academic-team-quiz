"use client";

import BoxPresenceProvider, {
  BoxPresenceContext,
} from "@/components/buzzer/BoxPresenceProvider";
import AlphabetDisplay from "@/components/buzzer/box/AlphabetDisplay";
import BuzzDisplay from "@/components/buzzer/box/BuzzDisplay";
import GameBox from "@/components/buzzer/box/GameBox";
import GameIdInput from "@/components/buzzer/player/GameIdInput";
import { useContext, useState } from "react";

export default function DisplayPage() {
  const [connected, setConnected] = useState(false);
  if (!connected) {
    return <GameIdInput onSuccessfulJoin={() => setConnected(true)} />;
  } else {
    return (
      <BoxPresenceProvider isBox={false}>
        <GameBox inDisplayMode>
          <PhaseSelector />
        </GameBox>
      </BoxPresenceProvider>
    );
  }
}

function PhaseSelector() {
  const boxPresence = useContext(BoxPresenceContext);
  if (boxPresence && boxPresence.gamePhase === "alphabet-round") {
    return <AlphabetDisplay inDisplayMode />;
  }
  return <BuzzDisplay inDisplayMode />;
}
