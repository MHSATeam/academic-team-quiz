import { Problem } from "@/src/lib/math/math-types";
import { Vector } from "@/src/lib/math/utils";

export function vectorDistance(problem: Problem) {
  const vector1 = Vector.randomVector(-15, 15);
  const vector2 = Vector.randomVector(-15, 15);
  const distance = vector1.distanceString(vector2);
  problem.question = `Find the distance between $${vector1.toString()}$ and $${vector2.toString()}$`;
  problem.answers.push(`$${distance.removeCdot()}$`);
  return problem;
}
