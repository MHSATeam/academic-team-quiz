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
      <main className="math">
        <h1>
          Computational Math{" "}
          <span className="no-print" style={{ color: "#f44" }}>
            (BETA)
          </span>
        </h1>
        <div className="grid">
          {problemSet.map((problem, index) => {
            return <MathProblem key={index} problem={problem} />;
          })}
        </div>
        <button
          className="load-button"
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
