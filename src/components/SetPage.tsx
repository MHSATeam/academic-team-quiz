import { QuestionSet } from "@/api-lib/_utils";
import { useEffect, useState } from "react";
import { displayNames } from "../setNames";
import { Set, sets } from "@/api-lib/_set-list";
import SetPicker from "./SetPicker";

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export default function SetPage() {
  const [selectedSets, setSelectedSets] = useState<Set[]>(sets);
  const [set, setSet] = useState<QuestionSet | null>(null);
  const [playerCount, setPlayerCount] = useState(2);

  const generateSet = async (playerCount: number, selectedSets: Set[]) => {
    const response = await fetch("/api/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sets: selectedSets,
        players: Math.max(1, Math.min(8, playerCount)),
      }),
    }).then((response) => response.json());
    setSet(response);
  };

  useEffect(() => {
    generateSet(playerCount, selectedSets);
  }, []);

  const catagories = [];
  if (set !== null) {
    catagories.push(
      ...Object.entries(set.catagories).sort(([a], [b]) => a.localeCompare(b))
    );
  }
  return (
    <>
      <div>
        {set !== null ? (
          <div>
            <h1>Catagory Round</h1>
            {catagories.map(([catagoryName, questions]) => {
              return (
                <div key={catagoryName} className="no-print-indent">
                  <h2>{displayNames[catagoryName.replace(/-\(.*\)/, "")]}</h2>
                  {questions.map((question, index) => {
                    return (
                      <div key={question.id} className="no-print-indent">
                        <h3 v-if="index !== catagory.length - 1">
                          Team {letters[index]}:
                        </h3>
                        <h3 v-else>Toss-up:</h3>
                        <p>{question.definition}</p>
                        <p>
                          <b>Answer:</b> {question.term}
                        </p>
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <h1>
              Alphabet Round{" "}
              <span className="no-print" style={{ color: "#f44" }}>
                (BETA)
              </span>
            </h1>
            <h2>Letter: {set.alphabetRound.letter}</h2>
            <ol className="indent">
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
          <div>
            <h1 className="loading">Loading...</h1>
          </div>
        )}
        <div className="set-generation no-print">
          <button
            onClick={() => {
              generateSet(playerCount, selectedSets);
            }}
            className="generate-button"
          >
            Regenerate Set
          </button>
          <div>
            <label htmlFor="player-count">Number of Teams</label>
            <input
              className="input"
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
                generateSet(newPlayerCount, selectedSets);
              }}
            />
          </div>
        </div>
      </div>
      <SetPicker
        onUpdateSets={(sets) => {
          setSelectedSets(sets);
          generateSet(playerCount, sets);
        }}
      />
    </>
  );
}
