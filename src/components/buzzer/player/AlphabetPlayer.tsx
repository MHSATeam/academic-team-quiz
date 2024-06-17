import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import DisplayFormattedText from "@/components/utils/DisplayFormattedText";
import { AlphabetRound } from "@/src/lib/buzzers/message-types";
import { Button, Card, Tab, TabGroup, TabList, Title } from "@tremor/react";
import classNames from "classnames";
import { ChevronLeft, ChevronRight, List, Square } from "lucide-react";
import { useContext, useState } from "react";

type AlphabetPlayerProps = {
  name: string;
  team: string;
};

export default function AlphabetPlayer(props: AlphabetPlayerProps) {
  const boxPresence = useContext(BoxPresenceContext);
  if (!boxPresence) {
    return null;
  }
  if (boxPresence.setType === "online" && boxPresence.alphabetRound) {
    return <OnlineAlphabetRound alphabetRound={boxPresence.alphabetRound} />;
  } else {
    return <div></div>;
  }
}

function OnlineAlphabetRound({
  alphabetRound,
}: {
  alphabetRound: AlphabetRound;
}) {
  const [viewType, setViewType] = useState<"list" | "card">("card");
  const [questionIndex, setQuestionIndex] = useState(0);
  const questions = alphabetRound.questions;
  return (
    <div
      className={classNames(
        "flex h-full w-full flex-col items-center gap-4 overflow-hidden p-4",
        {
          "justify-between": viewType === "card" && alphabetRound.isOpen,
          "justify-start": viewType === "list" || !alphabetRound.isOpen,
        },
      )}
    >
      <div className="flex w-full justify-between">
        <Title>
          Alphabet Round Letter: {alphabetRound.letter.toUpperCase()}
        </Title>
        <TabGroup
          className="w-fit"
          onIndexChange={(newIndex) => {
            setViewType(newIndex === 0 ? "card" : "list");
          }}
          defaultIndex={viewType === "card" ? 0 : 1}
        >
          <TabList variant="solid">
            <Tab value={"card"}>
              <Square />
            </Tab>
            <Tab value={"list"}>
              <List />
            </Tab>
          </TabList>
        </TabGroup>
      </div>
      {!alphabetRound.isOpen && <Title>Questions are Currently Hidden</Title>}
      {alphabetRound.isOpen && viewType === "list" && (
        <div className="flex grow flex-col gap-4 overflow-auto">
          {questions.map((question, i) => {
            return (
              <Card key={i}>
                <DisplayFormattedText
                  text={`${i + 1}. ${question}`}
                  className="text-2xl max-sm:text-xl dark:text-white"
                />
              </Card>
            );
          })}
        </div>
      )}

      {alphabetRound.isOpen && viewType === "card" && (
        <>
          <Card className="overflow-auto text-center">
            <DisplayFormattedText
              text={`${questionIndex + 1}. ${questions[questionIndex]}`}
              className="text-2xl max-sm:text-xl dark:text-white"
            />
          </Card>
          <div className="flex w-full items-center justify-between">
            <Button
              onClick={() => {
                setQuestionIndex((prev) => {
                  return Math.max(0, prev - 1);
                });
              }}
            >
              <ChevronLeft />
            </Button>
            <Title>
              {questionIndex + 1} / {questions.length}
            </Title>
            <Button
              onClick={() => {
                setQuestionIndex((prev) => {
                  return Math.min(questions.length - 1, prev + 1);
                });
              }}
            >
              <ChevronRight />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
