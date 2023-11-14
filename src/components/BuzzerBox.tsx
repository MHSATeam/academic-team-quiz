import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { BuzzerClickMessage, RealtimeStatus } from "../buzzers/ably-realtime";
import { useUserList } from "../buzzers/useUserList";
import beepSoundUrl from "/beep.mp3?url";
const beepSound = new Audio(beepSoundUrl);

export default function BuzzerBox() {
  const [currentClick, setCurrentClick] = useState<BuzzerClickMessage | null>(
    null
  );
  const [buzzList, setBuzzList] = useState<BuzzerClickMessage[]>([]);
  const [isMuted, setMuted] = useState(false);
  const otherUsers = useUserList();

  const createTeamDisplay = (team: string) => {
    return (
      <div className="flex flex-col-reverse text-xl p-2">
        {otherUsers
          .filter((member) => member.team === team)
          .map((member) => {
            return (
              <span
                key={member.user.value}
                className={
                  member.user.value === currentClick?.user?.value
                    ? "text-red-400"
                    : ""
                }
              >
                {member.user.label}
              </span>
            );
          })}
        <span>Team {team.toUpperCase()}:</span>
      </div>
    );
  };

  useEffect(() => {
    const unsubscribe = RealtimeStatus.buzzerClick.subscribe(
      (buzzerMessage) => {
        if (
          buzzList.findIndex(
            (buzz) => buzz.user.value === buzzerMessage.user.value
          ) === -1
        ) {
          setBuzzList([...buzzList, buzzerMessage]);
        }
        if (
          currentClick === null ||
          buzzerMessage.timestamp < currentClick.timestamp
        ) {
          setCurrentClick(buzzerMessage);
          if (!isMuted) {
            beepSound.play();
          }
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentClick, buzzList, isMuted]);
  return (
    <>
      <button
        onClick={() => {
          setMuted(!isMuted);
        }}
        className="absolute top-0 left-0 p-2"
      >
        {isMuted ? <VolumeX size={48} /> : <Volume2 size={48} />}
      </button>
      <div className="flex flex-col h-screen">
        <div className="flex flex-row grow">
          {createTeamDisplay("a")}
          <div className="flex flex-col justify-center gap-2 grow">
            <span className="text-4xl text-center">
              {currentClick === null ? (
                "Waiting for buzz..."
              ) : (
                <>
                  <span className="text-red-500 font-bold">
                    {currentClick.user.label}
                  </span>{" "}
                  has buzzed in!
                </>
              )}
            </span>
            <div className="flex flex-col text-center">
              {currentClick !== null &&
                buzzList
                  .filter((buzz) => buzz.user.value !== currentClick.user.value)
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .map((buzz) => {
                    return (
                      <span key={buzz.user.value}>
                        {buzz.user.label}:{" "}
                        {(buzz.timestamp - currentClick.timestamp) / 1000}{" "}
                        seconds later
                      </span>
                    );
                  })}
            </div>
          </div>
          {createTeamDisplay("b")}
        </div>
        <button
          className={
            "rounded-t-md p-8 text-center " +
            (currentClick === null
              ? "bg-gray-400"
              : "bg-red-400 hover:bg-red-500")
          }
          onClick={() => {
            setCurrentClick(null);
            setBuzzList([]);
          }}
        >
          Reset
        </button>
      </div>
    </>
  );
}
