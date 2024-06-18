import { Problem } from "@/src/lib/math/math-types";
import { randomInt } from "@/src/lib/math/utils";

const baseNames: Record<number, string> = {
  2: "binary",
  16: "hex",
};

export function baseConversion(problem: Problem, base: number) {
  const number = randomInt(3, 256);
  const decimal = number.toString(10);
  const otherBase = number.toString(base);
  const toDecimal = Math.random() > 0.5;
  if (toDecimal) {
    problem.question = `Convert $${otherBase}$ from ${
      base in baseNames ? baseNames[base] : "base " + base
    } to decimal`;
    problem.answers.push(`$${decimal}$`);
  } else {
    problem.question = `Convert the decimal $${decimal}$ to ${
      base in baseNames ? baseNames[base] : "base " + base
    }`;
    problem.answers.push(`$${otherBase}$`);
  }

  return problem;
}
