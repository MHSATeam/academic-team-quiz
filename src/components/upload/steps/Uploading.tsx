import { StepComponentProps } from "@/components/pages/management/UploadSet";
import {
  Button,
  Card,
  Dialog,
  DialogPanel,
  Flex,
  Subtitle,
  TextInput,
  Title,
} from "@tremor/react";
import { ChevronLeft, Settings, UploadCloud } from "lucide-react";
import { useState } from "react";
import { Document, Page } from "react-pdf";
import SetContext from "@/components/upload/uploading/SetContext";
import CategoryRound from "@/components/upload/uploading/CategoryRound";
import AlphabetRound from "@/components/upload/uploading/AlphabetRound";
import LightningRound from "@/components/upload/uploading/LightningRound";
import { isOACSet } from "@/src/utils/set-upload-utils";
import ThemeRound from "@/components/upload/uploading/ThemeRound";
import QuestionContainer from "@/components/upload/uploading/QuestionContainer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/utils/PortalSelect";

const CurrentYear = new Date().getFullYear();
const EarliestYear = 1950;

export default function Uploading(props: StepComponentProps) {
  const { context } = props.state;
  const [numPages, setNumPages] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isComplete =
    context.set !== null &&
    context.set.name.trim().length > 0 &&
    context.set.createdYear > 0;
  return (
    <>
      <Flex className="gap-4 overflow-hidden" alignItems="stretch">
        <Document
          file={context.pdfFile}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
          }}
          className="h-full shrink-0 overflow-auto border bg-white"
        >
          {Array.from(new Array(numPages), (_, index) => {
            return (
              <Page
                key={index}
                pageIndex={index}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                className="border-b-2"
                loading={
                  <span className="dark:text-white">
                    Loading Page #{index + 1}
                  </span>
                }
              />
            );
          })}
        </Document>
        {context.set !== null && (
          <Flex
            flexDirection="col"
            className="gap-2 overflow-hidden"
            justifyContent="start"
          >
            <Flex className="gap-2" justifyContent="start">
              <input
                placeholder="Set Name"
                value={context.set.name}
                onChange={(event) => {
                  props.send({
                    type: "updateSetName",
                    params: {
                      newName: event.target.value,
                    },
                  });
                }}
                className="grow border-b-2 border-tremor-border bg-transparent p-2 text-tremor-metric text-tremor-content-emphasis outline-none focus-within:border-tremor-brand dark:border-dark-tremor-border dark:text-dark-tremor-content-emphasis"
              />
              <Button
                color="gray"
                className={
                  "mr-3 p-2" + (!isComplete ? " animate-custom-pulse" : "")
                }
                onClick={() => {
                  setIsSettingsOpen(true);
                }}
              >
                <Settings />
              </Button>
            </Flex>
            <Flex
              flexDirection="col"
              className="grow gap-4 overflow-auto"
              justifyContent="start"
            >
              <SetContext state={props.state} send={props.send}>
                {isOACSet(context.set) ? (
                  <>
                    <CategoryRound
                      round={context.set.categoryRound}
                      questionLists={context.questionLists}
                      questions={context.questions}
                    />
                    <AlphabetRound
                      setLetter={(letter) => {
                        letter = letter.toLowerCase();
                        if (
                          "abcdefghijklmnopqrstuvwxyz".indexOf(letter) !== -1
                        ) {
                          props.send({
                            type: "updateAlphabetLetter",
                            params: { letter },
                          });
                        }
                      }}
                      round={context.set.alphabetRound}
                      questionLists={context.questionLists}
                      questions={context.questions}
                    />
                    <LightningRound
                      round={context.set.lightningRound}
                      questionLists={context.questionLists}
                      questions={context.questions}
                    />
                    <ThemeRound
                      round={context.set.themeRound}
                      setTheme={(theme) => {
                        props.send({
                          type: "updateTheme",
                          params: { theme },
                        });
                      }}
                      questionLists={context.questionLists}
                      questions={context.questions}
                    />
                  </>
                ) : (
                  <Card>
                    <Title className="mb-2">Question Order</Title>
                    <QuestionContainer
                      id={context.questionLists[0].id}
                      questionData={context.questions}
                      questions={context.questionLists[0].questions}
                    />
                  </Card>
                )}
              </SetContext>
            </Flex>
            <Flex className="mt-auto gap-2">
              <Button
                color="gray"
                className="grow"
                onClick={() => {
                  props.send({
                    type: "toFormatting",
                  });
                }}
              >
                <div className="flex items-center gap-2">
                  <ChevronLeft /> Return to Formatting
                </div>
              </Button>
              <Button
                color="green"
                className="grow"
                disabled={!isComplete}
                onClick={() => {
                  props.send({
                    type: "finalize",
                  });
                }}
              >
                <div className="flex items-center gap-2">
                  Finalize Set <UploadCloud />
                </div>
              </Button>
            </Flex>
          </Flex>
        )}
      </Flex>
      <Dialog open={context.set === null} onClose={() => {}} static={true}>
        <DialogPanel>
          <Flex flexDirection="col" className="gap-4" alignItems="stretch">
            <Title className="text-center">Set type</Title>
            <Flex className="gap-2 overflow-hidden" alignItems="stretch">
              {[
                {
                  name: "OAC Set",
                  isOAC: true,
                  description:
                    "A standard set for Ohio Academic Competitions. Includes a category, alphabet, lightning, and theme round.",
                },
                {
                  name: "Custom Set",
                  isOAC: false,
                  description:
                    "Any set of question NOT in the standard OAC set form.",
                },
              ].map((button) => {
                return (
                  <Button
                    className="shrink basis-1/2 overflow-hidden"
                    key={button.name}
                    onClick={() => {
                      props.send({
                        type: "convertSetType",
                        params: {
                          toOAC: button.isOAC,
                          categories: props.categories,
                        },
                      });
                    }}
                  >
                    <Flex flexDirection="col" className="overflow-hidden">
                      <Title>{button.name}</Title>
                      <p className="text-wrap text-tremor-content-strong dark:text-dark-tremor-content-strong">
                        {button.description}
                      </p>
                    </Flex>
                  </Button>
                );
              })}
            </Flex>
            <Button
              color="gray"
              className="grow"
              onClick={() => {
                props.send({
                  type: "toFormatting",
                });
              }}
            >
              <div className="flex items-center gap-2">
                <ChevronLeft /> Return to Formatting
              </div>
            </Button>
          </Flex>
        </DialogPanel>
      </Dialog>
      {context.set && (
        <Dialog open={isSettingsOpen} onClose={setIsSettingsOpen}>
          <DialogPanel>
            <Flex flexDirection="col" className="gap-4" alignItems="stretch">
              <Title>Settings</Title>
              <div className="flex flex-col gap-1">
                <Subtitle>Author(s)</Subtitle>
                <TextInput
                  placeholder="Authors"
                  value={context.set.author}
                  onValueChange={(value) => {
                    props.send({
                      type: "updateAuthor",
                      params: {
                        author: value,
                      },
                    });
                  }}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Subtitle>Year Created</Subtitle>
                <Select
                  value={
                    context.set.createdYear === 0
                      ? undefined
                      : context.set.createdYear.toString()
                  }
                  onValueChange={(value) => {
                    const year = parseInt(value, 10);
                    if (year) {
                      props.send({
                        type: "updateCreatedYear",
                        params: {
                          year,
                        },
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year Created" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from(
                      new Array(CurrentYear - EarliestYear),
                      (_, index) => {
                        const year = CurrentYear - index;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      },
                    )}
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-fit"
                onClick={() => setIsSettingsOpen(false)}
              >
                Done
              </Button>
            </Flex>
          </DialogPanel>
        </Dialog>
      )}
    </>
  );
}
