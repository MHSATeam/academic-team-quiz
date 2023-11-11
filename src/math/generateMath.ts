import nerdamer from "nerdamer";
import "nerdamer/Calculus";
import "nerdamer/Solve";
import {
  ALLOWED_PROBLEM_TYPES,
  AnswerType,
  Problem,
  ProblemType,
} from "./math-types";
import {
  nthStringConvert,
  NumberBound,
  randomBool,
  randomInt,
  Shape3D,
  Shapes,
  Vector,
  weightedRandomNumber,
} from "./utils";

export const generateProblems = (
  count: number,
  types: ProblemType[] = [],
  random: boolean = false
): Problem[] => {
  if (count === 0) {
    return [];
  }
  if (types.length === 0) {
    types = ALLOWED_PROBLEM_TYPES;
  }
  const problems = [];
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor((i / count) * types.length)];
    const problem = generateProblem(type);
    problems.push(problem);
  }
  if (random) {
    let currentIndex = problems.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [problems[currentIndex], problems[randomIndex]] = [
        problems[randomIndex],
        problems[currentIndex],
      ];
    }
  }
  return problems;
};

const generateProblem = (type: ProblemType): Problem => {
  const problem: Problem = {
    type,
    question: "",
    answers: [],
    answerType: AnswerType.AnyOrder,
  };
  switch (type) {
    case ProblemType.TwoDigitMultiplication: {
      const a = randomInt(10, 99);
      const b = randomInt(10, 99);
      const product = a * b;
      problem.question = `Find the product of $${a}$ and $${b}$`;
      problem.answers.push(product.toString());
      break;
    }
    case ProblemType.CubicRoots:
    case ProblemType.QuadRoots: {
      problem.question = "Find the roots of the function\n";
      const roots = [randomInt(-10, 10), randomInt(-10, 10)];
      if (type === ProblemType.CubicRoots) {
        roots.push(randomInt(-10, 10));
      }
      let nerdString = "";
      for (let i = 0; i < roots.length; i++) {
        if (roots[i] < 0) {
          nerdString += `(x+${-roots[i]})`;
        } else {
          nerdString += `(x-${roots[i]})`;
        }
        if (!problem.answers.includes(roots[i].toString())) {
          problem.answers.push(roots[i].toString());
        }
      }
      problem.question += "$$" + nerdamer(nerdString).expand().toTeX() + "$$";
      break;
    }
    case ProblemType.Area: {
      type Shape = {
        name: string;
        scalars: string[];
        variables: number;
        formula: (...variable: number[]) => string;
      };
      const shapes: Shape[] = [
        {
          name: "circle",
          scalars: ["radius"],
          variables: 1,
          formula: (radius) => {
            return nerdamer("pi*" + radius + "^2").toTeX();
          },
        },
        {
          name: "square",
          scalars: ["side length"],
          variables: 1,
          formula: (side) => {
            return nerdamer(side + "^2").toTeX();
          },
        },
        {
          name: "rectangle",
          scalars: ["width", "length"],
          variables: 2,
          formula: (width, length) => {
            return nerdamer(`${width} * ${length}`).toTeX();
          },
        },
        {
          name: "triangle",
          scalars: ["base", "height"],
          variables: 2,
          formula: (base, height) => {
            return nerdamer(`(1/2) * ${base} * ${height}`).toTeX();
          },
        },
        {
          name: "trapezoid",
          scalars: ["first base", "second base", "height"],
          variables: 3,
          formula: (base1, base2, height) => {
            return nerdamer(`((${base1} + ${base2}) / 2) * ${height}`).toTeX();
          },
        },
      ];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const invert = Math.random() > 0.5;
      const variables = new Array(shape.variables)
        .fill(null)
        .map(() => randomInt(3, 25));
      const area = shape.formula(...variables);
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
      break;
    }
    case ProblemType.HexConversion:
    case ProblemType.BinaryConversion: {
      const number = randomInt(3, 256);
      const decimal = number.toString(10);
      const binary = number.toString(2);
      const hex = number.toString(16);
      const toDecimal = Math.random() > 0.5;
      if (toDecimal) {
        problem.question = `Convert $${
          type === ProblemType.BinaryConversion ? binary : hex
        }$ from ${
          type === ProblemType.BinaryConversion ? "binary" : "hex"
        } to decimal`;
        problem.answers.push(decimal);
      } else {
        problem.question = `Convert the decimal $${decimal}$ to ${
          type === ProblemType.BinaryConversion ? "binary" : "hex"
        }`;
        problem.answers.push(
          type === ProblemType.BinaryConversion ? binary : hex
        );
      }
      break;
    }
    case ProblemType.ParabolaVertices: {
      const x = randomInt(-10, 10);
      const y = randomInt(-10, 10);
      var a = randomInt(-3, 4, 0);

      const nerdString = `${a}*((x-(${x}))^2)+(${y})`;
      const nerdTex = nerdamer(nerdString).expand().toTeX();

      problem.question = `Find the vertex of the parabola $$${nerdTex}$$`;
      problem.answers.push(`(${x}, ${y})`);
      break;
    }
    case ProblemType.CompleteTheSequence: {
      const isAddition = Math.random() > 0.5;
      var termCount;
      var terms = [];
      var answer = 0;
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
      break;
    }
    case ProblemType.DotProduct: {
      const vector1 = Vector.randomVector(-15, 15);
      const vector2 = Vector.randomVector(-15, 15);
      const dotProduct = vector1.dot(vector2);
      problem.question = `Find the dot product: $$\\begin{bmatrix}${vector1.x}\\\\${vector1.y}\\end{bmatrix}\\cdot\\begin{bmatrix}${vector2.x}\\\\${vector2.y}\\end{bmatrix}$$`;
      problem.answers.push(dotProduct.toString());
      break;
    }
    case ProblemType.VectorDistance: {
      const vector1 = Vector.randomVector(-15, 15);
      const vector2 = Vector.randomVector(-15, 15);
      const distance = vector1.distanceString(vector2);
      problem.question = `Find the distance between $\\begin{bmatrix}${vector1.x}\\\\${vector1.y}\\end{bmatrix}$ and $\\begin{bmatrix}${vector2.x}\\\\${vector2.y}\\end{bmatrix}$`;
      problem.answers.push("$" + distance + "$");
      break;
    }
    case ProblemType.SlopeTwoPoint: {
      let point1: Vector | undefined = undefined,
        point2: Vector | undefined = undefined;
      while (
        point1 === undefined ||
        point2 === undefined ||
        point1.x === point2.x
      ) {
        point1 = Vector.randomVector(-15, 15);
        point2 = Vector.randomVector(-15, 15);
      }
      const slopeExpresion = nerdamer(
        `(${point1.y} - ${point2.y}) / (${point1.x} - ${point2.x})`
      );
      const slopeFrac = slopeExpresion.expand().toTeX();
      const slopeAppr = (
        Math.round(parseFloat(slopeExpresion.toDecimal()) * 1000) / 1000
      ).toString();
      problem.question = `Given two points find the slope of the line that pass through both $(${point1.x}, ${point1.y})$ and $(${point2.x}, ${point2.y})$`;
      problem.answers.push("$" + slopeFrac + "$");
      if (slopeFrac !== slopeAppr) {
        problem.answerType = AnswerType.Any;
        problem.answers.push(slopeAppr);
      }
      break;
    }
    case ProblemType.Derivatives: {
      const degree = randomInt(2, 5);
      const derivativeNumber = weightedRandomNumber([1, 2, 3], [70, 20, 10]);
      const coefficents = new Array(degree).fill(0).map(() => randomInt(-9, 9));
      if (coefficents[degree - 1] === 0) {
        coefficents[degree - 1] = 1;
      } else {
        coefficents[degree - 1] = Math.abs(coefficents[degree - 1]);
      }
      const equation = coefficents
        .map((coeff, power) => `(${coeff}*(x^${power + 1}))`)
        .join("+");
      const derivativePowerString =
        derivativeNumber !== 1 ? "^" + derivativeNumber : "";
      const nerdString =
        `\\dfrac{d${derivativePowerString}}{dx${derivativePowerString}}(` +
        nerdamer(equation).toTeX().removeCdot() +
        ")";
      problem.question = `Find the ${derivativeNumber}${nthStringConvert(
        derivativeNumber
      )} derivative. $$${nerdString}$$`;
      problem.answers = [
        `$${nerdamer
          .diff(equation, "x", derivativeNumber)
          .toTeX()
          .removeCdot()}$`,
      ];
      break;
    }
    case ProblemType.DefiniteIntegrals: {
      type IntegralFunction = {
        equation: string;
        // ordered from least to greatest
        possibleBounds: string[];
      };
      const trigBounds = [
        "-2pi",
        "-4pi/3",
        "-pi",
        "0",
        "pi/2",
        "pi",
        "2pi",
        "3pi",
        "4pi",
      ];
      const functions: IntegralFunction[] = [
        {
          equation: "sin(x)",
          possibleBounds: trigBounds,
        },
        {
          equation: "cos(x)",
          possibleBounds: trigBounds,
        },
        {
          equation: "x^2",
          possibleBounds: ["-2", "-1", "0", "1", "2", "3"],
        },
        {
          equation: "x^2+3",
          possibleBounds: ["0", "1", "2", "3"],
        },
      ];

      const chosenFunction = functions[randomInt(0, functions.length)];
      const lowerBoundIndex = randomInt(
        0,
        chosenFunction.possibleBounds.length - 1
      );
      const upperBoundIndex = randomInt(
        lowerBoundIndex + 1,
        chosenFunction.possibleBounds.length
      );

      const lowerBound = chosenFunction.possibleBounds[lowerBoundIndex];
      const upperBound = chosenFunction.possibleBounds[upperBoundIndex];

      const integral = nerdamer(
        `defint(${chosenFunction.equation}, ${lowerBound}, ${upperBound}, x)`
      );
      problem.question = `Evaluate the definite integral. $$\\int_{${nerdamer(
        lowerBound
      )
        .toTeX()
        .removeCdot()}}^{${nerdamer(upperBound)
        .toTeX()
        .removeCdot()}} ${nerdamer(chosenFunction.equation).toTeX()}\\,dx$$`;
      problem.answers = [`$${integral.evaluate().toTeX()}$`];
      break;
    }
    case ProblemType.TrigAngles: {
      const toRadians = randomBool();
      const angleBase = weightedRandomNumber([30, 45], [2, 1]);
      const multiplier = randomInt(1, 360 / angleBase + 1);
      const angle = angleBase * multiplier;
      const angleInRadians = nerdamer(`${angle} * (pi/180)`)
        .toTeX()
        .removeCdot();
      problem.question = `Convert $${toRadians ? angle : angleInRadians}$ to ${
        toRadians ? "radians" : "degrees"
      }.`;
      problem.answers = [`$${toRadians ? angleInRadians : angle}$`];
      break;
    }
    case ProblemType.TrigFunctionValues: {
      const functions = ["sin", "cos", "tan", "csc", "sec", "cot"];
      const commonAngles = [
        "0",
        "pi/6",
        "pi/4",
        "pi/3",
        "pi/2",
        "2pi/3",
        "3pi/4",
        "5pi/6",
        "pi",
      ];
      const chosenFunction =
        functions[weightedRandomNumber([0, 1, 2, 3, 4, 5], [4, 4, 4, 1, 1, 1])];
      const angle = commonAngles[randomInt(0, commonAngles.length)];
      let result = "\\infty";
      const equation = nerdamer(`${chosenFunction}(x)`).sub("x", angle);
      try {
        const nerdString = `${chosenFunction}(${angle})`;
        if (nerdString === "tan(0)") {
          result = "0";
        } else {
          result = nerdamer(nerdString).toTeX().removeCdot();
        }
      } catch (e) {
        console.log(equation.text());
      }
      problem.question = `Evaluate the expression. $$${equation
        .toTeX()
        .removeCdot()}$$`;
      problem.answers = [`$${result}$`];
      break;
    }
    case ProblemType.Volume:
    case ProblemType.SurfaceArea: {
      const shapeList = Object.values(Shapes);
      const shape: Shape3D = shapeList[randomInt(0, shapeList.length)];
      const isSurfaceArea = type === ProblemType.SurfaceArea;
      const equation = nerdamer(
        isSurfaceArea ? shape.surfaceAreaEquation : shape.volumeEquation
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
          variable.value.toString()
        );
        variableListString += `a ${variable.name} of $${variable.value}$`;
        if (i < variableValues.length - 2) {
          variableListString += ", ";
        } else if (i === variableValues.length - 2) {
          variableListString += ", and ";
        }
      }
      problem.question = `Find the ${
        isSurfaceArea ? "surface area" : "volume"
      } of a ${shape.name} with ${variableListString}`;
      problem.answers = [
        `$${nerdamer("simplify(" + subbedEquation.text() + ")")
          .toTeX()
          .removeCdot()}$`,
      ];
    }
  }

  return problem;
};
