import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import { CompleteSet } from "@/src/utils/prisma-extensions";
import { Button, Flex, Title } from "@tremor/react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useContext, useState } from "react";

type AlphabetDisplayProps = {
  inDisplayMode: boolean;
  questionSet?: CompleteSet;
  onStartTimer?: () => void;
  onToggleQuestions?: (show: boolean) => void;
  onEndAlphabetRound?: (scores: { a: number; b: number }) => void;
};

export default function AlphabetDisplay(props: AlphabetDisplayProps) {
  const boxPresence = useContext(BoxPresenceContext);
  const [alphabetScores, setAlphabetScores] = useState({ a: 0, b: 0 });
  if (!boxPresence) {
    return null;
  }

  return (
    <div className="flex grow flex-col items-center justify-center gap-4">
      <div className="flex justify-center gap-2">
        <Link href={"/alphabet-round-answer-sheet.pdf"} target="_blank">
          <Button className="gap-2">
            <Flex alignItems="center" className="gap-2">
              Print Answer Sheet
              <ExternalLink />
            </Flex>
          </Button>
        </Link>
      </div>
      <span className="text-6xl text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
        {!boxPresence.alphabetRound?.isOpen
          ? "Questions are Currently Hidden"
          : "Alphabet Round in Progresss..."}
      </span>
      {!props.inDisplayMode && !boxPresence.alphabetRound?.isOpen && (
        <Button
          color="green"
          onClick={() => {
            props.onStartTimer?.();
            props.onToggleQuestions?.(true);
          }}
        >
          Show Questions and Start Timer
        </Button>
      )}
      {!props.inDisplayMode && boxPresence.alphabetRound?.isOpen && (
        <>
          <div className="flex w-full justify-around">
            {(["a", "b"] as const).map((team) => {
              return (
                <div
                  key={team}
                  className="flex flex-col justify-center gap-1 text-center"
                >
                  <label htmlFor={"alphabet-round-score-" + team}>
                    <Title>Team {team.toUpperCase()} Points</Title>
                  </label>
                  <input
                    id={"alphabet-round-score-" + team}
                    type="number"
                    className=" no-spin-button w-32 rounded-md text-center text-4xl"
                    value={alphabetScores[team]}
                    onChange={(event) => {
                      setAlphabetScores((prev) => {
                        return {
                          ...prev,
                          [team]: Math.max(
                            0,
                            event.currentTarget.valueAsNumber,
                          ),
                        };
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
          <Button
            className="w-fit"
            color="red"
            onClick={() => {
              props.onEndAlphabetRound?.(alphabetScores);
            }}
          >
            Add Points and End Alphabet Round
          </Button>
        </>
      )}
    </div>
  );
}
