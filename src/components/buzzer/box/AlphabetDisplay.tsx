import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import { CompleteSet } from "@/src/utils/prisma-extensions";
import { Button, Flex } from "@tremor/react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useContext } from "react";

type AlphabetDisplayProps = {
  inDisplayMode: boolean;
  questionSet?: CompleteSet;
  onStartTimer?: () => void;
  onToggleQuestions?: (show: boolean) => void;
};

export default function AlphabetDisplay(props: AlphabetDisplayProps) {
  const boxPresence = useContext(BoxPresenceContext);
  if (!boxPresence) {
    return null;
  }

  return (
    <div className="flex grow flex-col justify-center gap-4">
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
        <div className="flex justify-around"></div>
      )}
    </div>
  );
}
