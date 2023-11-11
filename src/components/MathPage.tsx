import { useEffect, useState } from "react";
import {
  ALLOWED_PROBLEM_TYPES,
  Problem,
  ProblemType,
} from "../math/math-types";
import { generateProblems } from "../math/generateMath";
import { MathJaxContext } from "better-react-mathjax";
import MathProblem from "./MathProblem";
import { ArrowRight } from "lucide-react";
import Select from "react-select";
import { ErrorBoundary } from "react-error-boundary";

const STARTING_QUESTION_COUNT = 20;
const NEW_LOAD_QUESTION_COUNT = 8;

const mapToSelectFormat = (problemType: ProblemType) => ({
  value: problemType,
  label: problemType,
});
const mapFromSelectFormat = (problemType: {
  value: ProblemType;
  label: ProblemType;
}) => problemType.value as ProblemType;

export default function MathPage() {
  const [problemSet, setProblemSet] = useState<Problem[]>([]);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [selectedProblemTypes, setSelectedProblemTypes] = useState<
    ProblemType[]
  >(() => {
    const loadedData = window.localStorage.getItem("math-types");
    if (loadedData) {
      try {
        const parsedData: ProblemType[] = JSON.parse(loadedData);
        const newTypes: ProblemType[] = parsedData.filter((type) =>
          ALLOWED_PROBLEM_TYPES.includes(type)
        );
        if (newTypes.length > 0) {
          return newTypes;
        }
      } catch (e) {}
    }
    return ALLOWED_PROBLEM_TYPES;
  });
  useEffect(() => {
    window.localStorage.setItem(
      "math-types",
      JSON.stringify(selectedProblemTypes)
    );
    setProblemSet(
      generateProblems(STARTING_QUESTION_COUNT, selectedProblemTypes, true)
    );
  }, [selectedProblemTypes]);

  return (
    <ErrorBoundary fallback={<span>Failed to render math page!</span>}>
      <MathJaxContext
        config={{
          tex: {
            inlineMath: [
              ["$", "$"],
              ["\\(", "\\)"],
            ],
            displayMath: [
              ["$$", "$$"],
              ["\\[", "\\]"],
            ],
          },
        }}
      >
        <main className="flex flex-col gap-4">
          <span className="text-2xl font-bold">
            Computational Math{" "}
            <span className="no-print" style={{ color: "#f44" }}>
              (BETA)
            </span>
          </span>
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
                  "transition-transform my-auto" +
                  (optionsOpen ? " rotate-90" : "")
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
                <Select
                  className="m-2"
                  isMulti
                  isClearable={false}
                  closeMenuOnSelect={false}
                  menuPortalTarget={document.body}
                  options={ALLOWED_PROBLEM_TYPES.map(mapToSelectFormat)}
                  value={selectedProblemTypes.map(mapToSelectFormat)}
                  onChange={(problemList) => {
                    if (problemList.length > 0) {
                      setSelectedProblemTypes(
                        problemList.map(mapFromSelectFormat)
                      );
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-row flex-wrap gap-4 justify-center">
            {problemSet.map((problem, index) => {
              return <MathProblem key={index} problem={problem} />;
            })}
          </div>
          <button
            className="p-2 my-3 bg-gray-400 rounded-md active:bg-gray-500"
            onClick={() => {
              setProblemSet((prev) => {
                return [
                  ...prev,
                  ...generateProblems(
                    NEW_LOAD_QUESTION_COUNT,
                    selectedProblemTypes,
                    true
                  ),
                ];
              });
            }}
          >
            Load more
          </button>
        </main>
      </MathJaxContext>
    </ErrorBoundary>
  );
}
