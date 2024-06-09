"use client";

import BoxPresenceProvider from "@/components/buzzer/BoxPresenceProvider";
import BuzzerBox from "@/components/buzzer/box/BuzzerBox";
import SetPicker from "@/components/buzzer/box/SetPicker";
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
import { ReactNode, useCallback, useState } from "react";

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
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questionSet, setQuestionSet] = useState<CompleteSet | undefined>();
  const [teamScores, setTeamScores] = useState<TeamScores>({ a: 0, b: 0 });
  const [timer, setTimer] = useState<Timer>({
    duration: 10000,
    startTime: -1,
    pauseLeft: -1,
    unpauseTime: -1,
  });
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
      return (
        <SetPicker
          sets={props.sets}
          selectSet={(set) => {
            setQuestionSet(set);
            createNewGame();
          }}
        />
      );
    }
    case "team-picker": {
      Component = (
        <TeamJoin
          onStartGame={() => {
            setPhase("buzzer");
          }}
          questionSet={questionSet}
        />
      );
      break;
    }
    case "buzzer": {
      Component = (
        <BuzzerBox
          inDisplayMode={false}
          questionSet={questionSet}
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
          onResetTimer={() => {
            setTimer((prev) => {
              return {
                ...prev,
                startTime: -1,
                unpauseTime: -1,
                pauseLeft: -1,
              };
            });
          }}
          onTogglePauseTimer={() => {
            setTimer((prev) => {
              const now = Date.now();
              if (prev.unpauseTime === -1 && prev.pauseLeft === -1) {
                return {
                  ...prev,
                  pauseLeft: prev.duration - (now - prev.startTime),
                };
              } else if (prev.unpauseTime === -1 && prev.pauseLeft !== -1) {
                return {
                  ...prev,
                  unpauseTime: Date.now(),
                };
              } else {
                return {
                  ...prev,
                  unpauseTime: -1,
                  pauseLeft: prev.pauseLeft - (now - prev.unpauseTime),
                };
              }
            });
          }}
          onPauseTimerAtTime={(timestamp) => {
            setTimer((prev) => {
              if (prev.unpauseTime === -1 && prev.pauseLeft === -1) {
                return {
                  ...prev,
                  pauseLeft: prev.duration - (timestamp - prev.startTime),
                };
              } else if (prev.unpauseTime !== -1) {
                return {
                  ...prev,
                  unpauseTime: -1,
                  pauseLeft: prev.pauseLeft - (timestamp - prev.unpauseTime),
                };
              }
              return prev;
            });
          }}
          onClearBuzzer={() => {
            setLastBuzzerClear(Date.now());
          }}
          onUpdateQuestionIndex={setQuestionIndex}
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
      questionIndex={questionIndex}
      setType={setType}
      teamScores={teamScores}
      timer={timer}
      lastBuzzerClear={lastBuzzerClear}
    >
      {Component}
    </BoxPresenceProvider>
  );
}
