import classNames from "classnames";
import { Lock, Unlock, Volume2, VolumeX } from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BuzzerClickMessage,
  RealtimeStatus,
  TeamScore,
} from "@/src/buzzers/ably-realtime";
import { getTeamColors } from "@/src/buzzers/get-team-colors";
import { useBuzzIn } from "@/src/buzzers/useBuzzIn";
import { useUserList } from "@/src/buzzers/useUserList";

const beepSound = new Audio("/beep.mp3");
const scoresStorageKey = "scores";

export default function BuzzerBox() {
  const [buzzerHistory, setBuzzerHistory] = useState<
    (BuzzerClickMessage | "reset")[]
  >([]);
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
    [isLocked, isMuted]
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
              0
            ),
          },
        ];
      });
    },
    [setTeamScores]
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
    const tieBreaker = Math.abs(teamScores[0].score - teamScores[1].score);

    return (
      <div className="flex flex-col relative">
        <div
          className={classNames(
            "flex",
            "flex-col",
            "text-xl",
            "p-3",
            "mt-auto",
            getTeamColors(team),
            cornerRounding
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
          <span className={"text-red-400 text-5xl text-center"}>{score}</span>
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
            cornerRounding
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
              className="p-2 px-4 bg-gray-400 active:bg-gray-300 rounded-md"
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
      <button
        onClick={() => {
          setMuted(!isMuted);
        }}
        className="absolute top-0 left-0 p-2 z-10"
      >
        {isMuted ? <VolumeX size={48} /> : <Volume2 size={48} />}
      </button>
      <button
        onClick={() => {
          setLocked(!isLocked);
        }}
        className="absolute top-0 right-0 p-2 z-10"
      >
        {isLocked ? <Lock size={48} /> : <Unlock size={48} />}
      </button>
      <div className="flex flex-col h-screen">
        <div className="flex flex-row grow">
          {createTeamDisplay("a", true)}
          <div className="flex flex-col justify-center gap-2 grow">
            <span className="text-6xl text-center">
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
                      getTeamColors(currentBuzz.team, "text-")
                    )}
                  >
                    {currentBuzz.user.label}
                  </span>{" "}
                  has buzzed in!
                </>
              )}
            </span>
            <div className="flex flex-col text-xl text-center">
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
              "grow p-8 text-center text-2xl border-l-2 " +
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