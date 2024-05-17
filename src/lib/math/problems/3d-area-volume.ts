import { Problem } from "@/src/lib/math/math-types";
import { Shape3D, Shapes, randomInt } from "@/src/lib/math/utils";
import nerdamer from "nerdamer";

export function areaVolume3D(problem: Problem, surfaceArea: boolean) {
  const shapeList = Object.values(Shapes);
  const shape: Shape3D = shapeList[randomInt(0, shapeList.length)];
  const equation = nerdamer(
    surfaceArea ? shape.surfaceAreaEquation : shape.volumeEquation,
  );
  const variableValues = shape.variables.map((variableLetter, index) => {
    const bounds =
      shape.variableBounds instanceof Array
        ? shape.variableBounds[index]
        : shape.variableBounds;
    return {
      letter: variableLetter,
      name: shape.variableNames[index],
      value: randomInt(bounds),
    };
  });
  let subbedEquation = equation;
  let variableListString = "";
  for (let i = 0; i < variableValues.length; i++) {
    const variable = variableValues[i];
    subbedEquation = subbedEquation.sub(
      variable.letter,
      variable.value.toString(),
    );
    variableListString += `a ${variable.name} of $${variable.value}$`;
    if (i < variableValues.length - 2) {
      variableListString += ", ";
    } else if (i === variableValues.length - 2) {
      variableListString += ", and ";
    }
  }
  problem.question = `Find the ${
    surfaceArea ? "surface area" : "volume"
  } of a ${shape.name} with ${variableListString}`;
  problem.answers = [
    `$${nerdamer("simplify(" + subbedEquation.text() + ")")
      .toTeX()
      .removeCdot()}$`,
  ];
  return problem;
}
