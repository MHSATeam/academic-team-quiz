import { Loader2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import NewSetPicker, {
  convertSetLabelsToSetArray,
  DefaultSetLabels,
  SetLabel,
} from "./NewSetPicker";
import QuestionBox from "./QuestionBox";
import ScrollToTop from "./ScrollToTop";

export default function QuizPage() {
  const [questions, setQuestions] = useState<
    { id: number; question: string; answer: string; quiet: boolean }[]
  >([]);
  const [selectedSets, setSelectedSets] =
    useState<SetLabel[]>(DefaultSetLabels);
  const swapValue = useRef(0);
  const getNextQuestion = async (
    quiet: boolean = false,
    errorCount = 0
  ): Promise<{
    id: number;
    question: string;
    answer: string;
    quiet: boolean;
  }> => {
    const question = {
      id: 0,
      question: "",
      answer: "",
      quiet,
    };

    try {
      const response = await fetch("/api/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sets: convertSetLabelsToSetArray(selectedSets),
        }),
      }).then((response) => response.json());
      if (questions.find((q) => q.id === response.id)) {
        return getNextQuestion(quiet, errorCount + 0.5);
      }
      question.question = response.definition;
      question.id = response.id;
      question.answer = response.term;
    } catch (e) {
      console.error(e);
      if (errorCount < 3) {
        return getNextQuestion(quiet, errorCount + 1);
      } else {
        alert(
          "There was an error fetching the question. Please try again later."
        );
        throw new Error("Failed to fetch new question");
      }
    }
    return question;
  };
  const swapLastQuestion = async (swap: number) => {
    const newQuestion = await getNextQuestion(true);
    if (swap === swapValue.current) {
      setQuestions((prev) => {
        const newArray = [...prev];
        newArray.splice(prev.length - 1, 1, newQuestion);
        return newArray;
      });
    }
  };

  useEffect(() => {
    swapLastQuestion(++swapValue.current);
  }, [selectedSets]);
  return (
    <main className="mb-12">
      <NewSetPicker
        setList={selectedSets}
        onChange={(setList) => {
          if (setList.length > 0) {
            setSelectedSets([...setList]);
          }
        }}
      />
      {questions.map((question, index) => {
        const isLast = index + 1 === questions.length;
        return (
          <React.Fragment key={index}>
            <hr className="pb-4 mt-4 border-black" />
            <QuestionBox
              onNext={async () => {
                const newQuestion = await getNextQuestion();
                setQuestions((prev) => {
                  return [...prev, newQuestion];
                });
              }}
              question={question.question}
              answer={question.answer}
              questionId={question.id}
              quiet={question.quiet}
              isLastQuestion={isLast}
            />
          </React.Fragment>
        );
      })}
      {questions.length === 0 && (
        <span className="justify-center text-2xl flex gap-2">
          Loading
          <Loader2 className="animate-spin my-auto" />
        </span>
      )}
      <ScrollToTop />
    </main>
  );
}
