import { useEffect, useRef, useState } from "react";
import { Set, sets } from "../../api-lib/_set-list";
import QuestionBox from "./QuestionBox";
import SetPicker from "./SetPicker";

export default function QuizPage() {
  const [questions, setQuestions] = useState<
    { id: number; question: string; answer: string; quiet: boolean }[]
  >([]);
  const selectedSets = useRef<Set[]>(sets);
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
          sets: selectedSets.current,
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
        newArray.splice(prev.length - 2, 1, newQuestion);
        return newArray;
      });
    }
  };

  useEffect(() => {
    getNextQuestion().then((question) => {
      setQuestions([question]);
    });
  }, []);
  return (
    <>
      <main>
        {questions.map((question, index) => {
          return (
            <QuestionBox
              key={index}
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
            />
          );
        })}
        {questions.length === 0 && <h1 className="loading">Loading...</h1>}
      </main>
      <SetPicker
        onUpdateSets={(sets) => {
          selectedSets.current = sets;
          swapValue.current++;
          swapLastQuestion(swapValue.current);
        }}
      />
    </>
  );
}
