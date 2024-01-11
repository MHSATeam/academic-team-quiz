import { useCallback, useEffect, useState } from "react";
import Creatable from "react-select/creatable";
import Select from "react-select";
import { RealtimeStatus } from "../buzzers/ably-realtime";
import { TeamMember, TeamMembers, TeamName } from "../buzzers/team-members";
import { useUserList } from "../buzzers/useUserList";
import { useBuzzIn } from "../buzzers/useBuzzIn";
import classNames from "classnames";
import { ArrowLeft } from "lucide-react";
import AblyStatusSymbol from "./AblyStatusSymbol";
import { useBuzzerBox } from "../buzzers/useBuzzerBox";
import { getTeamColors } from "../buzzers/get-team-colors";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "../buzzers/useDebounce";

type JoinStatus = "joined" | "joining" | "naming";

const successColor = "rgb(29, 222, 23)";
const failureColor = "rgb(221, 51, 29)";

const userKey = "buzz-user";

export default function BuzzerPage() {
  const [currentBuzz, buzzList, reset] = useBuzzIn();
  const [scores, isLocked, isHostConnected] = useBuzzerBox();
  const [user, setUser] = useState<TeamMember | null>(() => {
    const stored = window.localStorage.getItem(userKey);
    if (stored) {
      const user = TeamMembers.find((member) => member.value === stored);
      if (user) {
        return user;
      }
    }
    return null;
  });
  const [team, setTeam] = useState<TeamName>({ value: "a", label: "Team A" });
  const [status, setStatus] = useState<JoinStatus>("naming");
  const [canReset, setCanReset] = useState(false);
  const [currentlyClicking, setCurrentlyClicking] = useState(false);
  const otherUsers = useUserList();
  const navigate = useNavigate();
  // const wakeLock = useRef<null | WakeLockSentinel>(null);

  useEffect(() => {
    if (status === "joined") {
      if (currentBuzz === null) {
        document.body.style.backgroundColor = "unset";
      } else if (currentBuzz.team === team.value) {
        document.body.style.backgroundColor = successColor;
      } else {
        document.body.style.backgroundColor = failureColor;
      }
    }
    let active = true;
    if (currentBuzz !== null && currentBuzz.user.value === user?.value) {
      setTimeout(() => {
        if (active) {
          setCanReset(true);
        }
      }, 1000);
    } else {
      setCanReset(false);
    }
    return () => {
      active = false;
      document.body.style.backgroundColor = "unset";
    };
  }, [currentBuzz, status]);

  // Wake lock system needs more testing before being used
  // useEffect(() => {
  //   let active = false;
  //   async function lock() {
  //     try {
  //       if (wakeLock.current !== null) {
  //         await wakeLock.current.release();
  //         wakeLock.current = null;
  //       }
  //       const newWakeLock = await navigator.wakeLock.request("screen");
  //       if (active) {
  //         wakeLock.current = newWakeLock;
  //       } else {
  //         newWakeLock.release();
  //       }
  //     } catch (err: any) {
  //       console.log(`${err.name}: ${err.message}`);
  //     }
  //   }
  //   if (status === "joined") {
  //     lock();
  //   } else if (wakeLock.current !== null) {
  //     wakeLock.current.release();
  //     wakeLock.current = null;
  //   }

  //   return () => {
  //     active = false;
  //   };
  // }, [status]);

  useEffect(() => {
    if (
      status === "joined" &&
      user !== null &&
      !RealtimeStatus.buzzerClick.isPresent
    ) {
      RealtimeStatus.buzzerClick.enter({ user, team: team.value });
    } else if (RealtimeStatus.buzzerClick.isPresent) {
      RealtimeStatus.buzzerClick.leave();
    }
    return () => {
      if (RealtimeStatus.buzzerClick.isPresent) {
        RealtimeStatus.buzzerClick.leave();
      }
    };
  }, [status, user]);

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(userKey, user.value);
    }
  }, [user]);

  const onBuzz = useDebounce(
    useCallback(() => {
      setCurrentlyClicking(true);
      if (user !== null && status === "joined") {
        RealtimeStatus.buzzerClick.publish({
          user,
          team: team.value,
          timestamp: Date.now(),
        });
      } else {
        alert("You are missing a name!");
        setStatus("naming");
      }
    }, [status, user, isLocked, isHostConnected]),
    500
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === " ") {
        onBuzz();
      }
    };
    if (status === "joined") {
      document.addEventListener("keydown", onKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [status, onBuzz]);

  useEffect(() => {
    const onMouseUp = () => {
      setCurrentlyClicking(false);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === " ") {
        onMouseUp();
      }
    };
    document.addEventListener("touchend", onMouseUp);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("touchend", onMouseUp);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const unusedMembers = TeamMembers.filter((member) =>
    otherUsers.map((value) => value.user.value).includes(member.value)
  );

  const teamMembers = otherUsers.filter(
    (connection) => connection.team === team.value
  );

  const myBuzz = buzzList.find((buzz) => buzz.user.value === user?.value);

  if (status === "naming") {
    return (
      <>
        <div className="no-buzz absolute top-0 left-0 p-1">
          <button
            onClick={() => {
              navigate("/");
            }}
            className="p-3"
          >
            <div className="bg-gray-400 p-2 rounded-md flex gap-2">
              <ArrowLeft />
              <span>Back to Quiz</span>
            </div>
          </button>
        </div>
        <div className="flex flex-col gap-3 justify-center p-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg border-2">
          <label className="text-center">Choose Your Name</label>
          <Creatable
            className="min-w-[16em]"
            options={TeamMembers}
            isClearable={false}
            value={user}
            onChange={(value, action) => {
              if (action.action === "create-option" && value) {
                setUser({ label: value.label, value: "guest" });
              } else {
                setUser(value);
              }
            }}
            formatCreateLabel={(input) => {
              return `Join as guest: "${input}"`;
            }}
          />
          <Select
            options={"ab".split("").map((char) => ({
              value: char,
              label: `Team ${char.toUpperCase()}`,
            }))}
            value={team}
            onChange={(newTeam) => {
              if (newTeam) {
                setTeam(newTeam);
              }
            }}
          />
          <button
            disabled={user === null}
            onClick={() => {
              if (user === null) {
                return;
              }
              if (
                unusedMembers.map((value) => value.value).includes(user?.value)
              ) {
                alert("This person has already logged in!");
                return;
              }
              setStatus("joined");
            }}
            className="bg-blue-400 rounded-md active:bg-blue-500 p-2"
          >
            Join
          </button>
        </div>
      </>
    );
  } else if (user !== null) {
    const topBar = (
      <div className="no-buzz absolute top-0 left-0 p-1 w-full flex gap-4 items-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setStatus("naming");
          }}
          className="p-3"
        >
          <div className="bg-gray-400 p-2 rounded-md">
            <ArrowLeft />
          </div>
        </button>
        <span className="text-lg">Good Luck {user.label.split(" ")[0]}!</span>
        <div className="ml-auto m-3">
          <AblyStatusSymbol />
        </div>
      </div>
    );
    if (!isHostConnected) {
      return (
        <>
          {topBar}
          <div
            className={classNames(
              "absolute",
              "top-1/2",
              "left-1/2",
              "-translate-x-1/2",
              "-translate-y-1/2",
              "flex",
              "flex-col"
            )}
          >
            <span>Waiting for host to connect...</span>
          </div>
        </>
      );
    }
    return (
      <>
        {topBar}
        <div
          className={classNames(
            "absolute",
            "top-1/2",
            "left-1/2",
            "-translate-x-1/2",
            "-translate-y-1/2",
            "flex",
            "flex-col",
            "p-10",
            "rounded-full",
            "text-center",
            getTeamColors(team.value),
            {
              "shadow-lg": currentlyClicking,
            }
          )}
          onMouseDown={(e) => {
            e.preventDefault();
            onBuzz();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            onBuzz();
          }}
        >
          <span className="text-4xl shrink-0 whitespace-nowrap">
            {isLocked ? "Locked" : "Buzz"}
          </span>
          <span className="shrink-0">{team.label}:</span>
          {teamMembers.map((connection) => {
            return (
              <span key={connection.user.value}>{connection.user.label}</span>
            );
          })}
        </div>
        <div className="no-buzz absolute bottom-0 left-0 w-full flex flex-col gap-2">
          {currentBuzz && (
            <span className="text-center text-lg">
              {currentBuzz.user.value === user.value ? (
                "You buzzed in!"
              ) : (
                <span>
                  {currentBuzz.user.label} has buzzed in!
                  {myBuzz && (
                    <>
                      <br />
                      {(myBuzz.timestamp - currentBuzz.timestamp) / 1000}{" "}
                      seconds later
                    </>
                  )}
                </span>
              )}
            </span>
          )}
          {canReset && false && (
            <button
              onClick={() => {
                reset();
              }}
              className="bg-red-400 m-4 p-2 rounded-md"
            >
              Clear mistaken buzz
            </button>
          )}
          <div className="flex justify-center gap-10">
            {scores
              .sort((a, b) => a.team.localeCompare(b.team))
              .map((teamScore) => (
                <span
                  key={teamScore.team}
                  className={classNames(
                    "rounded-t-md",
                    "p-4",
                    "text-3xl",
                    "shrink-0",
                    getTeamColors(teamScore.team)
                  )}
                >
                  Team {teamScore.team.toUpperCase()}:{" "}
                  <span className="text-red-400">{teamScore.score}</span>
                </span>
              ))}
          </div>
        </div>
      </>
    );
  } else {
    return (
      <span className="flex flex-col">
        Something went wrong!
        <button
          className="border-2 rounded-md"
          onClick={() => {
            setStatus("naming");
          }}
        >
          Try to fix
        </button>
      </span>
    );
  }
}
