export type PlayerMessage = BuzzMessage;

export type BuzzMessage = {
  type: "buzz";
  name: string;
  team: string;
  clientId: string;
  questionIndex: number;
  timestamp: DOMHighResTimeStamp;
};

export type PlayerPresence = {
  name: string;
  team: string;
};

export type SetType = "online" | "oac-paper" | "unknown";
export type Timer = {
  duration: number;
  startTime: DOMHighResTimeStamp;
};
export type GamePhase = "team-picker" | "buzzer" | "alphabet-round";
export type TeamScores = { [key: string]: number; a: number; b: number };

export type BoxMessage = ChangeTeamMessage;

type ChangeTeamMessage = {
  type: "change-team";
  clientId: string;
  newTeam: string;
};

export type BoxPresence = {
  gameId: number;
  teamScores: TeamScores;
  gamePhase: GamePhase;
  setType: SetType;
  locked: boolean;
  questionIndex: number;
  timer: Timer;
  lastBuzzerClear: DOMHighResTimeStamp;
};

export type TimingMessage =
  | {
      type: "request";
      requestSent: DOMHighResTimeStamp;
    }
  | {
      type: "response";
      requestSent: DOMHighResTimeStamp;
      responseSent: DOMHighResTimeStamp;
    }
  | {
      type: "clock-offset";
      offset: number;
      clientId: string;
    };
