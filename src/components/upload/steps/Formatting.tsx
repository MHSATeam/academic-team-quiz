import { StepComponentProps } from "@/components/pages/UploadSet";
import CanvasImage from "@/components/upload/CanvasImage";
import QuestionEditor from "@/components/upload/QuestionEditor";
import { EditorQuestion } from "@/src/utils/set-upload-utils";
import {
  Button,
  Dialog,
  DialogPanel,
  Flex,
  Metric,
  Subtitle,
  Tab,
  TabGroup,
  TabList,
  Title,
} from "@tremor/react";
import { ChevronLeft, CloudUpload } from "lucide-react";
import { useState } from "react";

export default function Formatting(props: StepComponentProps) {
  const [openQuestion, setOpenQuestion] = useState<EditorQuestion | null>(null);
  const [showingQuestionImages, setShowingQuestionImages] = useState(true);
  const questions = props.state.context.questions;
  const images = showingQuestionImages
    ? openQuestion?.questionImages
    : openQuestion?.answerImages;
  return (
    <>
      <Flex flexDirection="col" className="h-full gap-4 px-8">
        <Flex
          flexDirection="col"
          alignItems="start"
          className="gap-4 overflow-auto"
        >
          <Flex className="mb-4 gap-8">
            <Metric>Formatting</Metric>
            <div className="flex flex-col rounded-tremor-default border-l-4 border-tremor-brand-emphasis bg-tremor-brand-faint py-3 pl-4 pr-3 text-tremor-brand-emphasis dark:border-dark-tremor-brand-emphasis dark:bg-dark-tremor-brand-muted/70 dark:text-dark-tremor-brand-emphasis">
              <span>Checklist</span>
              <ul className="list-inside list-disc text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
                <li>
                  Check each question and answer for mistakes (missing space,
                  incorrect character, bad punctuation, etc).
                </li>
                <li>
                  Add bold, underline, and italic styling to each question and
                  answer.
                  <br />
                  Make sure the answer has the{" "}
                  <em>
                    <strong>required part</strong>
                  </em>{" "}
                  underlined and bolded.
                </li>
                <li>
                  Double check that the category is correct for each question.
                </li>
                <li>Decide if each math question is computational or not.</li>
              </ul>
              <span>Tips</span>
              <ul className="list-inside list-disc text-tremor-content-emphasis dark:text-dark-tremor-content-emphasis">
                <li>
                  You can refer back to the original text by clicking the image
                  icon on each question
                </li>
                <li>
                  As a general rule of thumb, if a math questions answer is a
                  number, it&apos;s a computational question
                </li>
              </ul>
            </div>
          </Flex>
          {questions.map((question, index) => {
            return (
              <QuestionEditor
                key={question.id}
                question={question}
                questionIndex={index}
                categories={props.categories}
                onOpenImages={(isQuestion) => {
                  setOpenQuestion(question);
                  setShowingQuestionImages(isQuestion);
                }}
                onUpdateQuestion={(newQuestion) => {
                  props.send({
                    type: "updateQuestion",
                    params: {
                      id: question.id,
                      question: newQuestion,
                    },
                  });
                }}
                onUpdateAnswer={(newAnswer) => {
                  props.send({
                    type: "updateQuestion",
                    params: {
                      id: question.id,
                      answer: newAnswer,
                    },
                  });
                }}
                onUpdateCategory={(newCategory) => {
                  props.send({
                    type: "updateQuestion",
                    params: {
                      id: question.id,
                      category: newCategory,
                    },
                  });
                }}
                onUpdateComputationFlag={(newValue) => {
                  props.send({
                    type: "updateQuestion",
                    params: {
                      id: question.id,
                      hideInFlashcards: newValue,
                    },
                  });
                }}
              />
            );
          })}
        </Flex>
        <Flex className="gap-2">
          <Button
            className="grow"
            color="gray"
            onClick={() => {
              setOpenQuestion(null);
              setShowingQuestionImages(true);
              props.send({
                type: "toSelectText",
              });
            }}
          >
            <div className="flex items-center gap-2">
              <ChevronLeft /> Return to Selection
            </div>
          </Button>
          <Button
            className="grow"
            color="blue"
            onClick={() => {
              setOpenQuestion(null);
              setShowingQuestionImages(true);
              props.send({
                type: "toUpload",
              });
            }}
          >
            <div className="flex items-center gap-2">
              Next Step: Upload <CloudUpload />
            </div>
          </Button>
        </Flex>
      </Flex>
      <Dialog
        open={openQuestion !== null}
        onClose={() => setOpenQuestion(null)}
      >
        {images && openQuestion && (
          <DialogPanel>
            <Flex flexDirection="col" className="gap-4">
              <Flex>
                <Title className="grow">
                  Selection Images Question #
                  {questions.indexOf(openQuestion) + 1}
                </Title>
                <TabGroup
                  className="w-fit"
                  index={showingQuestionImages ? 0 : 1}
                  onIndexChange={(index) =>
                    setShowingQuestionImages(index === 0)
                  }
                >
                  <TabList variant="solid">
                    <Tab value={"question"}>Question</Tab>
                    <Tab value={"answer"}>Answer</Tab>
                  </TabList>
                </TabGroup>
              </Flex>
              {images &&
                openQuestion &&
                images.map((imageData, index) => (
                  <CanvasImage
                    key={openQuestion.id + index}
                    imageData={imageData}
                  />
                ))}
              {images.length === 0 && (
                <Subtitle>
                  No selections could be shown!
                  <br />
                  This could be because you typed the{" "}
                  {showingQuestionImages ? "question" : "answer"} instead of
                  selecting it.
                </Subtitle>
              )}
            </Flex>
          </DialogPanel>
        )}
      </Dialog>
    </>
  );
}
