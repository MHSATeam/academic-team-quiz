import { BoxPresenceContext } from "@/components/buzzer/BoxPresenceProvider";
import DisplayFormattedText from "@/components/utils/DisplayFormattedText";
import {
  OnlineAlphabetRound,
  PaperAlphabetRound,
} from "@/src/lib/buzzers/message-types";
import { Button, Card, Tab, TabGroup, TabList, Title } from "@tremor/react";
import classNames from "classnames";
import { Camera, ChevronLeft, ChevronRight, List, Square } from "lucide-react";
import { useContext, useMemo, useState } from "react";

export default function AlphabetPlayer() {
  const boxPresence = useContext(BoxPresenceContext);
  if (!boxPresence) {
    return null;
  }
  if (!boxPresence.alphabetRound) {
    return null;
  }
  if (boxPresence.alphabetRound.type === "online") {
    return <Online alphabetRound={boxPresence.alphabetRound} />;
  } else {
    return <Paper alphabetRound={boxPresence.alphabetRound} />;
  }
}

function Online({ alphabetRound }: { alphabetRound: OnlineAlphabetRound }) {
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

function Paper({ alphabetRound }: { alphabetRound: PaperAlphabetRound }) {
  const [roundImage, setRoundImage] = useState<File>();

  const imageURL = useMemo(
    () => (roundImage ? URL.createObjectURL(roundImage) : undefined),
    [roundImage],
  );

  return (
    <div
      className={classNames(
        "flex h-full w-full flex-col items-stretch gap-4 overflow-hidden p-2",
      )}
    >
      {!roundImage && (
        <>
          <label
            htmlFor="image-capture"
            className="flex grow flex-col items-center justify-center gap-1 rounded-md border border-tremor-border p-2 text-tremor-content-emphasis active:bg-tremor-background dark:text-dark-tremor-content-emphasis dark:active:bg-dark-tremor-background"
          >
            <Camera size={36} />
            <span>Take a picture</span>
          </label>
          <input
            id="image-capture"
            className="hidden"
            type="file"
            capture="environment"
            accept="image/*"
            onInput={(event) => {
              const files = event.currentTarget.files;
              if (files && files.length) {
                const file = files.item(0);
                if (file) {
                  setRoundImage(file);
                }
              }
            }}
          />
        </>
      )}
      {roundImage &&
        (alphabetRound.isOpen ? (
          <>
            <div className="flex h-full w-full grow flex-col gap-2 overflow-auto">
              <Button
                onClick={() => {
                  setRoundImage(undefined);
                }}
              >
                Retake Picture
              </Button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageURL}
                alt="Captured picture of the alphabet round."
              />
            </div>
          </>
        ) : (
          <Title className="text-center">Questions are Currently Hidden</Title>
        ))}
    </div>
  );
}
