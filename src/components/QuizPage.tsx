import { ArrowRight, Loader2 } from "lucide-react";
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
  const [selectedSets, setSelectedSets] = useState<SetLabel[]>(() => {
    const savedSetList = localStorage.getItem("setList");
    if (savedSetList) {
      const parsedSetList = JSON.parse(savedSetList);
      const newSets: SetLabel[] = [];
      let failure = false;
      if (parsedSetList instanceof Array) {
        for (const set of parsedSetList) {
          if (typeof set === "string") {
            const newLabel = DefaultSetLabels.find((setLabel) => {
              return setLabel.value === set;
            });
            if (newLabel !== undefined) {
              newSets.push(newLabel);
            } else {
              failure = true;
              break;
            }
          } else {
            failure = true;
            break;
          }
        }
      } else {
        failure = true;
      }
      if (!failure) {
        return newSets;
      } else {
        window.localStorage.removeItem("setList");
      }
    }
    return DefaultSetLabels;
  });
  const [autoNext, setAutoNext] = useState(() => {
    const storageItem = window.localStorage.getItem("autoNext");
    if (storageItem) {
      const newAutoNext = JSON.parse(storageItem);
      if (typeof newAutoNext === "boolean") {
        return newAutoNext;
      }
    }
    return false;
  });
  const [optionsOpen, setOptionsOpen] = useState(false);

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
    window.localStorage.setItem(
      "setList",
      JSON.stringify(selectedSets.map((label) => label.value))
    );
    swapLastQuestion(++swapValue.current);
  }, [selectedSets]);

  useEffect(() => {
    window.localStorage.setItem("autoNext", JSON.stringify(autoNext));
  }, [autoNext]);
  return (
    <main className="mb-12">
      <div className="flex flex-col border-2 rounded-lg grow shrink">
        <button
          className={
            "flex gap-2 p-2 text-lg font-bold" +
            (optionsOpen ? " border-b-2" : "")
          }
          onClick={() => {
            setOptionsOpen(!optionsOpen);
          }}
          tabIndex={-1}
        >
          <span className="my-auto">Options</span>
          <ArrowRight
            className={
              "transition-transform my-auto" + (optionsOpen ? " rotate-90" : "")
            }
          />
        </button>
        <div className="flex">
          <div
            className={
              "overflow-hidden transition-[max-height]" +
              (optionsOpen ? " max-h-screen" : " max-h-0")
            }
          >
            <NewSetPicker
              setList={selectedSets}
              onChange={(setList) => {
                if (setList.length > 0) {
                  setSelectedSets([...setList]);
                }
              }}
            />
            <div className="flex m-2 gap-2">
              <label htmlFor="auto-next">Auto Switch Question</label>
              <input
                className="p-2"
                id="auto-next"
                name="auto-next"
                type="checkbox"
                checked={autoNext}
                onChange={(event) => {
                  setAutoNext(event.target.checked);
                }}
              />
            </div>
          </div>
        </div>
      </div>
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
              autoNext={autoNext}
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
