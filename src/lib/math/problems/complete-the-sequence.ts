import { Problem } from "@/src/lib/math/math-types";
import { randomInt } from "@/src/lib/math/utils";

export function completeTheSequence(problem: Problem) {
  const isAddition = Math.random() > 0.5;
  const terms = [];
  let termCount;
  let answer = 0;
  if (isAddition) {
    termCount = randomInt(20, 100);
    const number = randomInt(-30, 30, 0, 1, -1);
    const start = randomInt(3, 20);
    for (let i = 1; i <= termCount; i++) {
      terms.push(start + number * i);
    }
    answer = terms[terms.length - 1];
  } else {
    termCount = randomInt(7, 10);
    const number = randomInt(-4, 5, 0, 1);
    const start = randomInt(3, 20);
    for (let i = 1; i <= termCount; i++) {
      terms.push(start * number ** i);
    }
    answer = terms[terms.length - 1];
  }
  problem.question = `Find the ${termCount}th term in the sequence [${terms
    .slice(0, 6)
    .join(", ")}]`;
  problem.answers.push(answer.toString());
  return problem;
}
