import { Problem } from "@/src/lib/math/math-types";
import { randomInt } from "@/src/lib/math/utils";
import nerdamer from "nerdamer";

export function polyRoots(problem: Problem, degree: number) {
  problem.question = "Find the roots of the function\n";
  const roots = Array.from(new Array(degree), () => randomInt(-10, 10));
  let nerdString = "";
  for (let i = 0; i < roots.length; i++) {
    if (roots[i] < 0) {
      nerdString += `(x+${-roots[i]})`;
    } else {
      nerdString += `(x-${roots[i]})`;
    }
    if (!problem.answers.includes(roots[i].toString())) {
      problem.answers.push(`$${roots[i].toString()}$`);
    }
  }
  problem.question +=
    "$$" + nerdamer(nerdString).expand().toTeX().removeCdot() + "$$";
  return problem;
}
