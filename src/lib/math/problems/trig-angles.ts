import { Problem } from "@/src/lib/math/math-types";
import {
  randomBool,
  randomInt,
  weightedRandomNumber,
} from "@/src/lib/math/utils";
import nerdamer from "nerdamer";

export function trigAngles(problem: Problem) {
  const toRadians = randomBool();
  const angleBase = weightedRandomNumber([30, 45], [2, 1]);
  const multiplier = randomInt(1, 360 / angleBase + 1);
  const angle = angleBase * multiplier;
  const angleInRadians = nerdamer(`${angle} * (pi/180)`).toTeX().removeCdot();
  problem.question = `Convert $${toRadians ? angle : angleInRadians}$ to ${
    toRadians ? "radians" : "degrees"
  }`;
  problem.answers = [`$${toRadians ? angleInRadians : angle}$`];
  return problem;
}
