/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import BoxPresenceProvider from "@/components/buzzer/BoxPresenceProvider";
import BuzzerBox from "@/components/buzzer/box/BuzzerBox";
import SetTypePicker from "@/components/buzzer/box/SetTypePicker";
import TeamJoin from "@/components/buzzer/box/TeamJoin";
import { RealtimeClient } from "@/src/lib/buzzers/ably-realtime";
import {
  GamePhase,
  SetType,
  TeamScores,
  Timer,
} from "@/src/lib/buzzers/message-types";
import { CompleteSet } from "@/src/utils/prisma-extensions";
import { ReactNode, useCallback, useEffect, useState } from "react";

export type BoxPageProps = {
  sets: CompleteSet[];
};

export default function BoxPage(props: BoxPageProps) {
  const [phase, setPhase] = useState<
    GamePhase | "set-type-picker" | "set-picker"
  >("set-type-picker");
  const [setType, setSetType] = useState<SetType>("online");
  const [gameId, setGameId] = useState(0);
  const [locked, setLocked] = useState(false);
  const [questionId, setQuestionId] = useState(0);
  const [teamScores, setTeamScores] = useState<TeamScores>({ a: 0, b: 0 });
  const [timer, setTimer] = useState<Timer>({ duration: 10000, startTime: -1 });
  const [lastBuzzerClear, setLastBuzzerClear] = useState(0);

  const createNewGame = useCallback(async () => {
    const response = await fetch("/api/get-new-game-id");
    if (!response.ok) {
      throw new Error("Failed to find new game id!");
    }
    const id = parseInt(await response.text());
    if (await RealtimeClient.connectToGame(id, false)) {
      setGameId(id);
      setPhase("team-picker");
    } else {
      throw new Error("Failed to connect to realtime channels!");
    }
  }, []);

  let Component: ReactNode;
  switch (phase) {
    case "set-type-picker": {
      return (
        <SetTypePicker
          onPickSet={(newSetType) => {
            setSetType(newSetType);
            if (newSetType === "online") {
              setPhase("set-picker");
            } else {
              createNewGame();
            }
          }}
        />
      );
    }
    case "set-picker": {
      return null;
    }
    case "team-picker": {
      Component = (
        <TeamJoin
          onStartGame={() => {
            setPhase("buzzer");
          }}
        />
      );
      break;
    }
    case "buzzer": {
      Component = (
        <BuzzerBox
          inDisplayMode={false}
          onSetLocked={(newValue) => {
            setLocked(newValue);
          }}
          onUpdateScore={(change, team) => {
            setTeamScores((prev) => {
              return {
                ...prev,
                [team]: prev[team] + change,
              };
            });
          }}
          onSetTimerDuration={(duration) => {
            setTimer((prev) => {
              return {
                ...prev,
                duration: duration,
              };
            });
          }}
          onStartTimer={() => {
            setTimer((prev) => {
              return {
                ...prev,
                startTime: Date.now(),
              };
            });
          }}
          onStopTimer={() => {
            setTimer((prev) => {
              return {
                ...prev,
                startTime: -1,
              };
            });
          }}
          onClearBuzzer={() => {
            setLastBuzzerClear(Date.now());
          }}
        />
      );
      break;
    }
    default: {
      return null;
    }
  }

  return (
    <BoxPresenceProvider
      isBox
      locked={locked}
      gameId={gameId}
      gamePhase={phase}
      questionIndex={questionId}
      setType={setType}
      teamScores={teamScores}
      timer={timer}
      lastBuzzerClear={lastBuzzerClear}
    >
      {Component}
    </BoxPresenceProvider>
  );
}
