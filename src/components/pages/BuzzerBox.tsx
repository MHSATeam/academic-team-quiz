import classNames from "classnames";
import { Lock, Unlock, Volume2, VolumeX } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";
import { useBuzzIn } from "@/src/lib/buzzers/use-buzz-in";
import { useUserList } from "@/src/lib/buzzers/use-user-list";
import AblyStatusSymbol from "@/components/utils/AblyStatusSymbol";
import {
  BuzzerClickMessage,
  RealtimeStatus,
  TeamScore,
} from "@/src/lib/buzzers/ably-realtime";
import { getTeamColors } from "@/src/lib/buzzers/get-team-colors";

const beepSound = new Audio("/beep.mp3");
const scoresStorageKey = "scores";

export default function BuzzerBox() {
  const [, setBuzzerHistory] = useState<(BuzzerClickMessage | "reset")[]>([]);
  const [teamScores, setTeamScores] = useState<TeamScore[]>(() => {
    const loadedScores = localStorage.getItem(scoresStorageKey);
    if (loadedScores) {
      return JSON.parse(loadedScores);
    } else {
      return [
        {
          score: 0,
          team: "a",
        },
        {
          score: 0,
          team: "b",
        },
      ];
    }
  });
  const [isMuted, setMuted] = useState(false);
  const [isLocked, setLocked] = useState(false);

  const onBuzzIn = useCallback(
    (message: BuzzerClickMessage, isFirst: boolean) => {
      if (!isLocked) {
        setBuzzerHistory((prevHistory) => [...prevHistory, message]);
      }
      if (isFirst && !isMuted) {
        beepSound.play();
      }
    },
    [isLocked, isMuted],
  );
  const [currentBuzz, buzzList, resetBuzzer] = useBuzzIn(onBuzzIn);

  const members = useUserList();
  const sessionId = useRef(nanoid());

  useEffect(() => {
    RealtimeStatus.boxChannel.update({
      scores: teamScores,
      timestamp: Date.now(),
      locked: isLocked,
    });
    localStorage.setItem(scoresStorageKey, JSON.stringify(teamScores));
  }, [teamScores, isLocked]);

  useEffect(() => {
    return () => {
      if (RealtimeStatus.boxChannel.isPresent) {
        RealtimeStatus.boxChannel.leave();
      }
    };
  }, []);

  const saveBuzz = () => {
    if (currentBuzz !== null) {
      fetch("/api/log-buzz", {
        body: JSON.stringify({
          buzzList: buzzList.sort((a, b) => a.timestamp - b.timestamp),
          sessionId: sessionId.current,
        }),
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      resetBuzzer();
    }
  };

  const addPoints = useCallback(
    (points: number, team: string) => {
      setTeamScores((prev) => {
        return [
          ...prev.filter((t) => t.team !== team),
          {
            team,
            score: Math.max(
              (prev.find((t) => t.team === team)?.score ?? 0) + points,
              0,
            ),
          },
        ];
      });
    },
    [setTeamScores],
  );

  useEffect(() => {
    const unsubscribe = RealtimeStatus.boxChannel.subscribe((message) => {
      if (message.type === "score") {
        addPoints(message.amount, message.team);
      }
    });
    return () => {
      unsubscribe();
    };
  }, [addPoints]);

  const createTeamDisplay = (team: string, isLeft: boolean) => {
    const teamScore = teamScores.find((t) => t.team === team);
    if (!teamScore) {
      throw new Error(`Missing score for team ${team}`);
    }
    const { score } = teamScore;

    const cornerRounding = {
      "rounded-se-lg": isLeft,
      "rounded-ss-lg": !isLeft,
    };
    // const tieBreaker = Math.abs(teamScores[0].score - teamScores[1].score);

    return (
      <div className="relative flex flex-col">
        <div
          className={classNames(
            "flex",
            "flex-col",
            "text-xl",
            "p-3",
            "mt-auto",
            getTeamColors(team),
            cornerRounding,
          )}
        >
          <span className="text-3xl">Team {team.toUpperCase()}:</span>
          {members
            .filter((member) => member.team === team)
            .map((member) => {
              return (
                <span
                  key={member.user.value}
                  className={
                    member.user.value === currentBuzz?.user?.value
                      ? "text-red-400"
                      : ""
                  }
                >
                  {member.user.label}
                </span>
              );
            })}
          <span className={"text-center text-5xl text-red-400"}>{score}</span>
        </div>
        <div
          className={classNames(
            "absolute",
            "bottom-0",
            "flex",
            "gap-4",
            "p-2",
            {
              "right-full": !isLeft,
              "left-full": isLeft,
            },
            getTeamColors(team),
            cornerRounding,
          )}
        >
          {[
            1,
            2,
            /*...(tieBreaker > 2 ? [tieBreaker] : []),*/ -1,
            ...(score === 0 ? [] : [-score]),
          ].map((increment, index) => (
            <button
              key={index}
              onClick={() => {
                addPoints(increment, team);
              }}
              className="rounded-md bg-gray-400 p-2 px-4 active:bg-gray-300"
            >
              {increment === -score
                ? "Clear"
                : (increment > 0 ? "+" : "") + increment}
            </button>
          ))}
        </div>
      </div>
    );
  };
  return (
    <>
      <div className="absolute left-0 top-0 z-10 flex w-full">
        <button
          onClick={() => {
            setMuted(!isMuted);
          }}
          className="p-2"
        >
          {isMuted ? <VolumeX size={48} /> : <Volume2 size={48} />}
        </button>
        <button
          onClick={() => {
            setLocked(!isLocked);
          }}
          className="ml-auto p-2"
        >
          {isLocked ? <Lock size={48} /> : <Unlock size={48} />}
        </button>
        <AblyStatusSymbol size={48} buttonClass="p-2" />
      </div>
      <div className="flex h-screen flex-col">
        <div className="flex grow flex-row">
          {createTeamDisplay("a", true)}
          <div className="flex grow flex-col justify-center gap-2">
            <span className="text-center text-6xl">
              {currentBuzz === null ? (
                isLocked ? (
                  "Buzzers are locked"
                ) : (
                  "Waiting for buzz..."
                )
              ) : (
                <>
                  <span
                    className={classNames(
                      "font-bold",
                      getTeamColors(currentBuzz.team, "text-"),
                    )}
                  >
                    {currentBuzz.user.label}
                  </span>{" "}
                  has buzzed in!
                </>
              )}
            </span>
            <div className="flex flex-col text-center text-xl">
              {currentBuzz !== null &&
                buzzList
                  .filter((buzz) => buzz.user.value !== currentBuzz.user.value)
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .map((buzz) => {
                    return (
                      <span key={buzz.user.value}>
                        {buzz.user.label}:{" "}
                        {(buzz.timestamp - currentBuzz.timestamp) / 1000}{" "}
                        seconds later
                      </span>
                    );
                  })}
            </div>
          </div>
          {createTeamDisplay("b", false)}
        </div>
        <div className="flex">
          <button
            className={
              "grow p-8 text-center text-2xl " +
              (currentBuzz === null
                ? "bg-gray-400"
                : "bg-red-400 hover:bg-red-500")
            }
            onClick={() => {
              resetBuzzer();
            }}
          >
            Clear
          </button>
          <button
            className={
              "grow border-l-2 p-8 text-center text-2xl " +
              (currentBuzz === null
                ? "bg-gray-400"
                : "bg-green-400 hover:bg-green-500")
            }
            onClick={() => {
              saveBuzz();
            }}
          >
            Save Buzz
          </button>
        </div>
      </div>
    </>
  );
}
