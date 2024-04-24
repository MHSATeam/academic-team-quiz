"use client";

import DisplayFormattedText from "@/components/utils/DisplayFormattedText";
import QuestionInfoDialog from "@/components/utils/QuestionInfoDialog";
import QuizFinished from "@/components/utils/QuizFinished";
import { updateQuestionStatus } from "@/src/lib/quiz-sessions/update-question-status";
import { filterNotEmpty } from "@/src/utils/array-utils";
import { QuizSessionWithQuestions } from "@/src/utils/quiz-session-type-extension";
import { compareUserAnswer } from "@/src/utils/string-utils";
import {
  Button,
  CategoryBar,
  Flex,
  Metric,
  TextInput,
  Title,
} from "@tremor/react";
import { Undo2 } from "lucide-react";
import { useMemo, useState } from "react";

type WritingProps = {
  quizSession: QuizSessionWithQuestions;
};
export default function Writing(props: WritingProps) {
  // Initialize values from database
  const questions = useMemo(
    () =>
      props.quizSession.questionsTrackers
        .map(({ question }) => question)
        .filter(filterNotEmpty),
    [props.quizSession],
  );

  const { initialCorrect, initialIncorrect } = useMemo(
    () =>
      props.quizSession.questionsTrackers.reduce(
        (acc, tracker) => {
          if (!tracker.question) {
            return acc;
          }
          if (tracker.result === "Correct") {
            acc.initialCorrect.push(tracker.question.id);
          }
          if (tracker.result === "Incorrect") {
            acc.initialIncorrect.push(tracker.question.id);
          }
          return acc;
        },
        { initialCorrect: [], initialIncorrect: [] } as {
          initialCorrect: number[];
          initialIncorrect: number[];
        },
      ),
    [props.quizSession],
  );

  const [correctQuestions, setCorrectQuestions] = useState(initialCorrect);
  const [incorrectQuestions, setIncorrectQuestions] =
    useState(initialIncorrect);

  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [inAnswerState, setInAnswerState] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const currentQuestionIndex = useMemo(() => {
    return correctQuestions.length + incorrectQuestions.length;
  }, [correctQuestions, incorrectQuestions]);

  const currentQuestion = questions[currentQuestionIndex];

  function onSubmitAnswer(noAnswer = false) {
    if (noAnswer) {
      setCurrentAnswer("");
      setIsCorrect(false);
      setInAnswerState(true);
      return;
    }
    if (currentAnswer.trim().length > 0) {
      const isCorrect = compareUserAnswer(
        currentAnswer,
        currentQuestion.answer,
      );
      setIsCorrect(isCorrect);
      setInAnswerState(true);
    }
  }

  async function onConfirmAnswer(wasCorrect: boolean) {
    if (currentQuestion !== undefined) {
      const tracker = props.quizSession.questionsTrackers.find(
        ({ questionId }) => questionId === currentQuestion.id,
      );
      if (!tracker) {
        alert("Failed to save question response!");
        return;
      }
      setIsSaving(true);
      try {
        if (
          await updateQuestionStatus(
            tracker.id,
            wasCorrect ? "Correct" : "Incorrect",
          )
        ) {
          if (currentQuestionIndex === questions.length - 1) {
            const res = await fetch("/api/complete-quiz", {
              method: "POST",
              body: JSON.stringify({
                quizSessionId: props.quizSession.id,
              }),
              headers: {
                "Content-Type": "application/json",
              },
            });
            if (!res.ok) {
              alert("Failed to mark quiz as completed!");
              return;
            }
          }
          if (wasCorrect) {
            setCorrectQuestions((prev) => [...prev, currentQuestion.id]);
          } else {
            setIncorrectQuestions((prev) => [...prev, currentQuestion.id]);
          }
          setCurrentAnswer("");
          setIsCorrect(false);
          setInAnswerState(false);
        }
      } finally {
        setIsSaving(false);
      }
    }
  }

  async function undoQuestion() {
    const lastQuestion = questions[currentQuestionIndex - 1];
    if (lastQuestion) {
      const tracker = props.quizSession.questionsTrackers.find(
        ({ questionId }) => questionId === lastQuestion.id,
      );
      if (!tracker) {
        alert("Failed to undo question!");
        return;
      }
      setIsSaving(true);
      try {
        if (await updateQuestionStatus(tracker.id, "Incomplete")) {
          setIsCorrect(
            correctQuestions.findIndex((id) => lastQuestion.id === id) !== -1,
          );
          setCorrectQuestions((prev) =>
            prev.filter((id) => lastQuestion.id !== id),
          );
          setIncorrectQuestions((prev) =>
            prev.filter((id) => lastQuestion.id !== id),
          );
          setInAnswerState(true);
          setCurrentAnswer("Question Undone");
        }
      } finally {
        setIsSaving(false);
      }
    }
  }

  return (
    <main className="flex flex-col gap-4 p-8">
      <Flex flexDirection="col">
        <Title>
          {currentQuestionIndex} / {questions.length}
        </Title>
        <CategoryBar
          className="w-full"
          values={[
            (incorrectQuestions.length * 100) / questions.length,
            (correctQuestions.length * 100) / questions.length,
            ((questions.length - currentQuestionIndex) * 100) /
              questions.length,
          ]}
          colors={["red", "green", "neutral"]}
          showLabels={false}
        />
      </Flex>
      {currentQuestion ? (
        <>
          {currentQuestion.round?.alphabetRound && (
            <span className="text-lg text-slate-600 max-sm:text-lg dark:text-slate-400">
              Alphabet Round Letter:{" "}
              {currentQuestion.round.alphabetRound.letter}
            </span>
          )}
          {currentQuestion.round?.themeRound && (
            <span className="text-lg text-slate-600 max-sm:text-lg dark:text-slate-400">
              Part of a theme round:{" "}
              <p className="text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                {currentQuestion.round.themeRound.theme}
              </p>
            </span>
          )}
          <DisplayFormattedText
            className="text-xl text-tremor-content-strong dark:text-dark-tremor-content-strong"
            text={currentQuestion.question}
          />
          <Button
            color="gray"
            onClick={() => setIsInfoOpen(true)}
            className="md:w-fit"
          >
            Question Info
          </Button>
          <hr />
          {!inAnswerState && (
            <Flex flexDirection="col" className="gap-2">
              <TextInput
                value={currentAnswer}
                onValueChange={(newValue) => setCurrentAnswer(newValue)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSubmitAnswer();
                  }
                }}
                placeholder="Answer..."
                style={{
                  fontSize: "1.125rem",
                }}
              />
              <Flex className="gap-2">
                <Button
                  onClick={() => undoQuestion()}
                  disabled={isSaving}
                  color="gray"
                >
                  <Undo2 />
                </Button>
                <Button
                  onClick={() => {
                    onSubmitAnswer();
                  }}
                  className="grow"
                >
                  Submit
                </Button>
                <Button
                  color="gray"
                  onClick={() => {
                    onSubmitAnswer(true);
                  }}
                >
                  I don&apos;t know
                </Button>
              </Flex>
            </Flex>
          )}
          {inAnswerState && (
            <Flex flexDirection="col" className="gap-2">
              <Metric color={isCorrect ? "green" : "red"}>
                {isCorrect ? "Correct!" : "Not quite"}
              </Metric>
              {currentAnswer !== "" && (
                <Title color={isCorrect ? "green" : "red"}>
                  Your answer: {currentAnswer}
                </Title>
              )}
              <Title>
                Correct answer:{" "}
                <DisplayFormattedText
                  element="span"
                  text={currentQuestion.answer}
                />
              </Title>
              <Flex>
                {currentAnswer !== "" ? (
                  <Button
                    onClick={() => {
                      onConfirmAnswer(!isCorrect);
                    }}
                    disabled={isSaving}
                    variant="light"
                    color={isCorrect ? "red" : "green"}
                  >
                    Override, I was {isCorrect ? "wrong" : "right"}
                  </Button>
                ) : (
                  <div></div>
                )}
                <Button
                  onClick={() => {
                    onConfirmAnswer(isCorrect);
                  }}
                  disabled={isSaving}
                >
                  Next
                </Button>
              </Flex>
            </Flex>
          )}
          <QuestionInfoDialog
            open={isInfoOpen}
            setOpen={setIsInfoOpen}
            question={currentQuestion}
          />
        </>
      ) : (
        <QuizFinished quizType="Writing" />
      )}
    </main>
  );
}
