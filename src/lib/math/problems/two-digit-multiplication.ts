import { Problem } from "@/src/lib/math/math-types";
import { randomInt } from "@/src/lib/math/utils";

export function twoDigitMultiplication(problem: Problem) {
  const a = randomInt(10, 99);
  const b = randomInt(10, 99);
  const product = a * b;
  problem.question = `Find the product of $${a}$ and $${b}$`;
  problem.answers.push(`$${product.toString()}$`);
  return problem;
}
