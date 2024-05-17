import { Problem } from "@/src/lib/math/math-types";
import {
  generatePolynomial,
  randomInt,
  weightedRandomNumber,
} from "@/src/lib/math/utils";
import nerdamer from "nerdamer";
import "nerdamer/Calculus";
import "nerdamer/Solve";

type IntegralFunction = {
  equation: string;
  // ordered from least to greatest
  possibleBounds: string[];
};
const trigBounds = [
  "-2pi",
  "-pi",
  "-pi/2",
  "-pi/3",
  "-pi/4",
  "-pi/6",
  "0",
  "pi/6",
  "pi/4",
  "pi/3",
  "pi/2",
  "pi",
  "2pi",
  "3pi",
];
const functions: IntegralFunction[] = [
  {
    equation: "sin(x)",
    possibleBounds: trigBounds,
  },
  {
    equation: "cos(x)",
    possibleBounds: trigBounds,
  },
  {
    equation: "tan(x)",
    possibleBounds: trigBounds,
  },
  {
    equation: generatePolynomial(randomInt(2, 4)),
    possibleBounds: ["-2", "-1", "0", "1", "2", "3"],
  },
];

export function definiteIntegral(problem: Problem) {
  const chosenFunction =
    functions[weightedRandomNumber([0, 1, 2, 3], [4, 4, 1, 5])];
  const lowerBoundIndex = randomInt(
    0,
    chosenFunction.possibleBounds.length - 1,
  );
  const upperBoundIndex = randomInt(
    lowerBoundIndex + 1,
    chosenFunction.possibleBounds.length,
  );

  const lowerBound = chosenFunction.possibleBounds[lowerBoundIndex];
  const upperBound = chosenFunction.possibleBounds[upperBoundIndex];

  // const integral = nerdamer(
  //   `defint(${chosenFunction.equation}, ${lowerBound}, ${upperBound}, x)`
  // );
  const integral = nerdamer(`integrate(${chosenFunction.equation},x)`);
  problem.question = `Evaluate the definite integral $$\\int_{${nerdamer(
    lowerBound,
  )
    .toTeX()
    .removeCdot()}}^{${nerdamer(upperBound).toTeX().removeCdot()}} (${nerdamer(
    chosenFunction.equation,
  )
    .toTeX()
    .removeCdot()})\\,dx$$`;
  problem.answers = [
    `$${integral
      .sub("x", upperBound)
      .subtract(integral.sub("x", lowerBound))
      .expand()
      .toTeX()
      .removeCdot()}$`,
  ];
  return problem;
}
