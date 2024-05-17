import { useEffect, useState } from "react";
import {
  ALLOWED_PROBLEM_TYPES,
  Problem,
  ProblemType,
} from "@/src/lib/math/math-types";
import { generateProblems } from "@/src/lib/math/generateMath";
import { MathJaxContext } from "better-react-mathjax";
import MathProblem from "../../display/MathProblem";
import { ErrorBoundary } from "react-error-boundary";
import { MultiSelect, MultiSelectItem } from "@tremor/react";

const STARTING_QUESTION_COUNT = 20;

export default function MathPage() {
  const [problemSet, setProblemSet] = useState<Problem[]>([]);
  const [selectedProblemTypes, setSelectedProblemTypes] = useState<
    ProblemType[]
  >(() => {
    const loadedData = window.localStorage.getItem("math-types");
    if (loadedData) {
      try {
        const parsedData: ProblemType[] = JSON.parse(loadedData);
        const newTypes: ProblemType[] = parsedData.filter((type) =>
          ALLOWED_PROBLEM_TYPES.includes(type),
        );
        if (newTypes.length > 0) {
          return newTypes;
        }
      } catch (e) {
        /* empty */
      }
    }
    return [];
  });
  useEffect(() => {
    window.localStorage.setItem(
      "math-types",
      JSON.stringify(selectedProblemTypes),
    );
    setProblemSet(
      generateProblems(STARTING_QUESTION_COUNT, selectedProblemTypes, true),
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
        <main className="flex flex-col gap-4 px-6 py-12">
          <span className="text-2xl font-bold dark:text-white">
            Computational Math
          </span>
          <hr className="my-2" />
          <span className="text-xl dark:text-white">Options</span>
          <MultiSelect
            value={selectedProblemTypes}
            onValueChange={(problemList) => {
              setSelectedProblemTypes(problemList as ProblemType[]);
            }}
          >
            {ALLOWED_PROBLEM_TYPES.map((problemType) => {
              return (
                <MultiSelectItem key={problemType} value={problemType}>
                  {problemType}
                </MultiSelectItem>
              );
            })}
          </MultiSelect>
          <hr className="my-2" />
          <div className="flex flex-row flex-wrap items-stretch justify-center gap-4">
            {problemSet.map((problem, index) => {
              return (
                <MathProblem
                  key={JSON.stringify(problem) + index.toString()}
                  problem={problem}
                />
              );
            })}
          </div>
          <button
            className="my-3 rounded-md bg-gray-400 p-2 active:bg-gray-500 dark:bg-gray-600 dark:text-white dark:active:bg-gray-700"
            onClick={() => {
              setProblemSet(
                generateProblems(
                  STARTING_QUESTION_COUNT,
                  selectedProblemTypes,
                  true,
                ),
              );
            }}
          >
            Regenerate (Beware:{" "}
            <span className="text-red-500">
              This will remove the current problems
            </span>
            )
          </button>
        </main>
      </MathJaxContext>
    </ErrorBoundary>
  );
}
