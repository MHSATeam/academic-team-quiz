import { QuestionSet } from "@/api-lib/utils";
import { useEffect, useRef, useState } from "react";
import { Set, sets } from "@/api-lib/set-list";
import SetPicker from "../SetPicker";
import { Loader2 } from "lucide-react";

const displayNames: { [key: string]: string } = {
  "american-government-and-economics": "American Government and Economics",
  "american-history": "American History",
  "american-literature": "American Literature",
  "fine-arts": "Fine Arts",
  geography: "Geography",
  "life-science": "Life Science",
  math: "Math",
  "physical-science": "Physical Science",
  "world-history": "World History",
  "world-literature": "World Literature",
};

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export default function SetPage() {
  const [set, setSet] = useState<QuestionSet | null>(null);
  const [playerCount, setPlayerCount] = useState(2);
  const [isLoading, setIsLoading] = useState(false);

  const swapValue = useRef(0);

  const generateSet = async (playerCount: number, swap: number) => {
    setIsLoading(true);
    const response = await fetch("/api/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sets,
        players: Math.max(1, Math.min(8, playerCount)),
      }),
    }).then((response) => response.json());
    if (swapValue.current === swap) {
      setSet(response);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (swapValue.current === 0) {
      generateSet(playerCount, ++swapValue.current);
    }
  }, []);

  const catagories = [];
  if (set !== null) {
    catagories.push(
      ...Object.entries(set.catagories).sort(([a], [b]) => a.localeCompare(b))
    );
  }
  return (
    <>
      {set !== null && !isLoading ? (
        <div className="flex flex-col">
          <span className="font-bold text-xl">Catagory Round</span>
          {catagories.map(([catagoryName, questions]) => {
            return (
              <div key={catagoryName} className="print:ml-0 ml-2 flex flex-col">
                <span className="font-semibold text-lg py-2">
                  {displayNames[catagoryName.replace(/-\(.*\)/, "")]}
                </span>
                <div className="flex flex-col gap-8">
                  {questions.map((question, index) => {
                    return (
                      <div
                        key={question.id}
                        className="print:ml-0 ml-2 flex flex-col gap-2"
                      >
                        <span className="font-semibold">
                          {index !== questions.length - 1
                            ? `Team ${letters[index]}:`
                            : "Toss-up:"}
                        </span>
                        <span className="">{question.definition}</span>
                        <p>
                          <b>Answer:</b> {question.term}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          <span className="font-bold text-xl pt-3">
            Alphabet Round{" "}
            <span className="no-print" style={{ color: "#f44" }}>
              (BETA)
            </span>
          </span>
          <span className="text-xl">
            Letter:{" "}
            <span className="font-bold">{set.alphabetRound.letter}</span>
          </span>
          <ol className="ml-2 flex flex-col gap-8 mt-4">
            {set.alphabetRound.questions.map((question) => {
              return (
                <li key={question.id} className="alphabet-questions">
                  <p>{question.definition}</p>
                  <p>
                    <b>Answer:</b> {question.term}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <span className="justify-center text-4xl flex gap-2 my-2">
          Loading
          <Loader2 size={36} className="animate-spin my-auto" />
        </span>
      )}
      <div className="print:hidden flex gap-4 my-4">
        <button
          onClick={() => {
            generateSet(playerCount, ++swapValue.current);
          }}
          className="p-2 bg-green-500 border-green-600 border-2 rounded-lg active:bg-green-600 text-lg grow"
        >
          Regenerate Set
        </button>
        <div className="flex flex-col">
          <label className="mb-2">Number of Teams</label>
          <input
            className="border-2 rounded-lg p-1 px-2"
            min="1"
            max="8"
            type="number"
            name="player-count"
            id="player-count"
            value={playerCount}
            onChange={(e) => {
              const newPlayerCount = Math.max(
                1,
                Math.min(8, e.target.valueAsNumber)
              );
              setPlayerCount(newPlayerCount);
            }}
          />
        </div>
      </div>
    </>
  );
}
