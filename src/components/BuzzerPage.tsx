import { useEffect, useState } from "react";
import Creatable from "react-select/creatable";
import Select from "react-select";
import { RealtimeStatus } from "../buzzers/ably-realtime";
import { TeamMember, TeamMembers, TeamName } from "../buzzers/team-members";
import { useUserList } from "../buzzers/useUserList";

type JoinStatus = "joined" | "joining" | "naming";

export default function BuzzerPage() {
  const [user, setUser] = useState<TeamMember | null>(null);
  const [team, setTeam] = useState<TeamName>({ value: "a", label: "Team A" });
  const [status, setStatus] = useState<JoinStatus>("naming");
  const otherUsers = useUserList();

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
    const onBuzz = () => {
      if (user !== null && status === "joined") {
        RealtimeStatus.buzzerClick.publish({
          user,
          timestamp: Date.now(),
        });
      } else {
        alert("You are missing a name!");
        setStatus("naming");
      }
    };
    if (status === "joined") {
      document.addEventListener("touchstart", onBuzz);
      document.addEventListener("mousedown", onBuzz);
    }
    return () => {
      document.removeEventListener("touchstart", onBuzz);
      document.removeEventListener("mousedown", onBuzz);
    };
  }, [status, user]);

  const unusedMembers = TeamMembers.filter((member) =>
    otherUsers.map((value) => value.user.value).includes(member.value)
  );

  if (status === "naming") {
    return (
      <div className="flex flex-col gap-3 justify-center p-2 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg border-2">
        <label className="text-center">Choose Your Name</label>
        <Creatable
          className="min-w-[16em]"
          options={TeamMembers}
          isClearable={false}
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
    );
  } else if (user !== null) {
    return (
      <div className="flex flex-col justify-center">
        <span>Team Member List:</span>
        {otherUsers
          .filter(
            (connection) =>
              connection.team === team.value &&
              connection.user.value !== user.value
          )
          .map((connection) => {
            return (
              <span key={connection.user.value}>{connection.user.label}</span>
            );
          })}
      </div>
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
