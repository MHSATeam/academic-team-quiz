import {
  StepComponentProps,
  TesseractScheduler,
} from "@/components/pages/management/UploadSet";
import PDFPage from "@/components/upload/PDFPage";
import {
  SelectedText,
  Selection,
  getTextFromSelection,
  getTextFromSelections,
} from "@/src/utils/selection-utils";
import { createQuestion } from "@/src/utils/set-upload-utils";
import { damerauLevSimilarity } from "@/src/utils/string-utils";
import { Category } from "@prisma/client";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionList,
  Button,
  Card,
  Dialog,
  DialogPanel,
  Flex,
  Subtitle,
  Text,
  Textarea,
  Title,
} from "@tremor/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/utils/PortalSelect";
import {
  ALargeSmall,
  CircleCheck,
  CircleEllipsis,
  CircleHelp,
  LucideIcon,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document } from "react-pdf";
import DisplayFormattedText from "@/components/utils/DisplayFormattedText";
import classNames from "classnames";
import useKeyboardEvent from "@/src/hooks/use-keyboard-event";

type SelectionTool = "question" | "answer" | "category";

const SelectionButtons: {
  [Tool in SelectionTool]: {
    name: string;
    hover: string;
    icon: LucideIcon;
  };
} = {
  question: {
    name: "Question",
    hover: "Select a question",
    icon: CircleHelp,
  },
  answer: {
    name: "Answer",
    hover: "Select an answer",
    icon: CircleCheck,
  },
  category: {
    name: "Category",
    hover: "Select the category",
    icon: CircleEllipsis,
  },
};

function setTextAreaHeight(textArea: HTMLTextAreaElement) {
  const computed = window.getComputedStyle(textArea);
  textArea.style.height = "auto";
  textArea.style.height = `${
    textArea.scrollHeight +
    parseInt(computed.paddingTop, 10) +
    parseInt(computed.paddingBottom, 10)
  }px`;
}

export default function SelectText(props: StepComponentProps) {
  const [numPages, setNumPages] = useState(0);
  const [question, setQuestion] = useState<SelectedText | null>(null);
  const [typedQuestion, setTypedQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState<SelectedText | null>(null);
  const [typedAnswer, setTypedAnswer] = useState<string | null>(null);
  const [tool, setTool] = useState<SelectionTool>("question");
  const [isPressingShift, setIsPressingShift] = useState(false);
  const [categoryId, setCategoryId] = useState(0);
  const [instructionsOpen, setInstructionsOpen] = useState(false);
  const [showInstructionsCallout, setInstructionsCallout] = useState(true);

  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  const answerInputRef = useRef<HTMLTextAreaElement>(null);

  const trueTool: SelectionTool = useMemo(() => {
    let trueTool = tool;
    if (isPressingShift && tool === "answer") {
      trueTool = "question";
    }
    if (isPressingShift && tool === "category") {
      trueTool = "answer";
    }
    return trueTool;
  }, [tool, isPressingShift]);

  const handleSelect = useCallback(
    (selection: Selection) => {
      switch (trueTool) {
        case "question": {
          setQuestion((prev) => {
            let question: SelectedText;
            if (prev === null) {
              question = {
                type: "question",
                selections: [],
              };
            } else {
              question = { ...prev };
            }
            question.selections = [...question.selections, selection];
            return question;
          });
          setTypedQuestion(null);
          setTool("answer");
          break;
        }
        case "answer": {
          setAnswer((prev) => {
            let answer: SelectedText;
            if (prev === null) {
              answer = {
                type: "answer",
                selections: [],
              };
            } else {
              answer = { ...prev };
            }
            answer.selections = [...answer.selections, selection];
            return answer;
          });
          setTypedAnswer(null);
          setTool("category");
          break;
        }
        case "category": {
          const text = getTextFromSelection(selection);
          let newCategory: Category | null = null;
          let maxSimilarity = 0;
          for (const category of props.categories) {
            const similarity = damerauLevSimilarity(category.name, text);
            if (similarity > maxSimilarity && similarity > 0.5) {
              newCategory = category;
              maxSimilarity = similarity;
            }
          }
          if (newCategory !== null) {
            setCategoryId(newCategory.id);
          }
          break;
        }
      }
    },
    [trueTool, props.categories],
  );

  const resetSelection = useCallback(() => {
    setQuestion(null);
    setAnswer(null);
    setTypedQuestion(null);
    setTypedAnswer(null);
    setTool("question");
  }, []);

  const canAddQuestion = useMemo(
    () =>
      (question || typedQuestion) &&
      (answer || typedAnswer) &&
      categoryId !== 0,
    [question, typedQuestion, answer, typedAnswer, categoryId],
  );

  const addQuestion = useCallback(() => {
    if (!canAddQuestion) {
      return;
    }
    const newQuestion = createQuestion();
    if (question) {
      newQuestion.question = getTextFromSelections(question, true);
      newQuestion.questionImages = question.selections.map(
        (selection) => selection.selectionImage,
      );
    } else {
      newQuestion.question = typedQuestion ?? "";
    }
    if (answer) {
      newQuestion.answer = getTextFromSelections(answer, false);
      newQuestion.answerImages = answer.selections.map(
        (selection) => selection.selectionImage,
      );
    } else {
      newQuestion.answer = typedAnswer ?? "";
    }
    newQuestion.question = newQuestion.question.trim();
    newQuestion.answer = newQuestion.answer.trim();

    const category = props.categories.find(
      (category) => category.id === categoryId,
    );
    if (category) {
      newQuestion.category = category;
    }
    props.send({
      type: "addQuestion",
      params: {
        question: newQuestion,
      },
    });
    resetSelection();
  }, [
    canAddQuestion,
    question,
    answer,
    props,
    resetSelection,
    typedQuestion,
    typedAnswer,
    categoryId,
  ]);

  useKeyboardEvent(
    useCallback(() => {
      resetSelection();
    }, [resetSelection]),
    "keyup",
    "Escape",
  );

  useKeyboardEvent(
    useCallback(
      (event: KeyboardEvent) => {
        if (
          event.type === "keyup" &&
          (questionInputRef.current !== document.activeElement ||
            question !== null) &&
          (answerInputRef.current !== document.activeElement || answer !== null)
        ) {
          addQuestion();
        }
      },
      [addQuestion, question, answer],
    ),
    ["keydown", "keyup"],
    "Enter",
  );

  useKeyboardEvent(
    useCallback((event) => {
      setIsPressingShift(event.shiftKey);
    }, []),
    ["keydown", "keyup"],
  );

  useEffect(() => {
    if (questionInputRef.current) {
      const textArea = questionInputRef.current;
      setTextAreaHeight(textArea);
    }
  }, [question]);

  useEffect(() => {
    if (answerInputRef.current) {
      const textArea = answerInputRef.current;
      setTextAreaHeight(textArea);
    }
  }, [answer]);

  const selections: SelectedText[] = [];
  if (question !== null) {
    selections.push(question);
  }
  if (answer !== null) {
    selections.push(answer);
  }

  const questionAccordions = props.state.context.questions.map(
    (question, index) => (
      <Accordion key={question.id}>
        <Flex alignItems="center">
          <AccordionHeader>
            <Title>Question #{index + 1}</Title>
          </AccordionHeader>
          <button
            className="mr-3 flex aspect-square items-center justify-center rounded-md text-red-500 hover:bg-red-300 dark:hover:bg-red-900"
            onClick={() => {
              props.send({
                type: "removeQuestion",
                params: {
                  questionId: question.id,
                },
              });
            }}
          >
            <X />
          </button>
        </Flex>
        <AccordionBody className="overflow-hidden">
          <Flex
            flexDirection="col"
            alignItems="stretch"
            className="gap-2 overflow-auto"
          >
            <Title>Category</Title>
            <Text>{question.category.name}</Text>
            <Title>Question</Title>
            <DisplayFormattedText
              className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
              element="div"
              text={question.question}
            />
            <Title>Answer</Title>
            <DisplayFormattedText
              className="text-tremor-default text-tremor-content dark:text-dark-tremor-content"
              element="div"
              text={question.answer}
            />
          </Flex>
        </AccordionBody>
      </Accordion>
    ),
  );

  return (
    <>
      <Flex
        justifyContent="center"
        className="gap-4 overflow-hidden"
        alignItems="start"
      >
        <div className="flex h-full w-1/4 shrink flex-col gap-2 overflow-hidden p-1">
          {showInstructionsCallout && (
            <div className="flex flex-col  rounded-tremor-default border-l-4 border-tremor-brand-emphasis bg-tremor-brand-faint py-3 pl-4 pr-3 text-tremor-default text-tremor-brand-emphasis dark:border-dark-tremor-brand-emphasis dark:bg-dark-tremor-brand-muted/70 dark:text-dark-tremor-brand-emphasis">
              <div className="tremor-Callout-header flex items-center justify-between">
                <h4 className="tremor-Callout-title font-semibold">
                  Not sure what to do?
                </h4>
                <button
                  onClick={() => setInstructionsCallout(false)}
                  className="rounded-md border border-transparent bg-opacity-10 text-red-500 hover:border-red-500"
                  title="Close Instructions"
                >
                  <X />
                </button>
              </div>
              <div className="mt-2">
                <Button onClick={() => setInstructionsOpen(true)}>
                  Open Instructions
                </Button>
              </div>
            </div>
          )}
          <Card className="flex flex-col gap-2">
            <Title>Selection Tools</Title>
            <Flex justifyContent="start" className="gap-2">
              {Object.entries(SelectionButtons).map(
                ([selectionTool, button]) => {
                  const Icon = button.icon;
                  return (
                    <Button
                      key={selectionTool}
                      title={button.hover}
                      color="neutral"
                      variant={
                        selectionTool === trueTool ? "primary" : "secondary"
                      }
                      onClick={() => {
                        setTool(selectionTool as SelectionTool);
                      }}
                    >
                      <Icon />
                    </Button>
                  );
                },
              )}
            </Flex>
          </Card>
          <Card className="flow-root overflow-hidden">
            <Flex
              flexDirection="col"
              className="h-full gap-2"
              justifyContent="start"
              alignItems="stretch"
            >
              <Title>Current Selection</Title>
              <Flex>
                <Subtitle>Question</Subtitle>
                {question && (
                  <button
                    title="Clear Selection"
                    className="flex aspect-square items-center justify-center rounded-md p-1 text-red-500 hover:bg-red-300 dark:hover:bg-red-900"
                    onClick={() => {
                      setQuestion(null);
                      setTool("question");
                    }}
                  >
                    <X />
                  </button>
                )}
              </Flex>
              <Flex className="overflow-hidden">
                <div className="block h-full grow overflow-auto">
                  <Textarea
                    value={
                      question !== null
                        ? getTextFromSelections(question, true, false)
                        : typedQuestion ?? ""
                    }
                    ref={questionInputRef}
                    disabled={question !== null}
                    onValueChange={(value) => {
                      setTypedQuestion(value ?? null);
                    }}
                    className={classNames("overflow-auto", {
                      "bg-emerald-200 hover:bg-emerald-300 dark:bg-emerald-600 hover:dark:bg-emerald-500":
                        trueTool === "question",
                    })}
                    placeholder="Type or select a question"
                  />
                </div>
              </Flex>
              <Flex>
                <Subtitle>Answer</Subtitle>
                {answer && (
                  <button
                    title="Clear Selection"
                    className="flex aspect-square items-center justify-center rounded-md p-1 text-red-500 hover:bg-red-300 dark:hover:bg-red-900"
                    onClick={() => {
                      setAnswer(null);
                      setTool("answer");
                    }}
                  >
                    <X />
                  </button>
                )}
              </Flex>
              <Flex className="overflow-hidden">
                <div className="block h-full grow overflow-auto">
                  <Textarea
                    value={
                      answer !== null
                        ? getTextFromSelections(answer, false, false)
                        : typedAnswer ?? ""
                    }
                    ref={answerInputRef}
                    disabled={answer !== null}
                    onValueChange={(value) => {
                      setTypedAnswer(value ?? null);
                    }}
                    className={classNames("overflow-auto", {
                      "bg-emerald-200 hover:bg-emerald-300 dark:bg-emerald-600 hover:dark:bg-emerald-500":
                        trueTool === "answer",
                    })}
                    placeholder="Type or select an answer"
                  />
                </div>
              </Flex>
              <Subtitle>Category</Subtitle>
              <Select
                value={categoryId === 0 ? undefined : categoryId.toString()}
                onValueChange={(value) => {
                  setCategoryId(parseInt(value) ?? 0);
                }}
              >
                <SelectTrigger
                  className={classNames("shrink-0", {
                    "bg-emerald-200 hover:bg-emerald-300 dark:bg-emerald-600 hover:dark:bg-emerald-500":
                      trueTool === "category",
                  })}
                >
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {props.categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={() => {
                  addQuestion();
                }}
                color="green"
                disabled={!canAddQuestion}
                className="mt-2"
              >
                Add Question
              </Button>
            </Flex>
          </Card>
        </div>
        <Document
          file={props.state.context.pdfFile}
          onLoadSuccess={({ numPages }) => {
            setNumPages(numPages);
          }}
          className="h-full overflow-auto border bg-white"
        >
          {Array.from(new Array(numPages), (_, index) => (
            <PDFPage
              key={index + 1}
              pageNumber={index + 1}
              ocrScheduler={TesseractScheduler}
              selections={selections}
              isPressingShift={isPressingShift}
              onSelect={handleSelect}
            />
          ))}
        </Document>
        <div className="flex h-full w-1/4 flex-col gap-2 overflow-hidden">
          <Title>Selected Questions</Title>
          {questionAccordions.length === 0 && (
            <Subtitle>No questions selected!</Subtitle>
          )}
          {questionAccordions.length > 1 ? (
            <AccordionList className="no-scrollbar overflow-auto">
              {questionAccordions}
            </AccordionList>
          ) : (
            <div className="no-scrollbar block grow overflow-auto">
              {questionAccordions}
            </div>
          )}
          <Button
            className="mt-auto"
            disabled={props.state.context.questions.length <= 0}
            onClick={() => {
              props.send({
                type: "toFormatting",
              });
            }}
          >
            <div className="flex items-center gap-2">
              Next Step: Formatting <ALargeSmall />
            </div>
          </Button>
        </div>
      </Flex>
      <Dialog open={instructionsOpen} onClose={setInstructionsOpen}>
        <DialogPanel>
          <Flex className="gap-2" flexDirection="col" alignItems="start">
            <Title>Instructions</Title>
            <Text>
              This is the first step of the upload process. <br /> Use the
              selection tools for question, answer and category by dragging a
              selection box over the text. Don&apos;t worry about formatting or
              any mistakes in the selection, those will be taken care of later.
              Once you&apos;ve selected every question, click next step.
            </Text>
            <Text>
              Tip: To select multiple parts of a question, hold{" "}
              <pre className="inline rounded-md bg-tremor-background-subtle p-1 dark:bg-dark-tremor-background-subtle">
                Shift
              </pre>{" "}
              to continue using the question select tool.
            </Text>
            <Button onClick={() => setInstructionsOpen(false)}>Got it!</Button>
          </Flex>
        </DialogPanel>
      </Dialog>
    </>
  );
}
