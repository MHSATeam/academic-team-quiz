<script lang="ts" setup>
import { reactive, ref } from 'vue';
import nerdamer from "nerdamer";
type Problem = {
  type: ProblemType,
  question: string,
  answers: string[],
  answerType: AnswerType
}
enum AnswerType {
  Any,
  AllOrdered,
  AnyOrder
}

// ADD TO DEFAULT LIST ASWELL!!!!
enum ProblemType {
  QuadRoots,
  CubicRoots,
  Simplify,
  VectorDistance,
  SlopeTwoPoint,
  Area,
  Volume,
  SurfaceArea,
  Perimeter,
  DotProduct,
  CompleteTheSequence,
  ParabolaVertices,
  BinaryConversion,
  HexConversion,
  Systems,
  ArithmeticMean,
  GeometricMean,
  HarmonicMean,
  TrigAngles
}
// ADD TO DEFAULT LIST ASWELL!!!!

const randomInt = (min: number = 0, max: number = 2, ...exclude: number[]) => {
  function getNumber() {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  var number = getNumber();
  var count = 0;
  while (exclude.includes(number) && count < 50) {
    number = getNumber();
    count++;
  }
  return number;
}

const generateProblems = (count: number, types: ProblemType[] = [], random: boolean = false): Problem[] => {
  if (count === 0) {
    return [];
  }
  if (types.length === 0) {
    types = [
      ProblemType.QuadRoots,
      ProblemType.CubicRoots,
      ProblemType.Simplify,
      ProblemType.VectorDistance,
      ProblemType.SlopeTwoPoint,
      ProblemType.Area,
      ProblemType.Volume,
      ProblemType.SurfaceArea,
      ProblemType.Perimeter,
      ProblemType.DotProduct,
      ProblemType.CompleteTheSequence,
      ProblemType.ParabolaVertices,
      ProblemType.BinaryConversion,
      ProblemType.HexConversion,
      ProblemType.Systems,
      ProblemType.ArithmeticMean,
      ProblemType.GeometricMean,
      ProblemType.HarmonicMean,
      ProblemType.TrigAngles
    ]
  }
  const problems = [];
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(((i / count) * types.length))];
    const problem = generateProblem(type);
    problems.push(problem);
  }
  if (random) {
    let currentIndex = problems.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [problems[currentIndex], problems[randomIndex]] = [
        problems[randomIndex], problems[currentIndex]];
    }
  }
  return problems;
}

const generateProblem = (type: ProblemType): Problem => {
  const problem: Problem = {
    type,
    question: "",
    answers: [],
    answerType: AnswerType.AnyOrder
  }
  class Vector {
    public x: number;
    public y: number;
    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
    public dot(vector: Vector) {
      return this.x * vector.x + this.y * vector.y;
    }
    public distanceString(vector: Vector) {
      return nerdamer(`sqrt((${this.x - vector.x})^2+(${this.y - vector.y})^2)`).expand().toTeX();
    }
    public static randomVector(min, max) {
      return new Vector(randomInt(min, max), randomInt(min, max));
    }
  }
  switch (type) {
    case ProblemType.CubicRoots:
    case ProblemType.QuadRoots: {
      problem.question = "Find the roots of the function\n";
      const roots = [randomInt(-10, 10), randomInt(-10, 10)];
      if (type === ProblemType.CubicRoots) {
        roots.push(randomInt(-10, 10));
      }
      var nerdString = "";
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
      console.log(nerdString);
      problem.question += "$$" + nerdamer(nerdString).expand().toTeX() + "$$";
      break;
    }
    case ProblemType.Area: {
      type Shape = {
        name: string,
        scalars: string[],
        variables: number
        formula: (...variable: number[]) => string
      };
      const shapes: Shape[] = [
        {
          name: "circle",
          scalars: ["radius"],
          variables: 1,
          formula: (radius) => {
            return nerdamer("pi*" + radius + "^2").toTeX();
          }
        },
        {
          name: "square",
          scalars: ["side length"],
          variables: 1,
          formula: (side) => {
            return nerdamer(side + "^2").toTeX();
          }
        },
        {
          name: "rectangle",
          scalars: ["width", "length"],
          variables: 2,
          formula: (width, length) => {
            return nerdamer(`${width} * ${length}`).toTeX();
          }
        },
        {
          name: "triangle",
          scalars: ["base", "height"],
          variables: 2,
          formula: (base, height) => {
            return nerdamer(`(1/2) * ${base} * ${height}`).toTeX();
          }
        },
        {
          name: "trapezoid",
          scalars: ["base 1", "base 2", "height"],
          variables: 3,
          formula: (base1, base2, height) => {
            return nerdamer(`((${base1} + ${base2}) / 2) * ${height}`).toTeX();
          }
        }
      ];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const invert = Math.random() > 0.5;
      if (shape.variables === 1) {
        const variable = randomInt(3, 25);
        const area = shape.formula(variable);
        if (invert) {
          problem.question = `Given an area of $${area}$ find the ${shape.scalars[0]} of a ${shape.name}`;
          problem.answers.push(variable.toString());
        } else {
          problem.question = `Given a ${shape.scalars[0]} of $${variable}$ find the area of a ${shape.name}`;
          problem.answers.push(area);
        }
      } else {
        const variables = new Array(shape.variables).fill(null).map(() => randomInt(3, 15));
        const area = shape.formula(...variables);
        if (invert) {
          const missingVar = Math.floor(Math.random() * variables.length);
          problem.question = `Given a ${shape.name} with an area of $${area}$, ${shape.scalars.map((v, i) => " a " + v + " of $" + variables[i] + "$").filter((_v, index) => index !== missingVar).join(", ").replace(/, ([^,]*)$/, ' and $1')} find it's ${shape.scalars[missingVar]}`;
          problem.answers.push(variables[missingVar].toString());
        } else {
          problem.question = `Given a ${shape.name} with${shape.scalars.map((v, i) => " a " + v + " of $" + variables[i] + "$").join(", ").replace(/, ([^,]*)$/, ' and $1')} find its area`;
          problem.answers.push(area);
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
        problem.question = `Convert $${type === ProblemType.BinaryConversion ? binary : hex}$ from ${type === ProblemType.BinaryConversion ? "binary" : "hex"} to decimal`;
        problem.answers.push(decimal);
      } else {
        problem.question = `Convert the decimal $${decimal}$ to ${type === ProblemType.BinaryConversion ? "binary" : "hex"}`;
        problem.answers.push(type === ProblemType.BinaryConversion ? binary : hex);
      }
      break;
    }
    case ProblemType.ParabolaVertices: {
      const x = randomInt(-10, 10);
      const y = randomInt(-10, 10);
      var a = randomInt(-3, 4, 0);

      const nerdString = `${a}*((x-(${x}))^2)+(${y})`;
      console.log(nerdString);
      const nerdTex = nerdamer(nerdString).expand().toTeX()

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
        termCount = randomInt(20, 100)
        const number = randomInt(-30, 30, 0, 1, -1);
        const start = randomInt(3, 20);
        for (let i = 1; i <= termCount; i++) {
          terms.push(start + (number * i));
        }
        answer = terms[terms.length - 1];
      } else {
        termCount = randomInt(7, 10);
        const number = randomInt(-4, 5, 0, 1);
        const start = randomInt(3, 20);
        for (let i = 1; i <= termCount; i++) {
          terms.push(start * (number ** i));
        }
        answer = terms[terms.length - 1];
      }
      problem.question = `Find the ${termCount}th term in the sequence [${terms.slice(0, 6).join(", ")}]`;
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
      problem.answers.push(distance);
    }
  }

  return problem;
}
const QUESTION_ROWS = 5;
const QUESTIONS_PER_ROW = 4;
const QUESTION_COUNT = QUESTION_ROWS * QUESTIONS_PER_ROW;
const ALLOWED_PROBLEM_TYPES = [
  ProblemType.Area,
  ProblemType.BinaryConversion,
  ProblemType.CubicRoots,
  ProblemType.DotProduct,
  ProblemType.HexConversion,
  ProblemType.ParabolaVertices,
  ProblemType.QuadRoots,
  ProblemType.VectorDistance,
];
const problemSet = generateProblems(QUESTION_COUNT, ALLOWED_PROBLEM_TYPES, true);
const answerShown = reactive(new Array(QUESTION_COUNT).fill(false));
type IndexedProblem = Problem & { index: number };
const displayMath = reactive(problemSet.reduce<IndexedProblem[][]>((arr: IndexedProblem[][], value: Problem, index: number) => {
  if (arr[arr.length - 1].length === QUESTIONS_PER_ROW) {
    arr.push([]);
  }
  arr[arr.length - 1].push({ ...value, index } as Problem & { index: number });
  return arr;
}, [[]]));
const TEX_OPTIONS = reactive({
  tex2jax: {
    inlineMath: [
      ["$", "$"],
    ],
    displayMath: [
      ["$$", "$$"],
    ],
    processEscapes: true,
    processEnvironments: true,
  },
});
</script>
<template>
  <main class="math">
    <h1>Computational Math <span style="color: #f44;">(BETA)</span></h1>
    <div class="row" v-for="problemRow in displayMath">
      <div class="question" v-for="problem in problemRow">
        <vue-mathjax :formula="problem.question" :options="TEX_OPTIONS" />
        <p class="correct-answer-text">{{
          problem.answerType === AnswerType.AllOrdered ? "Answers in order:" :
          (problem.answerType === AnswerType.Any) ? "Answers (only one needed):" : "Answer(s):"
        }}&nbsp;
          <button v-if="!answerShown[problem.index]" @click="() => {
            answerShown[problem.index] = true;
          }" class="show-answer"></button>
          <span v-show="answerShown[problem.index]"><vue-mathjax
              :formula="problem.answers.map((a) => '$' + a + '$').join(', ')" :options="TEX_OPTIONS" /></span>
        </p>
      </div>
    </div>
  </main>
</template>