import { Problem } from "@/src/lib/math/math-types";
import { randomInt } from "@/src/lib/math/utils";
import nerdamer from "nerdamer";

export function parabolaVertices(problem: Problem) {
  const x = randomInt(-10, 10);
  const y = randomInt(-10, 10);
  const a = randomInt(-3, 4, 0);

  const nerdString = `${a}*((x-(${x}))^2)+(${y})`;
  const nerdTex = nerdamer(nerdString).expand().toTeX().removeCdot();

  problem.question = `Find the vertex of the parabola $$${nerdTex}$$`;
  problem.answers.push(`$(${x}, ${y})$`);
  return problem;
}
