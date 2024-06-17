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

/**
 * Paused if unpauseTime == -1 and pauseLeft != -1
 * Normal if unpauseTime == -1 and pauseLeft == -1
 * Started after pause if unpauseTime != -1 and pauseLeft != -1
 *
 * if(unpauseTime == -1)
 *  if(pauseLeft == -1)
 *    Time Left = max(0, duration - (Date.now() - startTime))
 *  else
 *    Time Left = pauseLeft
 * else
 *  Time Left = max(0, pauseLeft - (Date.now() - unpauseTime))
 */
export type Timer = {
  duration: number;
  unpauseTime: DOMHighResTimeStamp;
  pauseLeft: number;
  startTime: DOMHighResTimeStamp;
};

export type AlphabetRound = {
  isOpen: boolean;
  letter: string;
  questions: string[];
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
  alphabetRound?: AlphabetRound;
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

export type ChunkMessage = {
  fileId: string;
  index: number;
  length: number;
  blob: string;
};
