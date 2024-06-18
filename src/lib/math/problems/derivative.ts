import { Problem } from "@/src/lib/math/math-types";
import {
  generatePolynomial,
  nthStringConvert,
  randomInt,
  weightedRandomNumber,
} from "@/src/lib/math/utils";
import nerdamer from "nerdamer";
import "nerdamer/Calculus";
import "nerdamer/Solve";

export function derivative(problem: Problem) {
  const equation = generatePolynomial(randomInt(2, 5));
  const derivativeNumber = weightedRandomNumber([1, 2, 3], [70, 20, 10]);

  const derivativePowerString =
    derivativeNumber !== 1 ? "^" + derivativeNumber : "";
  const nerdString =
    `\\dfrac{d${derivativePowerString}}{dx${derivativePowerString}}(` +
    nerdamer(equation).toTeX().removeCdot() +
    ")";
  problem.question = `Find the ${derivativeNumber}${nthStringConvert(
    derivativeNumber,
  )} derivative $$${nerdString}$$`;
  problem.answers = [
    `$${nerdamer.diff(equation, "x", derivativeNumber).toTeX().removeCdot()}$`,
  ];
  return problem;
}
