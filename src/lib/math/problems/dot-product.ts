import { Problem } from "@/src/lib/math/math-types";
import { Vector } from "@/src/lib/math/utils";

export function dotProduct(problem: Problem) {
  const vector1 = Vector.randomVector(-15, 15);
  const vector2 = Vector.randomVector(-15, 15);
  const dotProduct = vector1.dot(vector2);
  problem.question = `Find the dot product $$\\begin{bmatrix}${vector1.x}\\\\${vector1.y}\\end{bmatrix}\\cdot\\begin{bmatrix}${vector2.x}\\\\${vector2.y}\\end{bmatrix}$$`;
  problem.answers.push(`$${dotProduct.toString()}$`);
  return problem;
}
