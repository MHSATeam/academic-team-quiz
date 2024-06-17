"use client";

import BoxPresenceProvider from "@/components/buzzer/BoxPresenceProvider";
import AlphabetDisplay from "@/components/buzzer/box/AlphabetDisplay";
import BuzzDisplay from "@/components/buzzer/box/BuzzDisplay";
import GameBox from "@/components/buzzer/box/GameBox";
import SetPicker from "@/components/buzzer/box/SetPicker";
import SetTypePicker from "@/components/buzzer/box/SetTypePicker";
import TeamJoin from "@/components/buzzer/box/TeamJoin";
import { RealtimeClient } from "@/src/lib/buzzers/ably-realtime";
import {
  AlphabetRound,
  GamePhase,
  SetType,
  TeamScores,
  Timer,
} from "@/src/lib/buzzers/message-types";
import { CompleteSet } from "@/src/utils/prisma-extensions";
import { ReactNode, useCallback, useMemo, useState } from "react";

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
  const [isAlphabetOpen, setAlphabetOpen] = useState(false);

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

  const updateScore = useCallback((change: number, team: string) => {
    setTeamScores((prev) => {
      return {
        ...prev,
        [team]: prev[team] + change,
      };
    });
  }, []);

  const startTimer = useCallback(() => {
    setTimer((prev) => {
      return {
        ...prev,
        startTime: Date.now(),
      };
    });
  }, []);

  const resetTimer = useCallback(() => {
    setTimer((prev) => {
      return {
        ...prev,
        startTime: -1,
        unpauseTime: -1,
        pauseLeft: -1,
      };
    });
  }, []);

  const toggleTimerPause = useCallback(() => {
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
  }, []);

  const pauseTimerAtTime = useCallback((timestamp: DOMHighResTimeStamp) => {
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
  }, []);

  const updateTimerDuration = useCallback((duration: number) => {
    setTimer((prev) => {
      return {
        ...prev,
        duration: duration,
      };
    });
  }, []);

  const clearBuzzer = useCallback(() => {
    setLastBuzzerClear(Date.now());
  }, []);

  const alphabetRound = useMemo((): AlphabetRound | undefined => {
    if (!questionSet || !questionSet.alphabetRound) {
      return undefined;
    }
    return {
      isOpen: isAlphabetOpen,
      letter: questionSet.alphabetRound.letter,
      questions: questionSet.alphabetRound.round.questions.map(
        (question) => question.question,
      ),
    };
  }, [questionSet, isAlphabetOpen]);

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
    case "alphabet-round":
    case "buzzer": {
      Component = (
        <GameBox
          inDisplayMode={false}
          questionSet={questionSet}
          onUpdateScore={updateScore}
          onSetTimerDuration={updateTimerDuration}
          onStartTimer={startTimer}
          onResetTimer={resetTimer}
          onTogglePauseTimer={toggleTimerPause}
          onUpdatePhase={setPhase}
          onUpdateQuestionIndex={setQuestionIndex}
          onToggleAlphabetQuestions={setAlphabetOpen}
        >
          {phase === "buzzer" && (
            <BuzzDisplay
              inDisplayMode={false}
              questionSet={questionSet}
              onSetLocked={setLocked}
              onUpdateScore={updateScore}
              onResetTimer={resetTimer}
              onPauseTimerAtTime={pauseTimerAtTime}
              onClearBuzzer={clearBuzzer}
              onUpdateQuestionIndex={setQuestionIndex}
            />
          )}
          {phase === "alphabet-round" && (
            <AlphabetDisplay
              inDisplayMode={false}
              questionSet={questionSet}
              onStartTimer={startTimer}
              onToggleQuestions={setAlphabetOpen}
            />
          )}
        </GameBox>
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
      alphabetRound={alphabetRound}
    >
      {Component}
    </BoxPresenceProvider>
  );
}
