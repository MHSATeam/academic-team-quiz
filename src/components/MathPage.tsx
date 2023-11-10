import { useEffect, useState } from "react";
import { Problem, ProblemType } from "../math-types";
import { generateProblems } from "../generateMath";
import { MathJaxContext } from "better-react-mathjax";
import MathProblem from "./MathProblem";

const STARTING_QUESTION_COUNT = 20;
const NEW_LOAD_QUESTION_COUNT = 8;
const ALLOWED_PROBLEM_TYPES: ProblemType[] = [
  ProblemType.Area,
  ProblemType.BinaryConversion,
  ProblemType.CubicRoots,
  ProblemType.DotProduct,
  ProblemType.HexConversion,
  ProblemType.ParabolaVertices,
  ProblemType.QuadRoots,
  ProblemType.SlopeTwoPoint,
  ProblemType.VectorDistance,
  ProblemType.TwoDigitMultiplication,
];
export default function MathPage() {
  const [problemSet, setProblemSet] = useState<Problem[]>([]);
  useEffect(() => {
    setProblemSet(
      generateProblems(STARTING_QUESTION_COUNT, ALLOWED_PROBLEM_TYPES, true)
    );
  }, []);

  return (
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
      <main className="flex flex-col">
        <span className="text-2xl font-bold mb-4">
          Computational Math{" "}
          <span className="no-print" style={{ color: "#f44" }}>
            (BETA)
          </span>
        </span>
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
                  ALLOWED_PROBLEM_TYPES,
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
  );
}
