"use client";

import { updateQuestionStatus } from "@/src/lib/quiz-sessions/update-question-status";
import { filterNotEmpty } from "@/src/utils/array-utils";
import { QuizSessionWithQuestions } from "@/src/utils/quiz-session-type-extension";
import {
  compareUserAnswer,
  damerauLevDistance,
  damerauLevSimilarity,
} from "@/src/utils/string-utils";
import {
  Button,
  CategoryBar,
  Flex,
  Metric,
  ProgressBar,
  Text,
  TextInput,
  Title,
} from "@tremor/react";
import Link from "next/link";
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
    [props.quizSession]
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
        }
      ),
    [props.quizSession]
  );

  const [correctQuestions, setCorrectQuestions] = useState(initialCorrect);
  const [incorrectQuestions, setIncorrectQuestions] =
    useState(initialIncorrect);

  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isCorrect, setIsCorrect] = useState(false);
  const [inAnswerState, setInAnswerState] = useState(false);

  const currentQuestionIndex = useMemo(() => {
    return correctQuestions.length + incorrectQuestions.length;
  }, [correctQuestions, incorrectQuestions]);

  const currentQuestion = questions[currentQuestionIndex];

  function onSubmitAnswer() {
    if (currentAnswer.trim().length > 0) {
      const isCorrect = compareUserAnswer(
        currentAnswer,
        currentQuestion.answer
      );
      setIsCorrect(isCorrect);
      setInAnswerState(true);
    }
  }

  async function onConfirmAnswer(wasCorrect: boolean) {
    if (currentQuestion !== undefined) {
      const tracker = props.quizSession.questionsTrackers.find(
        ({ questionId }) => questionId === currentQuestion.id
      );
      if (!tracker) {
        alert("Failed to save question response!");
        return;
      }
      if (
        await updateQuestionStatus(
          tracker.id,
          wasCorrect ? "Correct" : "Incorrect"
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
          <span className="text-tremor-content-strong dark:text-dark-tremor-content-strong text-xl">
            {currentQuestion.question}
          </span>
          <hr />
          {!inAnswerState && (
            <Flex className="gap-2">
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
              <Button
                onClick={() => {
                  onSubmitAnswer();
                }}
              >
                Submit
              </Button>
            </Flex>
          )}
          {inAnswerState && (
            <Flex flexDirection="col" className="gap-2">
              <Metric color={isCorrect ? "green" : "red"}>
                {isCorrect ? "Correct!" : "Not quite"}
              </Metric>
              <Title color={isCorrect ? "green" : "red"}>
                Your answer: {currentAnswer}
              </Title>
              <Title>Correct answer: {currentQuestion.answer}</Title>
              <Flex>
                <Button
                  onClick={() => {
                    onConfirmAnswer(!isCorrect);
                  }}
                  variant="light"
                  color={isCorrect ? "red" : "green"}
                >
                  Override, I was {isCorrect ? "wrong" : "right"}
                </Button>
                <Button
                  onClick={() => {
                    onConfirmAnswer(isCorrect);
                  }}
                >
                  Next
                </Button>
              </Flex>
            </Flex>
          )}
        </>
      ) : (
        <>
          <Flex flexDirection="col">
            <Title>All Done!</Title>
            <Link href={"/study/quiz-session?type=Writing"}>
              <Button>Study Again?</Button>
            </Link>
          </Flex>
        </>
      )}
    </main>
  );
}
