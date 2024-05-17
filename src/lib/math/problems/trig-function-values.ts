import { Problem } from "@/src/lib/math/math-types";
import { randomInt, weightedRandomNumber } from "@/src/lib/math/utils";
import nerdamer from "nerdamer";

export function trigFunctionValues(problem: Problem) {
  const functions = ["sin", "cos", "tan", "csc", "sec", "cot"];
  const commonAngles = [
    "0",
    "pi/6",
    "pi/4",
    "pi/3",
    "pi/2",
    "2pi/3",
    "3pi/4",
    "5pi/6",
    "pi",
  ];
  const chosenFunction =
    functions[weightedRandomNumber([0, 1, 2, 3, 4, 5], [2, 2, 2, 1, 1, 1])];
  const angle = commonAngles[randomInt(0, commonAngles.length)];
  let result = "\\infty";
  const equation = nerdamer(`${chosenFunction}(x)`).sub("x", angle);
  try {
    const nerdString = `${chosenFunction}(${angle})`;
    if (nerdString === "tan(0)") {
      result = "0";
    } else if (nerdString !== "cot(0)") {
      result = nerdamer(nerdString).toTeX().removeCdot();
    }
  } catch (e) {
    /* empty */
  }
  problem.question = `Evaluate the expression $$${equation
    .toTeX()
    .removeCdot()}$$`;
  problem.answers = [`$${result}$`];
  return problem;
}
