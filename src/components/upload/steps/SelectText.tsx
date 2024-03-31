import {
  StepComponentProps,
  TesseractScheduler,
} from "@/components/pages/UploadSet";
import PDFPage from "@/components/upload/PDFPage";
import {
  SelectedText,
  Selection,
  getTextFromSelection,
  getTextFromSelections,
} from "@/src/utils/selection-utils";
import { createQuestion } from "@/src/utils/set-upload-utils";
import { damerauLevSimilarity } from "@/src/utils/string-utils";
import useKeyboardEvent from "@/src/utils/use-keyboard-event";
import { Category } from "@prisma/client";
import {
  Accordion,
  AccordionBody,
  AccordionHeader,
  AccordionList,
  Button,
  Card,
  Flex,
  Select,
  SelectItem,
  Subtitle,
  Text,
  Textarea,
  Title,
} from "@tremor/react";
import {
  CircleCheck,
  CircleEllipsis,
  CircleHelp,
  LucideIcon,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Document } from "react-pdf";

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
  const [isPressingMeta, setIsPressingMeta] = useState(false);
  const [categoryId, setCategoryId] = useState(0);

  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  const answerInputRef = useRef<HTMLTextAreaElement>(null);

  const trueTool: SelectionTool = useMemo(() => {
    let trueTool = tool;
    if (isPressingMeta && tool === "answer") {
      trueTool = "question";
    }
    if (isPressingMeta && tool === "category") {
      trueTool = "answer";
    }
    return trueTool;
  }, [tool, isPressingMeta]);

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
    [trueTool, props.categories]
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
    [question, typedQuestion, answer, typedAnswer, categoryId]
  );

  const addQuestion = useCallback(() => {
    if (!canAddQuestion) {
      return;
    }
    const newQuestion = createQuestion();
    if (question) {
      newQuestion.question = getTextFromSelections(question);
      newQuestion.questionImages = question.selections.map(
        (selection) => selection.selectionImage
      );
    } else {
      newQuestion.question = typedQuestion ?? "";
    }
    if (answer) {
      newQuestion.answer = getTextFromSelections(answer);
      newQuestion.answerImages = answer.selections.map(
        (selection) => selection.selectionImage
      );
    } else {
      newQuestion.answer = typedAnswer ?? "";
    }
    newQuestion.question = newQuestion.question.trim();
    newQuestion.answer = newQuestion.answer.trim();

    const category = props.categories.find(
      (category) => category.id === categoryId
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
    "Escape"
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
      [addQuestion, question, answer]
    ),
    ["keydown", "keyup"],
    "Enter"
  );

  useKeyboardEvent(
    useCallback((event) => {
      setIsPressingMeta(event.metaKey);
    }, []),
    ["keydown", "keyup"]
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
        <AccordionHeader>
          <Flex alignItems="center">
            <Title>Question #{index + 1}</Title>
            <button
              className="flex aspect-square items-center justify-center text-red-500 dark:hover:bg-red-900 hover:bg-red-300 rounded-md"
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
        </AccordionHeader>
        <AccordionBody className="overflow-hidden">
          <Flex
            flexDirection="col"
            alignItems="stretch"
            className="gap-2 overflow-auto"
          >
            <Title>Category</Title>
            <Text>{question.category.name}</Text>
            <Title>Question</Title>
            <Text>{question.question}</Text>
            <Title>Answer</Title>
            <Text>{question.answer}</Text>
          </Flex>
        </AccordionBody>
      </Accordion>
    )
  );

  return (
    <Flex
      justifyContent="center"
      className="gap-4 overflow-hidden"
      alignItems="start"
    >
      <div className="flex flex-col gap-2 shrink w-1/4 h-full overflow-hidden p-1">
        <Title>Selection Tools</Title>
        <Flex justifyContent="start" className="gap-2">
          {Object.entries(SelectionButtons).map(([selectionTool, button]) => {
            const Icon = button.icon;
            return (
              <Button
                key={selectionTool}
                title={button.hover}
                color="neutral"
                variant={selectionTool === trueTool ? "primary" : "secondary"}
                onClick={() => {
                  setTool(selectionTool as SelectionTool);
                }}
              >
                <Icon />
              </Button>
            );
          })}
        </Flex>
        <Title>Current Selection</Title>
        <Card className="overflow-hidden flow-root">
          <Flex
            flexDirection="col"
            className="gap-2 h-full"
            justifyContent="start"
            alignItems="stretch"
          >
            <Title>Category</Title>
            <Select
              value={categoryId.toString()}
              onValueChange={(value) => {
                setCategoryId(parseInt(value) ?? 0);
              }}
            >
              {props.categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </Select>
            <Flex>
              <Title>Question</Title>
              {question && (
                <button
                  title="Clear Selection"
                  className="flex aspect-square items-center justify-center text-red-500 dark:hover:bg-red-900 hover:bg-red-300 rounded-md p-1"
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
              <div className="block h-full overflow-auto grow">
                <Textarea
                  value={
                    question !== null
                      ? getTextFromSelections(question)
                      : typedQuestion ?? undefined
                  }
                  ref={questionInputRef}
                  disabled={question !== null}
                  onValueChange={(value) => {
                    setTypedQuestion(value ?? null);
                  }}
                  className="overflow-auto"
                  placeholder="Type or select a question"
                />
              </div>
            </Flex>
            <Flex>
              <Title>Answer</Title>
              {answer && (
                <button
                  title="Clear Selection"
                  className="flex aspect-square items-center justify-center text-red-500 dark:hover:bg-red-900 hover:bg-red-300 rounded-md p-1"
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
              <div className="block h-full overflow-auto grow">
                <Textarea
                  value={
                    answer !== null
                      ? getTextFromSelections(answer)
                      : typedAnswer ?? ""
                  }
                  ref={answerInputRef}
                  disabled={answer !== null}
                  onValueChange={(value) => {
                    setTypedAnswer(value ?? null);
                  }}
                  className="overflow-auto"
                  placeholder="Type or select an answer"
                />
              </div>
            </Flex>
            <Button
              onClick={() => {
                addQuestion();
              }}
              color="green"
              disabled={!canAddQuestion}
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
            onSelect={handleSelect}
          />
        ))}
      </Document>
      <div className="flex flex-col w-1/4 h-full overflow-hidden gap-2">
        <Title>Selected Questions</Title>
        {questionAccordions.length === 0 && (
          <Subtitle>No questions selected!</Subtitle>
        )}
        {questionAccordions.length > 1 ? (
          <AccordionList className="overflow-auto no-scrollbar">
            {questionAccordions}
          </AccordionList>
        ) : (
          <div className="block grow overflow-auto no-scrollbar">
            {questionAccordions}
          </div>
        )}
        <Button
          className="mt-auto"
          onClick={() => {
            props.send({
              type: "toFormatting",
            });
          }}
        >
          Next Step: Formatting
        </Button>
      </div>
    </Flex>
  );
}
