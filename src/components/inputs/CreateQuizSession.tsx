"use client";

import CategorySelector from "@/components/inputs/CategorySelector";
import QuizTypes from "@/src/lib/quiz-sessions/quiz-types";
import { Category, QuizType, UserQuizSession } from "@prisma/client";
import {
  Button,
  Card,
  Dialog,
  DialogPanel,
  Flex,
  NumberInput,
  Subtitle,
  Tab,
  TabGroup,
  TabList,
  Title,
} from "@tremor/react";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export default function CreateQuizSession({
  defaultQuizType,
  defaultOpen,
  defaultCategories,
  categories,
}: {
  defaultQuizType?: QuizType;
  defaultOpen: boolean;
  defaultCategories: number[];
  categories: Category[];
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [quizType, setQuizType] = useState<QuizType>(
    defaultQuizType ?? "Flashcards",
  );
  const [categoryIds, setCategoryIds] = useState<number[]>(defaultCategories);
  const [questionCount, setQuestionCount] = useState(20);
  const [isCreatingQuiz, setIsCreatingQuiz] = useState(false);

  const isQuestionCountInvalid = useMemo(() => {
    return (
      questionCount < 10 || questionCount > 100 || Number.isNaN(questionCount)
    );
  }, [questionCount]);

  const isQuizValid = !isQuestionCountInvalid && categoryIds.length > 0;

  const createQuiz = useCallback(async () => {
    const res = await fetch("/api/create-quiz", {
      method: "POST",
      body: JSON.stringify({
        categories: categoryIds,
        type: quizType,
        numQuestions: questionCount,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      console.error(res);
      alert("Failed to create quiz!");
      return;
    }

    const { quizSession }: { quizSession: UserQuizSession } = await res.json();

    router.push(
      `/study/${quizSession.quizType.toLowerCase()}?id=${quizSession.id}`,
    );
  }, [categoryIds, questionCount, quizType, router]);

  return (
    <>
      <Dialog
        open={isOpen}
        onClick={(e) => {
          e.preventDefault();
        }}
        onClose={() => {
          setIsOpen(false);
        }}
      >
        <DialogPanel>
          <Flex>
            <Title>Start a new quiz</Title>
            <Button
              variant="light"
              onClick={() => {
                setIsOpen(false);
              }}
            >
              or continue one
            </Button>
          </Flex>
          <hr className="my-4" />
          <Subtitle className="mb-1">Categories</Subtitle>
          <CategorySelector
            className="mb-4"
            disabled={isCreatingQuiz}
            categories={categories}
            selectedCategories={categoryIds}
            setSelectedCategories={setCategoryIds}
          />
          <Subtitle className="mb-1">Type of Quiz</Subtitle>
          <TabGroup
            className="mb-4"
            index={QuizTypes.indexOf(quizType)}
            onIndexChange={(index) => {
              setQuizType(QuizTypes[index]);
            }}
          >
            <TabList variant="solid">
              {QuizTypes.map((type) => (
                <Tab
                  className="disabled:bg-slate-200 disabled:dark:bg-slate-700"
                  disabled={isCreatingQuiz || type === "Test"}
                  key={type}
                >
                  {type}
                </Tab>
              ))}
            </TabList>
          </TabGroup>
          <Subtitle className="mb-1"># of Questions</Subtitle>
          <NumberInput
            disabled={isCreatingQuiz}
            value={questionCount}
            onValueChange={(newValue) => {
              setQuestionCount(newValue);
            }}
            error={isQuestionCountInvalid}
            errorMessage="Question count must be between 10 and 100"
            step={5}
            min={10}
            max={100}
          />
          <Button
            disabled={isCreatingQuiz || !isQuizValid}
            className="mt-6"
            onClick={() => {
              if (isQuizValid) {
                setIsCreatingQuiz(true);
                createQuiz();
              }
            }}
          >
            {isCreatingQuiz ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" />
                <span>Creating</span>
              </span>
            ) : (
              "Start"
            )}
          </Button>
        </DialogPanel>
      </Dialog>
      <Card
        className="flex flex-col items-center justify-center gap-4 hover:bg-tremor-background-muted hover:dark:bg-dark-tremor-background-muted"
        role="button"
        onClick={() => {
          setIsOpen(true);
        }}
      >
        <Plus className="dark:text-white" />
        <Title>Start a new quiz!</Title>
      </Card>
    </>
  );
}
