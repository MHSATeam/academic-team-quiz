import {
  ALLOWED_PROBLEM_TYPES,
  AnswerType,
  Problem,
  ProblemType,
} from "./math-types";
import { twoDigitMultiplication } from "@/src/lib/math/problems/two-digit-multiplication";
import { polyRoots } from "@/src/lib/math/problems/poly-roots";
import { area2D } from "@/src/lib/math/problems/2d-area";
import { baseConversion } from "@/src/lib/math/problems/base-conversion";
import { parabolaVertices } from "@/src/lib/math/problems/parabola-vertices";
import { completeTheSequence } from "@/src/lib/math/problems/complete-the-sequence";
import { dotProduct } from "@/src/lib/math/problems/dot-product";
import { vectorDistance } from "@/src/lib/math/problems/vector-distance";
import { twoPointSlope } from "@/src/lib/math/problems/two-point-slope";
import { derivative } from "@/src/lib/math/problems/derivative";
import { definiteIntegral } from "@/src/lib/math/problems/definite-integral";
import { trigAngles } from "@/src/lib/math/problems/trig-angles";
import { trigFunctionValues } from "@/src/lib/math/problems/trig-function-values";
import { areaVolume3D } from "@/src/lib/math/problems/3d-area-volume";
import { playingCardProbability } from "@/src/lib/math/problems/playing-card-probability";

export const generateProblems = (
  count: number,
  types: ProblemType[] = [],
  random: boolean = false,
): Problem[] => {
  if (count === 0) {
    return [];
  }
  if (types.length === 0) {
    types = ALLOWED_PROBLEM_TYPES;
  }
  const problems = [];
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor((i / count) * types.length)];
    const problem = generateProblem(type);
    problems.push(problem);
  }
  if (random) {
    let currentIndex = problems.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [problems[currentIndex], problems[randomIndex]] = [
        problems[randomIndex],
        problems[currentIndex],
      ];
    }
  }
  return problems;
};

const generateProblem = (type: ProblemType): Problem => {
  const problem: Problem = {
    type,
    question: "",
    answers: [],
    answerType: AnswerType.AnyOrder,
  };
  switch (type) {
    case ProblemType.TwoDigitMultiplication: {
      return twoDigitMultiplication(problem);
    }
    case ProblemType.CubicRoots:
    case ProblemType.QuadRoots: {
      return polyRoots(problem, type === ProblemType.QuadRoots ? 2 : 3);
    }
    case ProblemType.Area: {
      return area2D(problem);
    }
    case ProblemType.HexConversion:
    case ProblemType.BinaryConversion: {
      return baseConversion(
        problem,
        type === ProblemType.HexConversion ? 16 : 2,
      );
    }
    case ProblemType.ParabolaVertices: {
      return parabolaVertices(problem);
    }
    case ProblemType.CompleteTheSequence: {
      return completeTheSequence(problem);
    }
    case ProblemType.DotProduct: {
      return dotProduct(problem);
    }
    case ProblemType.VectorDistance: {
      return vectorDistance(problem);
    }
    case ProblemType.SlopeTwoPoint: {
      return twoPointSlope(problem);
    }
    case ProblemType.Derivatives: {
      return derivative(problem);
    }
    case ProblemType.DefiniteIntegrals: {
      return definiteIntegral(problem);
    }
    case ProblemType.TrigAngles: {
      return trigAngles(problem);
    }
    case ProblemType.TrigFunctionValues: {
      return trigFunctionValues(problem);
    }
    case ProblemType.Volume:
    case ProblemType.SurfaceArea: {
      return areaVolume3D(problem, type === ProblemType.SurfaceArea);
    }
    case ProblemType.PlayingCardProbability: {
      return playingCardProbability(problem);
    }
  }

  return problem;
};
