import { AnswerType, Problem } from "@/src/lib/math/math-types";
import { Vector } from "@/src/lib/math/utils";
import nerdamer from "nerdamer";

export function twoPointSlope(problem: Problem) {
  let point1: Vector | undefined = undefined,
    point2: Vector | undefined = undefined;
  while (
    point1 === undefined ||
    point2 === undefined ||
    point1.x === point2.x
  ) {
    point1 = Vector.randomVector(-15, 15);
    point2 = Vector.randomVector(-15, 15);
  }
  const slopeExpresion = nerdamer(
    `(${point1.y} - ${point2.y}) / (${point1.x} - ${point2.x})`,
  );
  const slopeFrac = slopeExpresion.expand().toTeX();
  const slopeAppr = (
    Math.round(parseFloat(slopeExpresion.toDecimal()) * 1000) / 1000
  ).toString();
  problem.question = `Given two points find the slope of the line that pass through both $${point1.toString()}$ and $${point2.toString()}$`;
  problem.answers.push("$" + slopeFrac + "$");
  if (slopeFrac !== slopeAppr) {
    problem.answerType = AnswerType.Any;
    problem.answers.push(`$${slopeAppr}$`);
  }
  return problem;
}
