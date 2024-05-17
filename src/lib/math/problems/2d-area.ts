import { Problem } from "@/src/lib/math/math-types";
import { randomInt } from "@/src/lib/math/utils";
import nerdamer, { Expression } from "nerdamer";

type Shape = {
  name: string;
  scalars: string[];
  variables: number;
  formula: (...variable: number[]) => Expression;
};
const Shapes: Shape[] = [
  {
    name: "circle",
    scalars: ["radius"],
    variables: 1,
    formula: (radius) => {
      return nerdamer("pi*" + radius + "^2");
    },
  },
  {
    name: "square",
    scalars: ["side length"],
    variables: 1,
    formula: (side) => {
      return nerdamer(side + "^2");
    },
  },
  {
    name: "rectangle",
    scalars: ["width", "length"],
    variables: 2,
    formula: (width, length) => {
      return nerdamer(`${width} * ${length}`);
    },
  },
  {
    name: "triangle",
    scalars: ["base", "height"],
    variables: 2,
    formula: (base, height) => {
      return nerdamer(`(1/2) * ${base} * ${height}`);
    },
  },
  {
    name: "trapezoid",
    scalars: ["first base", "second base", "height"],
    variables: 3,
    formula: (base1, base2, height) => {
      return nerdamer(`((${base1} + ${base2}) / 2) * ${height}`);
    },
  },
];

export function area2D(problem: Problem) {
  const shape = Shapes[Math.floor(Math.random() * Shapes.length)];
  const invert = Math.random() > 0.5;
  const variables = new Array(shape.variables)
    .fill(null)
    .map(() => randomInt(3, 25));
  const area = shape
    .formula(...variables)
    .toTeX()
    .removeCdot();
  if (shape.variables === 1) {
    if (invert) {
      problem.question = `Given an area of $${area}$ find the ${shape.scalars[0]} of a ${shape.name}`;
      problem.answers.push(variables[0].toString());
    } else {
      problem.question = `Given a ${shape.scalars[0]} of $${variables[0]}$ find the area of a ${shape.name}`;
      problem.answers.push(`$${area}$`);
    }
  } else {
    if (invert) {
      const missingVar = Math.floor(Math.random() * variables.length);
      problem.question = `Given a ${
        shape.name
      } with an area of $${area}$, ${shape.scalars
        .map((v, i) => " a " + v + " of $" + variables[i] + "$")
        .filter((_v, index) => index !== missingVar)
        .join(", ")
        .replace(/, ([^,]*)$/, " and $1")} find it's ${
        shape.scalars[missingVar]
      }`;
      problem.answers.push(variables[missingVar].toString());
    } else {
      problem.question = `Given a ${shape.name} with${shape.scalars
        .map((v, i) => " a " + v + " of $" + variables[i] + "$")
        .join(", ")
        .replace(/, ([^,]*)$/, " and $1")} find its area`;
      problem.answers.push(`$${area}$`);
    }
  }
  return problem;
}
